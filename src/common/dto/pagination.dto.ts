import { BadRequestException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Types } from 'mongoose';

export const CURSOR_SORT = { createdAt: -1 as const, _id: -1 as const };

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Opaque cursor from a previous page meta.nextCursor',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}

export class PaginationMeta {
  @ApiProperty({ type: String, nullable: true })
  nextCursor: string | null;

  @ApiProperty({ type: Boolean })
  hasMore: boolean;

  @ApiProperty({ type: Number })
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export type CursorPayload = {
  createdAt: Date;
  id: Types.ObjectId;
};

export type CursorDocument = {
  createdAt: Date;
  _id: Types.ObjectId;
};

export function encodeCursor(createdAt: Date | string, id: string): string {
  const ts = createdAt instanceof Date ? createdAt.toISOString() : createdAt;
  return Buffer.from(`${ts}|${id}`).toString('base64url');
}

export function decodeCursor(cursor?: string): CursorPayload | null {
  if (!cursor) return null;

  try {
    const [createdAtRaw, idRaw] = Buffer.from(cursor, 'base64url')
      .toString('utf8')
      .split('|');

    if (!createdAtRaw || !idRaw || !Types.ObjectId.isValid(idRaw)) {
      throw new Error('Invalid cursor parts');
    }

    const createdAt = new Date(createdAtRaw);
    if (Number.isNaN(createdAt.getTime())) {
      throw new Error('Invalid cursor date');
    }

    return {
      createdAt,
      id: Types.ObjectId.createFromHexString(idRaw),
    };
  } catch {
    throw new BadRequestException('Invalid cursor');
  }
}

export function cursorFilter(
  cursor: CursorPayload | null,
): Record<string, unknown> {
  if (!cursor) return {};

  return {
    $or: [
      { createdAt: { $lt: cursor.createdAt } },
      { createdAt: cursor.createdAt, _id: { $lt: cursor.id } },
    ],
  };
}

export function buildCursorMeta<T extends CursorDocument>(
  items: T[],
  limit: number,
): { pageItems: T[]; meta: PaginationMeta } {
  const hasMore = items.length > limit;
  const pageItems = hasMore ? items.slice(0, limit) : items;
  const last = pageItems[pageItems.length - 1];

  return {
    pageItems,
    meta: {
      nextCursor:
        hasMore && last
          ? encodeCursor(last.createdAt, last._id.toString())
          : null,
      hasMore,
      limit,
    },
  };
}
