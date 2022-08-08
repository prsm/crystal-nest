import { InjectDiscordClient, On } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Guild, GuildMember, GuildScheduledEvent, Permissions, Role, TextChannel, User } from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';

@Injectable()
export class EventsGateway {
  private readonly logger: Logger;
  private guild: Guild;
  private readonly eventCategoryId: string;
  private readonly archiveCategoryId: string;
  private readonly playerRoleId: string;
  private readonly memberRoleId: string;

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly configService: ConfigService
  ) {
    this.logger = new Logger(EventsGateway.name);
    this.client.guilds.fetch({ guild: this.configService.get<string>('discord.guildId') }).then(guild => {
      this.guild = guild;
    });
    this.eventCategoryId = this.configService.get<string>('discord.eventCategoryId');
    this.archiveCategoryId = this.configService.get<string>('discord.archiveCategoryId');
    this.playerRoleId = this.configService.get<string>('discord.playerRoleId');
    this.memberRoleId = this.configService.get<string>('discord.memberRoleId');
  }

  private async getEventChannel(eventName: string): Promise<TextChannel> {
    const channels = await this.guild.channels.fetch();
    eventName = eventName.toLocaleLowerCase().replaceAll(' ', '-');
    const found = channels.find(
      channel => channel.name === eventName && channel.parentId === this.eventCategoryId
    ) as TextChannel;

    this.logger.log(found ? `Found event with name ${found.name}` : `Didn't event role`);
    return found;
  }

  private async getEventRole(eventName: string): Promise<Role> {
    const found = await this.guild.roles.cache.find(role => role.name === eventName);

    this.logger.log(found ? `Found role with name ${found.name}` : `Didn't find role`);
    return found;
  }

  private getGuildMember(userId: string): GuildMember {
    const resolved = this.guild.members.resolve(userId);
    this.logger.log(`Successfully resolved user with name ${resolved.displayName}`);
    return resolved;
  }

  private async getOrCreateChannel(event: GuildScheduledEvent, roleId: string): Promise<TextChannel> {
    const channel = await this.getEventChannel(event.name);
    if (channel) {
      this.logger.log(`Found channel ${channel.name}`);
      return channel;
    } else {
      this.logger.log(`Didn't find channel, creating new one`);
      const createdChannel = await this.guild.channels.create(event.name, {
        topic: event.description,
        type: ChannelTypes.GUILD_TEXT,
        parent: this.eventCategoryId,
        permissionOverwrites: [
          {
            id: this.guild.id,
            deny: [Permissions.FLAGS.VIEW_CHANNEL]
          },
          {
            id: roleId,
            allow: [Permissions.FLAGS.VIEW_CHANNEL]
          }
        ]
      });

      this.logger.log(`Sucessfully created channel ${createdChannel.name}`);
      return createdChannel;
    }
  }

  private async getOrCreateRole(eventName: string): Promise<Role> {
    const role = await this.getEventRole(eventName);
    if (role) {
      this.logger.log(`Found role ${role.name}`);
      return role;
    } else {
      const createdRole = await this.guild.roles.create({ name: eventName });
      this.logger.log(`Successfully created role ${createdRole.name}`);
      return createdRole;
    }
  }

  @On('guildScheduledEventCreate')
  async onCreate(event: GuildScheduledEvent): Promise<void> {
    const role = await this.getOrCreateRole(event.name);
    const channel = await this.getOrCreateChannel(event, role.id);

    const member = this.getGuildMember(event.creatorId);
    member.roles.add(role.id);
    channel.send(`Event ${event.name} created successfully.\nInvite your friends with this link: ${event.url}`);
    this.logger.log(`Event ${event.name} created successfully`);
  }

  @On('guildScheduledEventUpdate')
  async onUpdate(oldEvent: GuildScheduledEvent, newEvent: GuildScheduledEvent): Promise<void> {
    if (newEvent.isCompleted()) {
      return this.onDelete(newEvent);
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

  @On('guildScheduledEventDelete')
  async onDelete(event: GuildScheduledEvent): Promise<void> {
    const channel = await this.getEventChannel(event.name);
    await channel.edit({
      parent: this.archiveCategoryId,
      permissionOverwrites: [
        { id: this.playerRoleId, allow: [Permissions.FLAGS.VIEW_CHANNEL] },
        { id: this.memberRoleId, allow: [Permissions.FLAGS.VIEW_CHANNEL] },
        { id: this.guild.id, deny: [Permissions.FLAGS.SEND_MESSAGES] }
      ]
    });

    const role = await this.getEventRole(event.name);
    role.delete();

    this.logger.log(`Event ${event.name} deleted successfully`);
  }

  async delay(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms));
  }

  @On('guildScheduledEventUserAdd')
  async onUserAdd(event: GuildScheduledEvent, user: User): Promise<void> {
    let role: Role;
    if (!event.userCount) {
      await this.delay(10000);
      role = await this.getEventRole(event.name);
    } else {
      role = await this.getEventRole(event.name);
    }

    const member = this.getGuildMember(user.id);
    await member.roles.add(role.id);
    this.logger.log(`${member.displayName} was added to Event ${event.name} successfully`);
  }

  @On('guildScheduledEventUserRemove')
  async onUserRemove(event: GuildScheduledEvent, user: User): Promise<void> {
    const role = await this.getEventRole(event.name);
    const member = this.getGuildMember(user.id);
    await member.roles.remove(role.id);
    this.logger.log(`${member.displayName} was removed from Event ${event.name} successfully`);
  }
}
