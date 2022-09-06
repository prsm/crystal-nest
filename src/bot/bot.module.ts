import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { BotGateway } from './bot.gateway';
import { ChannelsModule } from './channels/channels.module';
import { DynamicRolesModule } from './dynamic-roles/dynamic-roles.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [DiscordModule.forFeature(), DynamicRolesModule, EventsModule, ChannelsModule],
  providers: [BotGateway]
})
export class BotModule {}
