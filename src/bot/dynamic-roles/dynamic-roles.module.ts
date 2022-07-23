import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { DynamicRolesCommand } from './commands/dynamic-role.command';
import { CreateDynamicRoleSubCommand } from './commands/sub-commands/create.sub-command';

import { DynamicRolesService } from './dynamic-roles.service';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [DynamicRolesService, DynamicRolesCommand, CreateDynamicRoleSubCommand]
})
export class DynamicRolesModule {}
