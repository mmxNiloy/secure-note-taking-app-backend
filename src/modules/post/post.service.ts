import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  buildCursorMeta,
  CURSOR_SORT,
  cursorFilter,
  decodeCursor,
  PaginatedResult,
  PaginationQueryDto,
} from '../../common/dto/pagination.dto';
import { JwtPayloadUser } from '../auth/types/jwt-payload';
import { User, UserRole } from '../user/schema/user.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostDocument } from './schema/post.schema';

type PopulatedAuthor = Pick<User, 'name' | 'role'> & {
  _id: Types.ObjectId;
};

type PostWithAuthor = Omit<PostDocument, 'authorId'> & {
  authorId: Types.ObjectId | PopulatedAuthor;
};

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async create(
    dto: CreatePostDto,
    actor: JwtPayloadUser,
  ): Promise<PostResponseDto> {
    const post = await this.postModel.create({
      authorId: new Types.ObjectId(actor.id),
      title: dto.title,
      body: dto.body ?? '',
    });
    await post.populate('authorId', 'name role');
    return this.toResponse(post as PostWithAuthor);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<PostResponseDto>> {
    const decoded = decodeCursor(query.cursor);
    const filter = cursorFilter(decoded);

    const rows = await this.postModel
      .find(filter)
      .populate('authorId', 'name role')
      .sort(CURSOR_SORT)
      .limit(query.limit + 1)
      .exec();

    const { pageItems, meta } = buildCursorMeta(
      rows as PostDocument[],
      query.limit,
    );
    return {
      items: pageItems.map((post) =>
        this.toResponse(post as unknown as PostWithAuthor),
      ),
      meta,
    };
  }

  async findById(id: string): Promise<PostResponseDto> {
    const post = await this.postModel
      .findById(id)
      .populate('authorId', 'name role')
      .exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.toResponse(post as unknown as PostWithAuthor);
  }

  async update(
    id: string,
    dto: UpdatePostDto,
    actor: JwtPayloadUser,
  ): Promise<PostResponseDto> {
    await this.getOwnedOrAdmin(id, actor);

    const post = await this.postModel
      .findByIdAndUpdate(id, dto, { returnDocument: 'after' })
      .populate('authorId', 'name role')
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.toResponse(post as unknown as PostWithAuthor);
  }

  async remove(id: string, actor: JwtPayloadUser): Promise<void> {
    await this.getOwnedOrAdmin(id, actor);
    const result = await this.postModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Post not found');
    }
  }

  private async getOwnedOrAdmin(
    id: string,
    actor: JwtPayloadUser,
  ): Promise<PostDocument> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const isAuthor = post.authorId.toString() === actor.id;
    if (!isAuthor && actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return post;
  }

  private toResponse(post: PostWithAuthor): PostResponseDto {
    const author = this.resolveAuthor(post.authorId);

    return {
      id: post._id.toString(),
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      title: post.title,
      body: post.body,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  private resolveAuthor(authorId: Types.ObjectId | PopulatedAuthor): {
    id: string;
    name: string;
    role: UserRole;
  } {
    if (authorId instanceof Types.ObjectId) {
      return { id: authorId.toString(), name: '', role: UserRole.USER };
    }

    return {
      id: authorId._id.toString(),
      name: authorId.name,
      role: authorId.role,
    };
  }
}
