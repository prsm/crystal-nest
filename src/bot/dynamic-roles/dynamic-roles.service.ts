import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamicRole } from '@prisma/client';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChannelType,
  Client,
  GuildChannel,
  GuildEmoji,
  GuildMember,
  GuildMemberRoleManager,
  GuildPremiumTier,
  HexColorString,
  PermissionsBitField,
  Role,
  roleMention,
  TextChannel,
  userMention
} from 'discord.js';

import { GuildService } from '../guild.service';
import { CreateDynamicRoleDto } from './dto/create-dynamic-role.dto';
import { UpdateDynamicRoleDto } from './dto/update-dynamic-role.dto';
import { DynamicRolesRepository } from './dynamic-roles.repository';

@Injectable()
export class DynamicRolesService extends GuildService {
  private readonly logger: Logger;

  constructor(
    @InjectDiscordClient()
    client: Client,
    configService: ConfigService,
    private readonly dynamicRolesRepository: DynamicRolesRepository
  ) {
    super(client, configService);
    this.logger = new Logger(DynamicRolesService.name);
  }

  async createButtonComponents(roleManager: GuildMemberRoleManager): Promise<ActionRowBuilder<ButtonBuilder>[]> {
    const roles = await this.findAll();
    const buttons: ButtonBuilder[] = [];
    for (const { name, guildEmojiId, roleId } of roles) {
      const button = new ButtonBuilder()
        .setLabel(name)
        .setEmoji(guildEmojiId)
        .setCustomId(name)
        .setStyle(roleManager.cache.some(role => role.id === roleId) ? ButtonStyle.Primary : ButtonStyle.Secondary);
      buttons.push(button);
    }
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    const buttonLength = buttons.length;
    for (let index = 0; index < Math.ceil(buttonLength / 5); index++) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      row.addComponents(...buttons.splice(0, 5));
      rows.push(row);
    }

    return rows;
  }

  async handleRoleChange(interaction: ButtonInteraction): Promise<string> {
    const { roleId, name } = await this.dynamicRolesRepository.findOneByName(interaction.customId);
    const member = interaction.member as GuildMember;
    if (member.roles.cache.some(role => role.id === roleId)) {
      await member.roles.remove(roleId);
      this.dynamicRolesRepository.removeSubscriber(name);
      return `Removed role ${roleMention(roleId)} from member ${userMention(member.id)}`;
    } else {
      await member.roles.add(roleId);
      this.dynamicRolesRepository.addSubscriber(name);
      return `Added the role ${roleMention(roleId)}  to member ${userMention(member.id)}`;
    }
  }

  async create(createdBy: string, createDynamicRoleDto: CreateDynamicRoleDto): Promise<DynamicRole> {
    const guild = await this.getGuild();
    const { channelId, name, shortDescription, color, guildEmojiId } = createDynamicRoleDto;
    let role: Role;
    let channel: TextChannel | GuildChannel;
    try {
      role = await this.createRole(name, color, guildEmojiId);

      if (channelId) {
        channel = await this.updateChannel(channelId, name, shortDescription, role.id);
      } else {
        channel = await this.createChannel(name, shortDescription, role.id);
      }

      // TODO: Update dashboard

      const dynamicRole = await this.dynamicRolesRepository.create(
        createdBy,
        createDynamicRoleDto,
        channel.id,
        role.id
      );
      return dynamicRole;
    } catch (error) {
      if (role) {
        await guild.roles.delete(role.id);
      }

      if (channel && !channelId) {
        await guild.channels.delete(channel.id);
      }

      throw error;
    }
  }

  async findAll(): Promise<DynamicRole[]> {
    return this.dynamicRolesRepository.findAll();
  }

  async update(updateDynamicRoleDto: UpdateDynamicRoleDto): Promise<DynamicRole> {
    const { name, newName, guildEmojiId, shortDescription, color } = updateDynamicRoleDto;
    const currentDynamicRole = await this.dynamicRolesRepository.findOneByName(name);
    await this.updateChannel(currentDynamicRole.channelId, newName || currentDynamicRole.name, shortDescription);

    await this.updateRole(
      currentDynamicRole.roleId,
      newName || currentDynamicRole.name,
      color || (currentDynamicRole.color as HexColorString),
      guildEmojiId || currentDynamicRole.guildEmojiId
    );

    return this.dynamicRolesRepository.update(updateDynamicRoleDto);
  }

  async delete(name: string): Promise<DynamicRole> {
    const { name: confirmedName, channelId, roleId } = await this.dynamicRolesRepository.findOneByName(name);
    const guild = await this.getGuild();
    await guild.roles.delete(roleId);
    await this.retireChannel(channelId, confirmedName);
    return this.dynamicRolesRepository.remove(name);
  }

  private async createChannel(name: string, topic: string, roleId: string): Promise<TextChannel> {
    const guild = await this.getGuild();
    const parent = this.getDynamicRolesCategoryId();
    return guild.channels.create<ChannelType.GuildText>({
      name,
      type: ChannelType.GuildText,
      topic,
      parent,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: roleId,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });
  }

  private async updateChannel(channelId: string, name: string, topic?: string, roleId?: string): Promise<GuildChannel> {
    const guild = await this.getGuild();
    const parent = this.getDynamicRolesCategoryId();
    return guild.channels.edit(channelId, {
      name,
      topic,
      parent,
      permissionOverwrites: roleId
        ? [
            {
              id: guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
              id: roleId,
              allow: [PermissionsBitField.Flags.ViewChannel]
            }
          ]
        : undefined
    });
  }

  private async getNewRolePosition(): Promise<number> {
    const guild = await this.getGuild();
    const dividerRoleId = this.getdynamicRolesDividerId();
    const dividerRole = guild.roles.cache.find(role => role.id === dividerRoleId);
    return dividerRole.position - 1;
  }
  private async getGuildEmoji(guildEmojiId: string): Promise<GuildEmoji> {
    const guild = await this.getGuild();
    return guild.premiumTier !== GuildPremiumTier.None && guild.premiumTier !== GuildPremiumTier.Tier1
      ? guild.emojis.cache.get(guildEmojiId)
      : undefined;
  }

  private async createRole(name: string, color: HexColorString, guildEmojiId: string): Promise<Role> {
    const guild = await this.getGuild();
    const position = await this.getNewRolePosition();
    const guildEmoji = await this.getGuildEmoji(guildEmojiId);
    return guild.roles.create({
      color,
      name,
      icon: guildEmoji,
      hoist: false,
      mentionable: true,
      position
    });
  }

  private async updateRole(
    roleId: string,
    name?: string,
    color?: HexColorString,
    guildEmojiId?: string
  ): Promise<Role> {
    const guild = await this.getGuild();
    const position = await this.getNewRolePosition();
    const guildEmoji = guildEmojiId ? await this.getGuildEmoji(guildEmojiId) : undefined;
    return guild.roles.edit(roleId, {
      color,
      name,
      icon: guildEmoji,
      hoist: false,
      mentionable: true,
      position
    });
  }

  private async retireChannel(channelId: string, name: string): Promise<GuildChannel> {
    const guild = await this.getGuild();
    const parent = this.getRetiredDynamicRolesCategoryId();
    return guild.channels.edit(channelId, {
      name,
      parent,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        },
        {
          id: this.getPlayerRoleId(),
          allow: [PermissionsBitField.Flags.ViewChannel],
          deny: [PermissionsBitField.Flags.SendMessages]
        },
        {
          id: this.getMemberRoleId(),
          allow: [PermissionsBitField.Flags.ViewChannel],
          deny: [PermissionsBitField.Flags.SendMessages]
        }
      ]
    });
  }
}
