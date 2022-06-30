import { ValidationPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UseFilters,
  UsePipes
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandValidationFilter } from 'src/bot/filter/command-validation.filter';
import { PrismaExceptionFilter } from 'src/bot/filter/prisma-exception.filter';
import { CreateDynamicRoleDto } from '../dto/create-dynamic-role.dto';
import { DynamicRolesService } from '../dynamic-roles.service';

@Command({
  name: 'create-dynamic-role',
  description: 'Creates a new dynamic role'
})
@UsePipes(ValidationPipe)
@UseFilters(CommandValidationFilter, PrismaExceptionFilter)
export class CreateDynamicRoleCommand implements DiscordTransformedCommand<CreateDynamicRoleDto> {
  private readonly logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    private readonly dynamicRolesService: DynamicRolesService
  ) {
    this.logger = new Logger(CreateDynamicRoleCommand.name);
  }

  async handler(
    @Payload() createDynamicRoleDto: CreateDynamicRoleDto,
    { interaction }: TransformedCommandExecutionContext
  ): Promise<void> {
    const dynamicRole = await this.dynamicRolesService.create(createDynamicRoleDto);
    const loggingString = `Successfully created dynamic role with name ${dynamicRole.name}`;
    this.logger.log(loggingString);
    // await interaction.reply({ content: loggingString, ephemeral: true });
  }
}
