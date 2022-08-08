import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Intents } from 'discord.js';
import { ActivityTypes } from 'discord.js/typings/enums';
import { BotModule } from './bot/bot.module';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    PrismaModule,
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('discord.token'),
        registerCommandOptions: [{ forGuild: configService.get('discord.guildId'), removeCommandsBefore: true }],
        discordClientOptions: {
          presence: {
            status: 'online',
            activities: [
              {
                name: 'Pac-Man',
                type: ActivityTypes.PLAYING
              }
            ]
          },
          intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
            Intents.FLAGS.GUILD_VOICE_STATES,
            Intents.FLAGS.GUILD_PRESENCES,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            Intents.FLAGS.GUILD_SCHEDULED_EVENTS
          ]
        }
      }),
      inject: [ConfigService]
    }),
    BotModule
  ]
})
export class AppModule {}
