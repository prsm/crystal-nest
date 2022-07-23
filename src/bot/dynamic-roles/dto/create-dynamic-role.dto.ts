import { Param, ParamType } from '@discord-nestjs/core';
import { Matches, MaxLength, MinLength } from 'class-validator';

export class CreateDynamicRoleDto {
  @MinLength(3)
  @MaxLength(18)
  @Param({
    name: 'name',
    description: 'The name of the role',
    required: true,
    type: ParamType.STRING
  })
  readonly name: string;

  @MinLength(8)
  @MaxLength(42)
  @Param({
    name: 'short-description',
    description: 'A short description of the role',
    required: true,
    type: ParamType.STRING
  })
  readonly shortDescription: string;

  @Matches(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu, { message: 'Invalid emoji' })
  @Param({
    name: 'emoji',
    description: 'Id of the emoji that will be displayed related to the role',
    required: true,
    type: ParamType.STRING
  })
  readonly emoji: string;
}
