import { Param, ParamType } from '@discord-nestjs/core';
import { Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateDynamicRoleDto {
  @MinLength(3)
  @MaxLength(18)
  @Param({
    name: 'name',
    description: 'The name of the role',
    required: false,
    type: ParamType.STRING
  })
  readonly name?: string;

  @MinLength(8)
  @MaxLength(42)
  @Param({
    name: 'short-description',
    description: 'A short description of the role',
    required: false,
    type: ParamType.STRING
  })
  readonly shortDescription?: string;

  @MinLength(1)
  @Matches(/(<a?)?:\w+:(\d{18}>)?/)
  @Param({
    name: 'emoji',
    description: 'The emoji that will be displayed related to the role',
    required: false,
    type: ParamType.STRING
  })
  readonly emoji?: string;
}
