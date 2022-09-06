import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChannelType,
  Client,
  GuildMember,
  GuildScheduledEvent,
  PermissionsBitField,
  Role,
  TextChannel,
  User
} from 'discord.js';

import { GuildService } from '../guild.service';

@Injectable()
export class EventsService extends GuildService {
  private readonly logger: Logger;

  constructor(
    @InjectDiscordClient()
    client: Client,
    configService: ConfigService
  ) {
    super(client, configService);
    this.logger = new Logger(EventsService.name);
  }

  private async getEventChannel(eventName: string): Promise<TextChannel> {
    const guild = await this.getGuild();
    const channels = await guild.channels.fetch();
    eventName = eventName.toLocaleLowerCase().replaceAll(' ', '-');
    const found = channels.find(
      channel => channel.name === eventName && channel.parentId === this.getEventCategoryId()
    ) as TextChannel;

    this.logger.log(found ? `Found event with name ${found.name}` : `Didn't event role`);
    return found;
  }

  private async getEventRole(eventName: string): Promise<Role> {
    const guild = await this.getGuild();
    const found = guild.roles.cache.find(role => role.name === eventName);

    this.logger.log(found ? `Found role with name ${found.name}` : `Didn't find role`);
    return found;
  }

  private async getGuildMember(userId: string): Promise<GuildMember> {
    const guild = await this.getGuild();
    const resolved = guild.members.resolve(userId);
    this.logger.log(`Successfully resolved user with name ${resolved.displayName}`);
    return resolved;
  }

  private async getOrCreateChannel(event: GuildScheduledEvent, roleId: string): Promise<TextChannel> {
    const guild = await this.getGuild();
    const channel = await this.getEventChannel(event.name);
    if (channel) {
      this.logger.log(`Found channel ${channel.name}`);
      return channel;
    } else {
      this.logger.log(`Didn't find channel, creating new one`);
      const createdChannel = await guild.channels.create({
        name: event.name,
        topic: event.description,
        type: ChannelType.GuildText,
        parent: this.getEventCategoryId(),
        permissionOverwrites: [
          {
            id: this.getGuildId(),
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: roleId,
            allow: [PermissionsBitField.Flags.ViewChannel]
          }
        ]
      });

      this.logger.log(`Sucessfully created channel ${createdChannel.name}`);
      return createdChannel;
    }
  }

  private async getOrCreateRole(eventName: string): Promise<Role> {
    const guild = await this.getGuild();
    const role = await this.getEventRole(eventName);
    if (role) {
      this.logger.log(`Found role ${role.name}`);
      return role;
    } else {
      const createdRole = await guild.roles.create({ name: eventName });
      this.logger.log(`Successfully created role ${createdRole.name}`);
      return createdRole;
    }
  }

  private async delay(ms: number): Promise<void> {
    // TODO: Refactore so this isn't needed
    return new Promise(res => setTimeout(res, ms));
  }

  async handleOnCreate(event: GuildScheduledEvent): Promise<void> {
    const role = await this.getOrCreateRole(event.name);
    const channel = await this.getOrCreateChannel(event, role.id);
    const member = await this.getGuildMember(event.creatorId);
    member.roles.add(role.id);
    channel.send(`Event ${event.name} created successfully.\nInvite your friends with this link: ${event.url}`);
  }

  async handleOnUpdate(oldEvent: GuildScheduledEvent, newEvent: GuildScheduledEvent): Promise<void> {
    if (newEvent.isCompleted()) {
      return this.handleOnDelete(newEvent);
    }

    if (oldEvent.name === newEvent.name && oldEvent.description === newEvent.description) {
      return;
    }

    const channel = await this.getEventChannel(oldEvent.name);
    await channel.edit({
      name: newEvent.name,
      topic: newEvent.description
    });

    this.logger.log(`Event ${newEvent.name} updated successfully`);
  }

  async handleOnDelete(event: GuildScheduledEvent): Promise<void> {
    const channel = await this.getEventChannel(event.name);
    await channel.edit({
      parent: this.getArchiveCategoryId(),
      permissionOverwrites: [
        {
          id: this.getPlayerRoleId(),
          allow: [PermissionsBitField.Flags.ViewChannel],
          deny: [PermissionsBitField.Flags.SendMessages]
        },
        {
          id: this.getMemberRoleId(),
          allow: [PermissionsBitField.Flags.ViewChannel],
          deny: [PermissionsBitField.Flags.SendMessages]
        },
        {
          id: this.getGuildId(),
          deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        }
      ]
    });

    const role = await this.getEventRole(event.name);
    role.delete();

    this.logger.log(`Event ${event.name} deleted successfully`);
  }

  async handleOnUserAdd(event: GuildScheduledEvent, user: User): Promise<void> {
    if (!event.userCount) {
      await this.delay(10000);
    }

    const role = await this.getEventRole(event.name);
    const member = await this.getGuildMember(user.id);
    await member.roles.add(role.id);
    this.logger.log(`${member.displayName} was added to Event ${event.name} successfully`);
  }

  async handleOnUserRemove(event: GuildScheduledEvent, user: User): Promise<void> {
    const role = await this.getEventRole(event.name);
    const member = await this.getGuildMember(user.id);
    await member.roles.remove(role.id);
    this.logger.log(`${member.displayName} was removed from Event ${event.name} successfully`);
  }
}
