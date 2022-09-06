import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [EventsGateway, EventsService]
})
export class EventsModule {}
