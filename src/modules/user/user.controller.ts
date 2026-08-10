import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ApiSuccessResponse,
  ApiSuccessResponseArray,
  ApiSuccessResponsePaginated,
} from '../../common/decorators/api-success-response.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { JwtPayloadUser } from '../auth/types/jwt-payload';
import { CreateUserDto } from './dto/create-user.dto';
import { InterestGroupDto } from './dto/interest-group.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPostsLookupDto } from './dto/user-posts-lookup.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole } from './schema/user.schema';
import { UserService } from './user.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all users (admin)' })
  @ApiSuccessResponsePaginated(UserResponseDto)
  @ResponseMessage('Users retrieved')
  findAll(@Query() query: PaginationQueryDto) {
    return this.userService.findAll(query);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a user (admin)' })
  @ApiSuccessResponse(UserResponseDto)
  @ResponseMessage('User created')
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto, { allowRole: true });
  }

  @Get('by-interests')
  @ApiOperation({ summary: 'Group users by interests (aggregation)' })
  @ApiSuccessResponseArray(InterestGroupDto)
  @ResponseMessage('Users grouped by interests')
  groupByInterests() {
    return this.userService.groupByInterests();
  }

  @Get(':id/posts')
  @ApiOperation({
    summary: 'Get posts for a user via $lookup aggregation',
  })
  @ApiSuccessResponse(UserPostsLookupDto)
  @ResponseMessage('User posts retrieved')
  findPostsByUser(@Param('id', ParseObjectIdPipe) id: string) {
    return this.userService.findPostsByUserId(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id (self or admin)' })
  @ApiSuccessResponse(UserResponseDto)
  @ResponseMessage('User retrieved')
  async findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() actor: JwtPayloadUser,
  ) {
    this.assertSelfOrAdmin(actor, id);
    return this.userService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user (self or admin)' })
  @ApiSuccessResponse(UserResponseDto)
  @ResponseMessage('User updated')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: JwtPayloadUser,
  ) {
    return this.userService.update(id, dto, actor);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user (admin)' })
  @ResponseMessage('User deleted')
  async remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() actor: JwtPayloadUser,
  ) {
    await this.userService.remove(id, actor);
    return null;
  }

  private assertSelfOrAdmin(actor: JwtPayloadUser, userId: string): void {
    if (actor.role !== UserRole.ADMIN && actor.id !== userId) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
