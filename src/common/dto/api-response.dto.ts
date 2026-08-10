import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMeta } from '@/common/dto/pagination.dto';

export class ApiSuccessDto<T = unknown> {
  @ApiProperty({ type: Boolean, default: true })
  success: boolean;

  @ApiProperty({ type: Number, default: 200 })
  statusCode: number;

  @ApiProperty({ type: String, default: 'OK' })
  message: string;

  @ApiPropertyOptional({
    description: 'Response payload (object or array).',
  })
  data?: T;

  @ApiPropertyOptional({ type: PaginationMeta })
  meta?: PaginationMeta;
}

export class ApiErrorDto {
  @ApiProperty({ type: Boolean, default: false })
  success: boolean;

  @ApiProperty({ type: Number })
  statusCode: number;

  @ApiProperty({ type: String })
  message: string;

  @ApiPropertyOptional({
    description: 'Validation or field-level errors when present.',
  })
  errors?: string[] | Record<string, string[]>;
}
