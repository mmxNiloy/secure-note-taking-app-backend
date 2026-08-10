import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ example: 'Meeting notes' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional({ example: 'Discussed Q3 goals' })
  @IsOptional()
  @IsString()
  content?: string;
}
