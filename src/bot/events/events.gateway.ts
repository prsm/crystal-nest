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
    const found = channels.find(
      channel => channel.name === eventName && channel.parentId === this.configService.get('discord.eventCategoryId')
    ) as TextChannel;

    this.logger.log(`Found event with name ${found.name}`);
    return found;
  }

  private async getEventRole(guild: Guild, eventName: string): Promise<Role> {
    const roles = await guild.roles.fetch();
    const found = roles.find(role => role.name === eventName);

    this.logger.log(`Found role with name ${found.name}`);
    return found;
  }

  private async getGuild(): Promise<Guild> {
    const found = await this.client.guilds.fetch({ guild: this.configService.get('discord.guildId') });
    this.logger.log(`Found guild with name ${found.name}`);
    return found;
  }

  private getGuildMember(guild: Guild, userId: string): GuildMember {
    const resolved = guild.members.resolve(userId);
    this.logger.log(`Successfully resolved user with name ${resolved.displayName}`);
    return resolved;
  }

  private async getOrCreateChannel(guild: Guild, event: GuildScheduledEvent, roleId: string): Promise<TextChannel> {
    const channel = await this.getEventChannel(guild, event.name);
    if (channel) {
      this.logger.log(`Found channel ${channel.name}`);
      return channel;
    } else {
      this.logger.log(`Found channel ${channel.name}`);
      const createdChannel = await guild.channels.create(event.name, {
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

      this.logger.log(`Sucessfully created channel ${await createdChannel.name}`);
      return createdChannel;
    }
  }

  private async getOrCreateRole(guild: Guild, eventName: string): Promise<Role> {
    const role = await this.getEventRole(guild, eventName);
    if (role) {
      this.logger.log(`Found role ${role.name}`);
      return role;
    } else {
      const createdRole = await guild.roles.create({ name: eventName });
      this.logger.log(`Successfully created role ${createdRole.name}`);
      return createdRole;
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
        { id: this.configService.get('discord.playerRoleId'), allow: [Permissions.FLAGS.VIEW_CHANNEL] },
        { id: this.configService.get('discord.memberRoleId'), allow: [Permissions.FLAGS.VIEW_CHANNEL] },
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
    this.logger.log(`${member.displayName} was removed from Event ${event.name} successfully`);
  }
}
