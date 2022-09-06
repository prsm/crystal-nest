import { DiscordGuard } from '@discord-nestjs/core';
import { ConfigService } from '@nestjs/config';
import { GuildMemberRoleManager, Interaction } from 'discord.js';

export class InteractionFromPermittedUserGuard implements DiscordGuard {
  constructor(private readonly configService: ConfigService) {}

  async canActive(event: 'interactionCreate', [interaction]: [Interaction]): Promise<boolean> {
    const roleManager = interaction.member.roles as GuildMemberRoleManager;
    const modRole = await interaction.guild.roles.fetch(process.env.DISCORD_MOD_ROLE_ID);
    return roleManager.member.roles.highest.position >= modRole.position;
  }
}
