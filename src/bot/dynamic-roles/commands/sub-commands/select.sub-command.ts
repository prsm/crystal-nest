import { DiscordCommand, SubCommand, UseCollectors, UseFilters } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { CommandInteraction, GuildMemberRoleManager } from 'discord.js';
import { PrismaExceptionFilter } from '../../../filter/prisma-exception.filter';
import { DynamicRolesCollector } from '../../dynamic-roles.collector';
import { DynamicRolesService } from '../../dynamic-roles.service';

@SubCommand({
  name: 'select',
  description: 'Displays'
})
@UseFilters(PrismaExceptionFilter)
@UseCollectors(DynamicRolesCollector)
export class SelectDynamicRolesSubCommand implements DiscordCommand {
  private readonly logger: Logger;

  constructor(private readonly dynamicRolesService: DynamicRolesService) {
    this.logger = new Logger(SelectDynamicRolesSubCommand.name);
  }

  async handler(interaction: CommandInteraction): Promise<void> {
    const roleManager = interaction.member.roles as GuildMemberRoleManager;
    const components = await this.dynamicRolesService.createButtonComponents(roleManager);
    await interaction.reply({
      content: 'Bitte wähle aus, welche Rollen du haben möchtest\nPlease select which roles you would like to have',
      ephemeral: true,
      components: components
    });
  }
}
