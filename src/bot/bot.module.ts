import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { TestCommand } from './test/test.command';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [TestCommand]
})
export class BotModule {}
