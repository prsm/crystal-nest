import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { BotGateway } from './bot.gateway';
import { EventsGateway } from './events/events.gateway';
import { TestCommand } from './test/test.command';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [BotGateway, TestCommand, EventsGateway]
})
export class BotModule {}
