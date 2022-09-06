import { CommandExecutionContext, DiscordCommand, SubCommand, UseCollectors, UseFilters } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, GuildMemberRoleManager } from 'discord.js';
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

  async handler(interaction: CommandInteraction, executionContext: CommandExecutionContext): Promise<void> {
    const roles = await this.dynamicRolesService.findAll();
    const components = new ActionRowBuilder<ButtonBuilder>();
    const roleManager = interaction.member.roles as GuildMemberRoleManager;
    for (const { name, emoji, roleId } of roles) {
      const button = new ButtonBuilder()
        .setLabel(name)
        .setEmoji(emoji)
        .setCustomId(name)
        .setStyle(roleManager.cache.some(role => role.id === roleId) ? ButtonStyle.Primary : ButtonStyle.Secondary);
      components.addComponents(button);
    }

    await interaction.reply({ content: 'AMk, select role', ephemeral: true, components: [components] });
  }
}
