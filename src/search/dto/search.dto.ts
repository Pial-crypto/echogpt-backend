import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SearchDto {
  @ApiProperty({
    example: 'latest NestJS authentication best practices',
  })
  @IsString()
  @MaxLength(500)
  query: string;

  @ApiProperty({
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;
}