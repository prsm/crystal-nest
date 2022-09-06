import { On } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { GuildScheduledEvent, User } from 'discord.js';
import { EventsService } from './events.service';

@Injectable()
export class EventsGateway {
  private readonly logger: Logger;

  constructor(private readonly eventsService: EventsService) {
    this.logger = new Logger(EventsGateway.name);
  }

  @On('guildScheduledEventCreate')
  async onCreate(event: GuildScheduledEvent): Promise<void> {
    try {
      await this.eventsService.handleOnCreate(event);
      this.logger.log(`Event ${event.name} created successfully`);
    } catch (error) {
      this.logger.log(`Failed to create event ${event.name}`);
    }
  }

  @On('guildScheduledEventUpdate')
  async onUpdate(oldEvent: GuildScheduledEvent, newEvent: GuildScheduledEvent): Promise<void> {
    try {
      await this.eventsService.handleOnUpdate(oldEvent, newEvent);
      this.logger.log(`Event ${newEvent.name} updated successfully`);
    } catch (error) {
      this.logger.log(`Failed to update event ${oldEvent.name}`);
    }
  }

  @On('guildScheduledEventDelete')
  async onDelete(event: GuildScheduledEvent): Promise<void> {
    try {
      await this.eventsService.handleOnDelete(event);
      this.logger.log(`Event ${event.name} deleted successfully`);
    } catch (error) {
      this.logger.log(`Failed to delete event ${event.name}`);
    }
  }

  @On('guildScheduledEventUserAdd')
  async onUserAdd(event: GuildScheduledEvent, user: User): Promise<void> {
    try {
      await this.eventsService.handleOnUserAdd(event, user);
      this.logger.log(`${user.username} was added to Event ${event.name} successfully`);
    } catch (error) {
      this.logger.log(`Failed to add ${user.username} to Event ${event.name}`);
    }
  }

  @On('guildScheduledEventUserRemove')
  async onUserRemove(event: GuildScheduledEvent, user: User): Promise<void> {
    try {
      await this.eventsService.handleOnUserRemove(event, user);
      this.logger.log(`${user.username} was removed to Event ${event.name} successfully`);
    } catch (error) {
      this.logger.log(`Failed to remove ${user.username} to Event ${event.name}`);
    }
  }
}
