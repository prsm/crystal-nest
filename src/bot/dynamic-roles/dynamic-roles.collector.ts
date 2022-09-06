import { InteractionEventCollector, On } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { ButtonInteraction, ComponentType, GuildMemberRoleManager } from 'discord.js';
import { DynamicRolesService } from './dynamic-roles.service';

@InteractionEventCollector({ time: 60 * 1000, componentType: ComponentType.Button })
export class DynamicRolesCollector {
  private readonly logger: Logger;
  constructor(private readonly dynamicRolesService: DynamicRolesService) {
    this.logger = new Logger(DynamicRolesCollector.name);
  }

  @On('collect')
  async onCollect(interaction: ButtonInteraction): Promise<void> {
    const roleManager = interaction.member.roles as GuildMemberRoleManager;
    const loggingString = await this.dynamicRolesService.handleRoleChange(interaction);
    const updatedComponents = await this.dynamicRolesService.createButtonComponents(roleManager);
    this.logger.log(loggingString);
    interaction.update({ content: loggingString, components: [updatedComponents] });
  }
}
