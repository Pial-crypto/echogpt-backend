import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    example:
      'Explain REST API in simple terms.',
  })
  @IsString()
  @MaxLength(10000)
  message: string;

  @ApiProperty({
    example: 'chat-uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  chatId?: string;

  @ApiProperty({
    example: 'provider-uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  providerId?: string;

  @ApiProperty({
    example: 'gpt-4o-mini',
    required: false,
  })
  @IsOptional()
  @IsString()
  model?: string;
}