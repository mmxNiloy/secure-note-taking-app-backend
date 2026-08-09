import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/** Normalized pagination + search options passed into repositories. */
export class SearchOptions {
  @ApiPropertyOptional({ type: Number })
  page?: number;
  @ApiPropertyOptional({ type: Number })
  limit?: number;
  @ApiPropertyOptional({ type: String })
  search?: string;
  @ApiPropertyOptional({ type: String })
  sort_by?: string;
  @ApiPropertyOptional({ enum: SortOrder })
  sort_order?: SortOrder;
}

export class PaginationMeta {
  @ApiPropertyOptional({ type: Number })
  total?: number;

  @ApiPropertyOptional({ type: Number })
  page?: number;

  @ApiPropertyOptional({ type: Number })
  limit?: number;

  @ApiPropertyOptional({ type: Number })
  totalPages?: number;

  @ApiPropertyOptional({ type: Boolean })
  hasNextPage?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  hasPreviousPage?: boolean;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
  })
  nextCursor?: string | null;

  @ApiPropertyOptional({
    type: Boolean,
    nullable: true,
  })
  hasMore?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export const DEFAULT_SORT: Required<
  Pick<SearchOptions, 'sort_by' | 'sort_order'>
> = {
  sort_by: 'created_at',
  sort_order: SortOrder.DESC,
};

export interface KeysetOptions {
  limit?: number;
  cursor?: string;
  search?: string;
}

export interface KeysetResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function encodeCursor(createdAt: Date | string, id: string): string {
  const ts = createdAt instanceof Date ? createdAt.toISOString() : createdAt;
  return Buffer.from(`${ts}|${id}`).toString('base64url');
}

export function decodeCursor(
  cursor?: string,
): { createdAt: string; id: string } | null {
  if (!cursor) return null;
  try {
    const [createdAt, id] = Buffer.from(cursor, 'base64url')
      .toString('utf8')
      .split('|');
    return createdAt && id ? { createdAt, id } : null;
  } catch {
    return null;
  }
}
