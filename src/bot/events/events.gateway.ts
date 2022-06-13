import { InjectDiscordClient, On } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Guild, GuildMember, GuildScheduledEvent, Permissions, Role, TextChannel, User } from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';

@Injectable()
export class EventsGateway {
  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly configService: ConfigService
  ) {}

  private async getEventChannel(guild: Guild, eventName: string): Promise<TextChannel> {
    const channels = await guild.channels.fetch();
    eventName = eventName.toLocaleLowerCase().replaceAll(' ', '-');
    return channels.find(
      channel => channel.name === eventName && channel.parentId === this.configService.get('discord.eventCategoryId')
    ) as TextChannel;
  }

  private async getEventRole(guild: Guild, eventName: string): Promise<Role> {
    const roles = await guild.roles.fetch();
    return roles.find(role => role.name === eventName);
  }

  private getGuild(): Promise<Guild> {
    return this.client.guilds.fetch({ guild: this.configService.get('discord.guildId') });
  }

  private getGuildMember(guild: Guild, userId: string): GuildMember {
    return guild.members.resolve(userId);
  }

  private async getOrCreateChannel(guild: Guild, event: GuildScheduledEvent, roleId: string): Promise<TextChannel> {
    const channel = await this.getEventChannel(guild, event.name);
    if (channel) {
      return channel;
    } else {
      return guild.channels.create(event.name, {
        topic: event.description,
        type: ChannelTypes.GUILD_TEXT,
        parent: this.configService.get('discord.eventCategoryId'),
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [Permissions.FLAGS.VIEW_CHANNEL]
          },
          {
            id: roleId,
            allow: [Permissions.FLAGS.VIEW_CHANNEL]
          }
        ]
      });
    }
  }
  private async getOrCreateRole(guild: Guild, eventName: string): Promise<Role> {
    const role = await this.getEventRole(guild, eventName);
    if (role) {
      return role;
    } else {
      return guild.roles.create({ name: eventName });
    }
  }

  @On('guildScheduledEventCreate')
  async onCreate(event: GuildScheduledEvent): Promise<void> {
    const guild = await this.getGuild();
    const role = await this.getOrCreateRole(guild, event.name);
    const channel = await this.getOrCreateChannel(guild, event, role.id);

    const member = this.getGuildMember(guild, event.creatorId);
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

    const guild = await this.getGuild();
    const channel = await this.getEventChannel(guild, oldEvent.name);
    await channel.edit({
      name: newEvent.name,
      topic: newEvent.description
    });

    this.logger.log(`Event ${newEvent.name} updated successfully`);
  }

  @On('guildScheduledEventDelete')
  async onDelete(event: GuildScheduledEvent): Promise<void> {
    const guild = await this.getGuild();
    const channel = await this.getEventChannel(guild, event.name);
    await channel.edit({
      parent: this.configService.get('discord.archiveCategoryId'),
      permissionOverwrites: [
        { id: '959197425929683045', allow: [Permissions.FLAGS.VIEW_CHANNEL] },
        { id: '959193190068539443', allow: [Permissions.FLAGS.VIEW_CHANNEL] },
        { id: guild.id, deny: [Permissions.FLAGS.SEND_MESSAGES] }
      ]
    });

    const role = await this.getEventRole(guild, event.name);
    role.delete();

    this.logger.log(`Event ${event.name} deleted successfully`);
  }

  @On('guildScheduledEventUserAdd')
  async onUserAdd(event: GuildScheduledEvent, user: User): Promise<void> {
    const guild = await this.getGuild();
    const role = await this.getEventRole(guild, event.name);
    const member = this.getGuildMember(guild, user.id);
    await member.roles.add(role.id);
    this.logger.log(`${member.displayName} was added to Event ${event.name} successfully`);
  }

  @On('guildScheduledEventUserRemove')
  async onUserRemove(event: GuildScheduledEvent, user: User): Promise<void> {
    const guild = await this.getGuild();
    const role = await this.getEventRole(guild, event.name);
    const member = this.getGuildMember(guild, user.id);
    await member.roles.remove(role.id);
    this.logger.log(`${member.displayName} was added to Event ${event.name} successfully`);
  }
}
