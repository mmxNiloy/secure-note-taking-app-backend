import { ApiProperty } from '@nestjs/swagger';
import { PostResponseDto } from '@/modules/post/dto/post-response.dto';
import { UserRole } from '@/modules/user/schema/user.schema';

export class UserPostsLookupUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;
}

export class UserPostsLookupDto {
  @ApiProperty({ type: UserPostsLookupUserDto })
  user: UserPostsLookupUserDto;

  @ApiProperty({ type: [PostResponseDto] })
  posts: PostResponseDto[];
}
