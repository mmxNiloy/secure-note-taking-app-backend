import {
  Body,
  Controller,
  Delete,
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
import { Types } from 'mongoose';
import {
  ApiSuccessResponse,
  ApiSuccessResponsePaginated,
} from '@/common/decorators/api-success-response.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { JwtPayloadUser } from '@/modules/auth/types/jwt-payload';
import { CreatePostDto } from './dto/create-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

@ApiTags('posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({ summary: 'List all posts' })
  @ApiSuccessResponsePaginated(PostResponseDto)
  @ResponseMessage('Posts retrieved')
  findAll(@Query() query: PaginationQueryDto) {
    return this.postService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a post' })
  @ApiSuccessResponse(PostResponseDto)
  @ResponseMessage('Post created')
  create(@Body() dto: CreatePostDto, @CurrentUser() actor: JwtPayloadUser) {
    return this.postService.create(dto, actor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by id' })
  @ApiSuccessResponse(PostResponseDto)
  @ResponseMessage('Post retrieved')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.postService.findById(id.toString());
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post (author or admin)' })
  @ApiSuccessResponse(PostResponseDto)
  @ResponseMessage('Post updated')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdatePostDto,
    @CurrentUser() actor: JwtPayloadUser,
  ) {
    return this.postService.update(id.toString(), dto, actor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a post (author or admin)' })
  @ResponseMessage('Post deleted')
  async remove(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() actor: JwtPayloadUser,
  ) {
    await this.postService.remove(id.toString(), actor);
    return null;
  }
}
