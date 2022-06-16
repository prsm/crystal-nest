import { InjectDiscordClient, On, Once } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, DiscordAPIError, Guild, VoiceBasedChannel, VoiceChannel, VoiceState } from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';

@Injectable()
export class ChannelsGateway {
  private readonly logger: Logger;
  private guild: Guild;
  private readonly voiceCategoryId: string;

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly configService: ConfigService
  ) {
    this.logger = new Logger(ChannelsGateway.name);
    this.client.guilds.fetch({ guild: this.configService.get<string>('discord.guildId') }).then(guild => {
      this.guild = guild;
    });
    this.voiceCategoryId = this.configService.get<string>('discord.voiceCategoryId');
  }

  @Once('ready')
  async initVoiceChannels(): Promise<void> {
    await this.removeAllEmptyChannelsExceptFirst();
    await this.createEmptyChannelIfNeeded();
    await this.renameChannelsIfNeeded();
  }

  @On('voiceStateUpdate')
  async onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): Promise<void> {
    if (oldState.channelId === newState.channelId) {
      return;
    }

    if (oldState.channel?.parentId !== this.voiceCategoryId && newState.channel?.parentId !== this.voiceCategoryId) {
      return;
    }

    await this.handleDynamicChannels(oldState);
  }

  private async getCategoryChannels(): Promise<VoiceChannel[]> {
    const allChannels = Array.from(await this.guild.channels.cache.values());
    return allChannels.filter(channel => channel.parentId === this.voiceCategoryId) as VoiceChannel[];
  }

  private getMaxBitrate(guild: Guild): number {
    switch (guild.premiumTier) {
      case 'NONE':
        return 96000;
        break;
      case 'TIER_1':
        return 128000;
        break;
      case 'TIER_2':
        return 256000;
        break;
      case 'TIER_3':
        return 384000;
        break;
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
      if (channel.name !== `voice ${channel.position}`) {
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
      const channel = await this.guild.channels.create(`voice ${index + 1}`, {
        type: ChannelTypes.GUILD_VOICE,
        parent: this.voiceCategoryId,
        position: index,
        topic: `dynamically created voice channel number ${index + 1}`,
        bitrate: this.getMaxBitrate(this.guild)
      });

      this.logger.log(`Created channel ${channel.name}}`);
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
