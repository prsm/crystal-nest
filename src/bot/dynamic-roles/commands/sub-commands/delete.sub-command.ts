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
import { PrismaNotFoundExceptionFilter } from 'src/bot/filter/prisma-not-found.filter';
import { CommandValidationFilter } from '../../../filter/command-validation.filter';
import { PrismaExceptionFilter } from '../../../filter/prisma-exception.filter';
import { DeleteDynamicRoleDto } from '../../dto/delete-dynamic-role.dto';
import { DynamicRolesService } from '../../dynamic-roles.service';

@SubCommand({
  name: 'delete',
  description: 'Deletes a dynamic role'
})
@UsePipes(TransformPipe, ValidationPipe)
@UseFilters(CommandValidationFilter, PrismaExceptionFilter, PrismaNotFoundExceptionFilter)
export class DeleteDynamicRoleSubCommand implements DiscordTransformedCommand<DeleteDynamicRoleDto> {
  private readonly logger: Logger;

  constructor(private readonly dynamicRolesService: DynamicRolesService) {
    this.logger = new Logger(DeleteDynamicRoleSubCommand.name);
  }

  async handler(
    @Payload() { name }: DeleteDynamicRoleDto,
    { interaction }: TransformedCommandExecutionContext
  ): Promise<void> {
    try {
      const dynamicRole = await this.dynamicRolesService.delete(name);
      const loggingString = `Successfully deleted dynamic role with name ${dynamicRole.name}`;
      this.logger.log(loggingString);
      await interaction.reply({ content: loggingString, ephemeral: true });
    } catch (error) {
      const loggingString = `Failed to delete dynamic role`;
      this.logger.log(loggingString);
      await interaction.reply({ content: loggingString, ephemeral: true });
    }
  }
}
