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
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Failed to create event ${event.name}: ${error.message}`);
    }
  }

  @On('guildScheduledEventUpdate')
  async onUpdate(oldEvent: GuildScheduledEvent, newEvent: GuildScheduledEvent): Promise<void> {
    try {
      await this.eventsService.handleOnUpdate(oldEvent, newEvent);
      this.logger.log(`Event ${newEvent.name} updated successfully`);
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Failed to update event ${oldEvent.name}: ${error.message}`);
    }
  }

  @On('guildScheduledEventDelete')
  async onDelete(event: GuildScheduledEvent): Promise<void> {
    try {
      await this.eventsService.handleOnDelete(event);
      this.logger.log(`Event ${event.name} deleted successfully`);
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Failed to delete event ${event.name}: ${error.message}`);
    }
  }

  @On('guildScheduledEventUserAdd')
  async onUserAdd(event: GuildScheduledEvent, user: User): Promise<void> {
    try {
      await this.eventsService.handleOnUserAdd(event, user);
      this.logger.log(`User ${user.username} was added to event ${event.name} successfully`);
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Failed to add user ${user.username} to event ${event.name}: ${error.message}`);
    }
  }

  @On('guildScheduledEventUserRemove')
  async onUserRemove(event: GuildScheduledEvent, user: User): Promise<void> {
    try {
      await this.eventsService.handleOnUserRemove(event, user);
      this.logger.log(`User ${user.username} was removed from event ${event.name} successfully`);
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Failed to remove user ${user.username} from event ${event.name}: ${error.message}`);
    }
  }
}
