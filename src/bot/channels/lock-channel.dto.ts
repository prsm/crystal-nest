import { Param, ParamType } from '@discord-nestjs/core';

export class LockChannelDto {
  @Param({
    name: 'amount',
    description: 'Lock the channel to how many user? Uses the current amount if left empty',
    required: false,
    type: ParamType.INTEGER,
    minValue: 1,
    maxValue: 99
  })
  amount: number;
}
