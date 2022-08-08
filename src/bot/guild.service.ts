import { ConfigService } from '@nestjs/config';
import { Client, Guild } from 'discord.js';

export class GuildService {
  private static guild: Guild;
  private static guildId: string;
  private static archiveCategoryId: string;
  private static eventCategoryId: string;
  private static memberRoleId: string;
  private static playerRoleId: string;
  private static voiceCategoryId: string;
  private static dynamicRolesDividerId: string;
  private static dynamicRolesCategoryId: string;

  constructor(private readonly client: Client, private readonly configService: ConfigService) {
    GuildService.guildId = this.configService.getOrThrow<string>('discord.guildId');
    GuildService.archiveCategoryId = this.configService.getOrThrow<string>('discord.archiveCategoryId');
    GuildService.eventCategoryId = this.configService.getOrThrow<string>('discord.eventCategoryId');
    GuildService.memberRoleId = this.configService.getOrThrow<string>('discord.memberRoleId');
    GuildService.playerRoleId = this.configService.getOrThrow<string>('discord.playerRoleId');
    GuildService.voiceCategoryId = this.configService.getOrThrow<string>('discord.voiceCategoryId');
    GuildService.dynamicRolesDividerId = this.configService.getOrThrow<string>('discord.dynamicRolesDividerId');
    GuildService.dynamicRolesCategoryId = this.configService.getOrThrow<string>('discord.dynamicRolesCategoryId');
  }

  protected async getGuild(): Promise<Guild> {
    if (!GuildService.guild) {
      GuildService.guild = await this.client.guilds.fetch({ guild: this.configService.get<string>('discord.guildId') });
    }

    return GuildService.guild;
  }

  protected getGuildId(): string {
    return GuildService.guildId;
  }

  protected getArchiveCategoryId(): string {
    return GuildService.archiveCategoryId;
  }

  protected getEventCategoryId(): string {
    return GuildService.eventCategoryId;
  }

  protected getMemberRoleId(): string {
    return GuildService.memberRoleId;
  }

  protected getPlayerRoleId(): string {
    return GuildService.playerRoleId;
  }

  protected getVoiceCategoryId(): string {
    return GuildService.voiceCategoryId;
  }

  protected getdynamicRolesDividerId(): string {
    return GuildService.dynamicRolesDividerId;
  }

  protected getDynamicRolesCategoryId(): string {
    return GuildService.dynamicRolesCategoryId;
  }
}
