import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../user/schema/user.schema';

export class PostResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty({ enum: UserRole })
  authorRole: UserRole;

  @ApiProperty()
  title: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
