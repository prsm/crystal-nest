import { Param, ParamType } from '@discord-nestjs/core';
import { MaxLength, MinLength } from 'class-validator';

export class DeleteDynamicRoleDto {
  @MinLength(3)
  @MaxLength(18)
  @Param({
    name: 'name',
    description: 'The name of the role',
    required: true,
    type: ParamType.STRING
  })
  readonly name: string;
}
