import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { ChannelsService } from '../channels.service';
import { LockChannelDto } from '../dto/lock-channel.dto';

@Command({
  name: 'lock',
  description: 'Either locks or unlocks a channel'
})
@UsePipes(TransformPipe)
export class LockChannelCommand implements DiscordTransformedCommand<LockChannelDto> {
  private readonly logger: Logger;

  constructor(private readonly channelsService: ChannelsService) {
    this.logger = new Logger(LockChannelCommand.name);
  }

  async handler(
    @Payload() lockChannelDto: LockChannelDto,
    { interaction }: TransformedCommandExecutionContext
  ): Promise<void> {
    try {
      const { voice } = interaction.guild.members.cache.get(interaction.user.id);
      await interaction.reply(await this.channelsService.handleLockChannel(voice, lockChannelDto));
      this.logger.log(`Lock command executed successfully`);
    } catch (error) {
      const e = error as Error;
      this.logger.error(`Failed to execute lock command: ${e.message}`);
    }
  }
}
