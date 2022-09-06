import { InteractionEventCollector, On } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { ButtonInteraction, ComponentType } from 'discord.js';
import { DynamicRolesService } from './dynamic-roles.service';

@InteractionEventCollector({ time: 3 * 1000, componentType: ComponentType.Button })
export class DynamicRolesCollector {
  private readonly logger: Logger;
  constructor(private readonly dynamicRolesService: DynamicRolesService) {
    this.logger = new Logger(DynamicRolesCollector.name);
  }

  @On('collect')
  async onCollect(interaction: ButtonInteraction): Promise<void> {
    const loggingString = await this.dynamicRolesService.handleRoleChange(interaction);
    this.logger.log(loggingString);
    interaction.update({ content: loggingString, components: [] });
  }
}
