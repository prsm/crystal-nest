import { Param, ParamType } from '@discord-nestjs/core';
import { Transform } from 'class-transformer';
import { IsHexColor, IsNotEmpty, IsOptional, Matches, MaxLength, MinLength } from 'class-validator';
import { HexColorString } from 'discord.js';

export class UpdateDynamicRoleDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(18)
  @Transform(({ value }) => value.toLowerCase())
  @Param({
    name: 'name',
    description: 'The name of the role',
    required: true,
    type: ParamType.STRING
  })
  readonly name: string;

  @IsOptional()
  @MinLength(3)
  @MaxLength(18)
  @Transform(({ value }) => value.toLowerCase())
  @Param({
    name: 'new-name',
    description: 'A new name for the role',
    required: false,
    type: ParamType.STRING
  })
  readonly newName?: string;

  @IsOptional()
  @MinLength(8)
  @MaxLength(42)
  @Param({
    name: 'short-description',
    description: 'A short description of the role',
    required: false,
    type: ParamType.STRING
  })
  readonly shortDescription?: string;

  @IsOptional()
  @IsHexColor()
  @Param({
    name: 'color',
    description: 'A hex value for a color thats associated with the role',
    required: false,
    type: ParamType.STRING
  })
  readonly color: HexColorString;

  @IsOptional()
  @Matches(/<a?:.+?:\d{18,20}>|\p{Extended_Pictographic}/gu, { message: 'Invalid emoji' })
  @Param({
    name: 'emoji',
    description: 'The emoji that will be displayed related to the role',
    required: false,
    type: ParamType.STRING
  })
  readonly emoji?: string;
}
