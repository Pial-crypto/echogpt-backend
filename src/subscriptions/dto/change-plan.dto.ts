import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum ChangePlan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export class ChangePlanDto {
  @ApiProperty({
    enum: ChangePlan,
    example: ChangePlan.PREMIUM,
  })
  @IsEnum(ChangePlan)
  plan: ChangePlan;
}