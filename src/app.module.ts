import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ActivityType, GatewayIntentBits } from 'discord.js';
import { BotModule } from './bot/bot.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        failOnLogin: true,
        autoLogin: true,
        token: configService.getOrThrow('discord.token'),
        registerCommandOptions: [{ forGuild: configService.getOrThrow('discord.guildId'), removeCommandsBefore: true }],
        discordClientOptions: {
          presence: {
            status: 'online',
            activities: [
              {
                name: 'Pac-Man',
                type: ActivityType.Playing
              }
            ]
          },
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildEmojisAndStickers,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildScheduledEvents
          ]
        }
      }),
      inject: [ConfigService]
    }),
    BotModule
  ]
})
export class AppModule {}
