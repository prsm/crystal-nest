import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ChannelsGateway } from './channels.gateway';
import { ChannelsService } from './channels.service';
import { LockChannelCommand } from './commands/lock-channel.command';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [ChannelsGateway, ChannelsService, LockChannelCommand]
})
export class ChannelsModule {}
