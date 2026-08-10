import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateNoteDto {
  @ApiPropertyOptional({ example: 'Meeting notes' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional({ example: 'Discussed Q3 goals' })
  @IsOptional()
  @IsString()
  content?: string;
}
