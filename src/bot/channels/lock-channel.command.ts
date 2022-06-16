import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LockChannelDto } from './lock-channel.dto';

@Command({
  name: 'lock',
  description: 'Either locks or unlocks a channel'
})
@UsePipes(TransformPipe)
export class LockChannelCommand implements DiscordTransformedCommand<LockChannelDto> {
  private readonly logger: Logger;
  private readonly voiceCategoryId: string;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(LockChannelCommand.name);
    this.voiceCategoryId = this.configService.get<string>('discord.voiceCategoryId');
  }

  async handler(
    @Payload() { amount }: LockChannelDto,
    { interaction }: TransformedCommandExecutionContext
  ): Promise<void> {
    this.logger.log(amount);
    const { voice } = interaction.guild.members.cache.get(interaction.user.id);
    if (!voice.channel || voice.channel.parentId !== this.voiceCategoryId) {
      interaction.reply({ content: 'You are currently not connected to a dynamic voice channel', ephemeral: true });
    }

    if (amount) {
      await voice.channel.edit({ userLimit: amount });
      interaction.reply({ content: `Locked the channel to ${amount} users`, ephemeral: true });
    } else if (voice.channel.userLimit === 0) {
      await voice.channel.edit({ userLimit: voice.channel.members.size });
      interaction.reply({ content: `Locked the channel to ${voice.channel.members.size} users`, ephemeral: true });
    } else {
      await voice.channel.edit({ userLimit: 0 });
      interaction.reply({ content: `Unlocked the channel`, ephemeral: true });
    }
  }
}
