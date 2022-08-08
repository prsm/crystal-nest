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
import { CommandValidationFilter } from 'src/bot/filter/command-validation.filter';
import { PrismaExceptionFilter } from 'src/bot/filter/prisma-exception.filter';
import { UpdateDynamicRoleDto } from '../../dto/update-dynamic-role.dto';
import { DynamicRolesService } from '../../dynamic-roles.service';

@SubCommand({
  name: 'update',
  description: 'Updates an existing dynamic role'
})
@UsePipes(TransformPipe, ValidationPipe)
@UseFilters(CommandValidationFilter, PrismaExceptionFilter)
export class UpdateDynamicRoleSubCommand implements DiscordTransformedCommand<UpdateDynamicRoleDto> {
  private readonly logger: Logger;

  constructor(private readonly dynamicRolesService: DynamicRolesService) {
    this.logger = new Logger(UpdateDynamicRoleSubCommand.name);
  }

  async handler(
    @Payload() updateDynamicRoleDto: UpdateDynamicRoleDto,
    { interaction }: TransformedCommandExecutionContext
  ): Promise<void> {
    const dynamicRole = await this.dynamicRolesService.update(updateDynamicRoleDto);
    const loggingString = `Successfully updated dynamic role with name ${dynamicRole.name}`;
    this.logger.log(loggingString);
    return interaction.reply({ content: loggingString, ephemeral: true });
  }
}
