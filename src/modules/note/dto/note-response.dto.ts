import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../user/schema/user.schema';

export class NoteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  ownerName: string;

  @ApiProperty({ enum: UserRole })
  ownerRole: UserRole;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
