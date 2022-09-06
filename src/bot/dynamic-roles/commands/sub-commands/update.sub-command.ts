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
import { roleMention } from 'discord.js';
import { PrismaNotFoundExceptionFilter } from 'src/bot/filter/prisma-not-found.filter';
import { CommandValidationFilter } from '../../../filter/command-validation.filter';
import { PrismaExceptionFilter } from '../../../filter/prisma-exception.filter';
import { UpdateDynamicRoleDto } from '../../dto/update-dynamic-role.dto';
import { DynamicRolesService } from '../../dynamic-roles.service';

@SubCommand({
  name: 'update',
  description: 'Updates an existing dynamic role'
})
@UsePipes(TransformPipe, ValidationPipe)
@UseFilters(CommandValidationFilter, PrismaExceptionFilter, PrismaNotFoundExceptionFilter)
export class UpdateDynamicRoleSubCommand implements DiscordTransformedCommand<UpdateDynamicRoleDto> {
  private readonly logger: Logger;

  constructor(private readonly dynamicRolesService: DynamicRolesService) {
    this.logger = new Logger(UpdateDynamicRoleSubCommand.name);
  }

  async handler(
    @Payload() updateDynamicRoleDto: UpdateDynamicRoleDto,
    { interaction }: TransformedCommandExecutionContext
  ): Promise<void> {
    try {
      const dynamicRole = await this.dynamicRolesService.update(updateDynamicRoleDto);
      const loggingString = `Successfully updated dynamic role ${roleMention(dynamicRole.roleId)}`;
      this.logger.log(loggingString);
      await interaction.reply({ content: loggingString, ephemeral: true });
    } catch (error) {
      const loggingString = `Failed to update dynamic role`;
      this.logger.log(loggingString);
      await interaction.reply({ content: loggingString, ephemeral: true });
    }
  }
}
