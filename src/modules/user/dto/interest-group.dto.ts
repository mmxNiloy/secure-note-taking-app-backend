import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@/modules/user/schema/user.schema';

export class InterestGroupUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;
}

export class InterestGroupDto {
  @ApiProperty({ example: 'chess' })
  interest: string;

  @ApiProperty({ type: Number })
  count: number;

  @ApiProperty({ type: [InterestGroupUserDto] })
  users: InterestGroupUserDto[];
}
