import { Module } from '@nestjs/common';
import { CreateDynamicRoleCommand } from './commands/create-dynamic-role.command';
import { DynamicRolesService } from './dynamic-roles.service';

@Module({
  providers: [DynamicRolesService, CreateDynamicRoleCommand]
})
export class DynamicRolesModule {}
