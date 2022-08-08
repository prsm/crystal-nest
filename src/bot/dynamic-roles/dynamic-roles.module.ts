import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { DynamicRolesCommand } from './commands/dynamic-role.command';
import { CreateDynamicRoleSubCommand } from './commands/sub-commands/create.sub-command';
import { DeleteDynamicRoleSubCommand } from './commands/sub-commands/delete.sub-command';
import { SelectDynamicRolesSubCommand } from './commands/sub-commands/select.sub-command';
import { UpdateDynamicRoleSubCommand } from './commands/sub-commands/update.sub-command';
import { DynamicRolesCollector } from './dynamic-roles.collector';
import { DynamicRolesRepository } from './dynamic-roles.repository';
import { DynamicRolesService } from './dynamic-roles.service';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [
    DynamicRolesService,
    DynamicRolesRepository,
    DynamicRolesCommand,
    CreateDynamicRoleSubCommand,
    UpdateDynamicRoleSubCommand,
    DeleteDynamicRoleSubCommand,
    SelectDynamicRolesSubCommand,
    DynamicRolesCollector
  ]
})
export class DynamicRolesModule {}
