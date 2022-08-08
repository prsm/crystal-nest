import { Param } from '@discord-nestjs/core';
import { Transform } from 'class-transformer';

export class TestDto {
  @Transform(({ value }) => value.toUpperCase())
  @Param({
    name: 'string',
    description: 'Makes a string upper case',
    required: true
  })
  string: string;
}
