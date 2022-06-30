import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { BotGateway } from './bot.gateway';
import { ChannelsGateway } from './channels/channels.gateway';
import { LockChannelCommand } from './channels/lock-channel.command';
import { DynamicRolesModule } from './dynamic-roles/dynamic-roles.module';
import { EventsGateway } from './events/events.gateway';

@Module({
  imports: [DiscordModule.forFeature(), DynamicRolesModule],
  providers: [BotGateway, EventsGateway, ChannelsGateway, LockChannelCommand]
})
export class BotModule {}
