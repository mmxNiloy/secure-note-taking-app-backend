import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@/modules/user/schema/user.schema';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ type: [String] })
  interests: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
