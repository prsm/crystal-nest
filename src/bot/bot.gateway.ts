import { InjectDiscordClient, Once } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'discord.js';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client
  ) {}

  @Once('ready')
  onReady(): void {
    this.logger.log(`Bot ${this.client.user.tag} was started!`);
  }
}
