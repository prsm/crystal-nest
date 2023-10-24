import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { BotGateway } from './bot.gateway';
import { EventsModule } from './events/events.module';

@Module({
  imports: [DiscordModule.forFeature(), EventsModule],
  providers: [BotGateway]
})
export class BotModule {}
