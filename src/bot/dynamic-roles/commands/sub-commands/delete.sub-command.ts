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
import { ConfigService } from '@nestjs/config';
import { CommandValidationFilter } from 'src/bot/filter/command-validation.filter';
import { PrismaExceptionFilter } from 'src/bot/filter/prisma-exception.filter';
import { DeleteDynamicRoleDto } from '../../dto/delete-dynamic-role.dto';
import { DynamicRolesService } from '../../dynamic-roles.service';

@SubCommand({
  name: 'delete',
  description: 'Deletes a dynamic role'
})
@UsePipes(TransformPipe, ValidationPipe)
@UseFilters(CommandValidationFilter, PrismaExceptionFilter)
export class DeleteDynamicRoleSubCommand implements DiscordTransformedCommand<DeleteDynamicRoleDto> {
  private readonly logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    private readonly dynamicRolesService: DynamicRolesService
  ) {
    this.logger = new Logger(DeleteDynamicRoleSubCommand.name);
  }

  async handler(
    @Payload() { name }: DeleteDynamicRoleDto,
    { interaction }: TransformedCommandExecutionContext
  ): Promise<void> {
    const dynamicRole = await this.dynamicRolesService.remove(name);
    const loggingString = `Successfully deleted dynamic role with name ${dynamicRole.name}`;
    this.logger.log(loggingString);
    return interaction.reply({ content: loggingString, ephemeral: true });
  }
}
