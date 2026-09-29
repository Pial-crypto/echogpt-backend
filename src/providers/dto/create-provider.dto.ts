import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { ProviderType } from '@prisma/client';

export class CreateProviderDto {
  @ApiProperty({
    example: 'OpenAI Production',
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    enum: ProviderType,
    example: ProviderType.OPENAI,
  })
  @IsEnum(ProviderType)
  type: ProviderType;

  @ApiProperty({
    example: 'sk-xxxxxxxxxxxxxxxx',
  })
  @IsString()
  apiKey: string;

  @ApiProperty({
    example: 'https://api.openai.com/v1',
    required: false,
  })
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiProperty({
    example: 'gpt-4o-mini',
    required: false,
  })
  @IsOptional()
  @IsString()
  defaultModel?: string;

  @ApiProperty({
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}