import { On, Once } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { VoiceState } from 'discord.js';
import { ChannelsService } from './channels.service';

@Injectable()
export class ChannelsGateway {
  private readonly logger: Logger;

  constructor(private readonly channelsService: ChannelsService) {
    this.logger = new Logger(ChannelsGateway.name);
  }

  @Once('ready')
  async initVoiceChannels(): Promise<void> {
    try {
      await this.channelsService.initVoiceChannels();
      this.logger.log(`Successfully initialized dynamic voice channels`);
    } catch (error) {
      this.logger.log(`Failed to initialize dynamic voice channels`);
    }
  }

  @On('voiceStateUpdate')
  async onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): Promise<void> {
    try {
      await this.channelsService.handleOnVoiceStateUpdate(oldState, newState);
      this.logger.log(`Successfully handled voice state update`);
    } catch (error) {
      this.logger.log(`Failed to handle voice state update`);
    }
  }
}
