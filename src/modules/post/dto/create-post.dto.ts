import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Hello world' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional({ example: 'My first public post' })
  @IsOptional()
  @IsString()
  body?: string;
}
