import { InjectDiscordClient } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChannelType,
  Client,
  DiscordAPIError,
  GuildPremiumTier,
  InteractionReplyOptions,
  VoiceBasedChannel,
  VoiceChannel,
  VoiceState
} from 'discord.js';

import { GuildService } from '../guild.service';
import { LockChannelDto } from './dto/lock-channel.dto';

@Injectable()
export class ChannelsService extends GuildService {
  private readonly logger: Logger;

  constructor(
    @InjectDiscordClient()
    client: Client,
    configService: ConfigService
  ) {
    super(client, configService);
    this.logger = new Logger(ChannelsService.name);
  }

  async handleLockChannel(voice: VoiceState, { amount }: LockChannelDto): Promise<InteractionReplyOptions> {
    if (!voice || !voice.channel || voice.channel.parentId !== this.getVoiceCategoryId()) {
      return {
        content: 'You are currently not connected to a dynamic voice channel',
        ephemeral: true
      };
    }

    if (amount) {
      await voice.channel.edit({ userLimit: amount });
      this.logger.log(`Locked channel ${voice.channel.name} to ${amount} users`);
      return { content: `Locked the channel to ${amount} users`, ephemeral: true };
    } else if (voice.channel.userLimit === 0) {
      await voice.channel.edit({ userLimit: voice.channel.members.size });
      this.logger.log(`Locked channel ${voice.channel.name} to ${voice.channel.members.size} users`);
      return {
        content: `Locked the channel to ${voice.channel.members.size} users`,
        ephemeral: true
      };
    } else {
      await voice.channel.edit({ userLimit: 0 });
      this.logger.log(`Unlocked channel ${voice.channel.name}`);
      return { content: `Unlocked the channel`, ephemeral: true };
    }
  }

  async initVoiceChannels(): Promise<void> {
    await this.removeAllEmptyChannelsExceptFirst();
    await this.createEmptyChannelIfNeeded();
    await this.renameChannelsIfNeeded();
  }

  async handleOnVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): Promise<void> {
    if (oldState.channelId === newState.channelId) {
      return;
    }

    if (
      oldState.channel?.parentId !== this.getVoiceCategoryId() &&
      newState.channel?.parentId !== this.getVoiceCategoryId()
    ) {
      return;
    }

    await this.handleDynamicChannels(oldState);
  }

  private async getCategoryChannels(): Promise<VoiceChannel[]> {
    const guild = await this.getGuild();
    const allChannels = Array.from(guild.channels.cache.values());
    return allChannels.filter(channel => channel.parentId === this.getVoiceCategoryId()) as VoiceChannel[];
  }

  private async getMaxBitrate(): Promise<number> {
    const guild = await this.getGuild();

    switch (guild.premiumTier) {
      case GuildPremiumTier.None:
        return 96000;
      case GuildPremiumTier.Tier1:
        return 128000;
      case GuildPremiumTier.Tier2:
        return 256000;
      case GuildPremiumTier.Tier3:
        return 384000;
      default:
        return 96000;
    }
  }

  private async handleDynamicChannels(oldState: VoiceState): Promise<void> {
    await this.handleUserLeftFirstChannel(oldState.channel);
    await this.removeAllEmptyChannelsExceptFirst();
    await this.createEmptyChannelIfNeeded();
    await this.renameChannelsIfNeeded();
  }

  private async renameChannelsIfNeeded(): Promise<void> {
    const categoryChannels = await this.getCategoryChannels();
    for (const channel of categoryChannels) {
      if (channel.name !== `voice ${channel.position + 1}`) {
        await this.updateChannel(channel, channel.position);
      }
    }
  }

  private async createEmptyChannelIfNeeded(): Promise<void> {
    const categoryChannels = await this.getCategoryChannels();
    const isNoneEmpty = !categoryChannels.some(channel => channel.members.size === 0);
    if (isNoneEmpty) {
      await this.createChannel(categoryChannels.length);
    }
  }

  private async removeAllEmptyChannelsExceptFirst(): Promise<void> {
    const categoryChannels = await this.getCategoryChannels();
    for (const channel of categoryChannels) {
      if (channel.position !== 0 && channel.members.size === 0) {
        await this.deleteChannel(channel);
      }
    }
  }

  private async handleUserLeftFirstChannel(channel: VoiceBasedChannel): Promise<void> {
    if (!channel) {
      return;
    }

    if (channel.parentId !== this.getVoiceCategoryId()) {
      return;
    }

    if (channel.position === 0 && channel.members.size === 0) {
      await this.resetChannel(channel);
      this.logger.log(`Reseted channel ${channel.name}`);
    }
  }

  private async resetChannel(channel: VoiceBasedChannel): Promise<void> {
    const position = channel.position;
    await this.deleteChannel(channel);
    await this.createChannel(position);
  }

  private async createChannel(index: number): Promise<void> {
    try {
      const guild = await this.getGuild();
      const channel = await guild.channels.create({
        name: `voice ${index + 1}`,
        type: ChannelType.GuildVoice,
        parent: this.getVoiceCategoryId(),
        position: index,
        topic: `dynamically created voice channel number ${index + 1}`,
        bitrate: await this.getMaxBitrate()
      });

      this.logger.log(`Created channel ${channel.name}`);
    } catch (e) {
      const error = e as DiscordAPIError;
      if (error.code === 10003) {
        this.logger.log('Channel not found');
      } else {
        throw error;
      }
    }
  }

  private async updateChannel(channel: VoiceBasedChannel, index: number): Promise<void> {
    try {
      const updatedChannel = await channel.edit({
        name: `voice ${index + 1}`,
        topic: `dynamically created voice channel number ${index + 1}`
      });

      this.logger.log(`Renamed channel ${channel.name} to ${updatedChannel.name}`);
    } catch (e) {
      const error = e as DiscordAPIError;
      if (error.code === 10003) {
        this.logger.log('Channel not found');
      } else {
        throw error;
      }
    }
  }

  private async deleteChannel(channel: VoiceBasedChannel): Promise<void> {
    try {
      await channel.delete();

      this.logger.log(`Deleted channel ${channel.name}`);
    } catch (e) {
      const error = e as DiscordAPIError;
      if (error.code === 10003) {
        this.logger.log('Channel not found');
      } else {
        throw error;
      }
    }
  }
}
