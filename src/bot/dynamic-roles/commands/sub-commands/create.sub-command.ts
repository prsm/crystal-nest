import { TransformPipe, ValidationPipe } from '@discord-nestjs/common';
import {
  DiscordTransformedCommand,
  Payload,
  SubCommand,
  TransformedCommandExecutionContext,
  UseFilters,
  UsePipes
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { DynamicRole } from '@prisma/client';
import { roleMention } from 'discord.js';
import { CommandValidationFilter } from '../../../filter/command-validation.filter';
import { PrismaExceptionFilter } from '../../../filter/prisma-exception.filter';
import { CreateDynamicRoleDto } from '../../dto/create-dynamic-role.dto';
import { DynamicRolesService } from '../../dynamic-roles.service';

@SubCommand({
  name: 'create',
  description: 'Creates a new dynamic role'
})
@UsePipes(TransformPipe, ValidationPipe)
@UseFilters(CommandValidationFilter, PrismaExceptionFilter)
export class CreateDynamicRoleSubCommand implements DiscordTransformedCommand<CreateDynamicRoleDto> {
  private readonly logger: Logger;

  constructor(private readonly dynamicRolesService: DynamicRolesService) {
    this.logger = new Logger(CreateDynamicRoleSubCommand.name);
  }

  async handler(
    @Payload() createDynamicRoleDto: CreateDynamicRoleDto,
    { interaction }: TransformedCommandExecutionContext
  ): Promise<void> {
    let dynamicRole: DynamicRole;
    const createdBy = interaction.member.user.id;
    try {
      dynamicRole = await this.dynamicRolesService.create(createdBy, createDynamicRoleDto);
    } catch (error) {
      const loggingString = `Failed to create dynamic role, reverted changes`;
      this.logger.log(loggingString);
      await interaction.reply({ content: loggingString, ephemeral: true });
      return;
    }

    const loggingString = `Successfully created dynamic role ${roleMention(dynamicRole.roleId)}`;
    this.logger.log(loggingString);
    await interaction.reply({ content: loggingString, ephemeral: true });
  }
}
