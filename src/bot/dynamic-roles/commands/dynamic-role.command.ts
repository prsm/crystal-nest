import { Command } from '@discord-nestjs/core';

import { CreateDynamicRoleSubCommand } from './sub-commands/create.sub-command';

@Command({
  name: 'dynamic-roles',
  description: 'Dynamic roles. Used for accessing hiddne channels',
  include: [CreateDynamicRoleSubCommand]
})
export class DynamicRolesCommand {}
