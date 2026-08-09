import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMeta } from './pagination.dto';

export class ApiResponseDto {
  @ApiProperty({
    description: 'The status of the response',
    default: true,
  })
  ok: boolean;

  @ApiPropertyOptional({
    description: 'A detailed message about the response',
    default: 'Successfully completed the request',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'The path of the request',
    default: '/api/v1/users',
  })
  path?: string;

  @ApiPropertyOptional({
    description: 'The timestamp of the request',
    default: 123456789,
  })
  timestamp?: number;
}

export class ApiSuccess<T> {
  @ApiProperty({ type: Boolean, default: true })
  success: boolean;

  @ApiProperty({ type: Number, default: 200 })
  statusCode: number;

  @ApiProperty({ type: String, default: 'success' })
  message: string;

  @ApiPropertyOptional({
    type: Object,
    description:
      'The data of the response. It can be a single object or an array of objects.',
  })
  data?: T;

  @ApiPropertyOptional({
    type: PaginationMeta,
    description: 'The pagination meta data.',
  })
  meta?: PaginationMeta;
}
