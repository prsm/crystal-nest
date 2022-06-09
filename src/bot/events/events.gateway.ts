import { InjectDiscordClient, On } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GuildScheduledEvent } from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';

@Injectable()
export class EventsGateway {
  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly configService: ConfigService
  ) {}

  @On('guildScheduledEventCreate')
  async onCreate(event: GuildScheduledEvent): Promise<void> {
    const guild = await this.client.guilds.fetch({ guild: this.configService.get('discord.guildId') });
    const role = await guild.roles.create({ name: event.name });
    const channel = await guild.channels.create(event.name, {
      topic: event.description,
      type: ChannelTypes.GUILD_TEXT,
      parent: this.configService.get('discord.eventCategoryId'),
      permissionOverwrites: [
        {
          id: guild.id,
          deny: ['VIEW_CHANNEL']
        },
        {
          id: role.id,
          allow: ['VIEW_CHANNEL']
        }
      ]
    });

    const member = guild.members.resolve(event.creatorId);
    member.roles.add(role.id);
    this.logger.log(`Event ${event.name} created successfully`);
  }
}
