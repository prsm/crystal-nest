import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { BotGateway } from './bot.gateway';
import { ChannelsModule } from './channels/channels.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [DiscordModule.forFeature(), EventsModule, ChannelsModule],
  providers: [BotGateway]
})
export class BotModule {}
