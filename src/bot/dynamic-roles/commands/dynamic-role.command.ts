import { Command, UseCollectors } from '@discord-nestjs/core';
import { DynamicRolesCollector } from '../dynamic-roles.collector';

import { CreateDynamicRoleSubCommand } from './sub-commands/create.sub-command';
import { DeleteDynamicRoleSubCommand } from './sub-commands/delete.sub-command';
import { SelectDynamicRolesSubCommand } from './sub-commands/select.sub-command';
import { UpdateDynamicRoleSubCommand } from './sub-commands/update.sub-command';

@Command({
  name: 'dynamic-roles',
  description: 'Dynamic roles. Used for accessing hidden channels',
  include: [
    CreateDynamicRoleSubCommand,
    UpdateDynamicRoleSubCommand,
    DeleteDynamicRoleSubCommand,
    SelectDynamicRolesSubCommand
  ]
})
@UseCollectors(DynamicRolesCollector)
export class DynamicRolesCommand {}
