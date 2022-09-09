import { Param, ParamType } from '@discord-nestjs/core';
import { Transform } from 'class-transformer';
import { IsHexColor, IsOptional, Matches, MaxLength, MinLength } from 'class-validator';
import { HexColorString } from 'discord.js';

export class CreateDynamicRoleDto {
  @MinLength(3)
  @MaxLength(18)
  @Transform(({ value }) => (value ? value.toLowerCase() : value))
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

  @Matches(/^<?#?\d{18,20}>?$/, { message: 'Invalid emoji' })
  @Param({
    name: 'guild-emoji-id',
    description: 'Id of the emoji that will be displayed related to the role',
    required: true,
    type: ParamType.STRING
  })
  readonly guildEmojiId: string;

  @IsHexColor()
  @Param({
    name: 'color',
    description: 'A hex value for a color thats associated with the role',
    required: true,
    type: ParamType.STRING
  })
  readonly color: HexColorString;

  @IsOptional()
  @Matches(/^<?#?\d{18,20}>?$/, { message: 'Invalid channel id' })
  @Param({
    name: 'channel-id',
    description: 'Id of the channel if it already exists',
    required: false,
    type: ParamType.STRING
  })
  readonly channelId?: string;
}
