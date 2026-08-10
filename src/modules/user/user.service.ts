import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model, Types } from 'mongoose';
import { Configuration } from '../../config/configuration.type';
import {
  buildCursorMeta,
  CURSOR_SORT,
  cursorFilter,
  decodeCursor,
  PaginatedResult,
  PaginationQueryDto,
} from '../../common/dto/pagination.dto';
import { JwtPayloadUser } from '../auth/types/jwt-payload';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User, UserDocument, UserRole } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService<Configuration>,
  ) {}

  async create(
    dto: CreateUserDto,
    options?: { allowRole?: boolean },
  ): Promise<UserResponseDto> {
    const existing = await this.userModel.exists({
      email: dto.email.toLowerCase(),
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.userModel.create({
      email: dto.email,
      name: dto.name,
      interests: dto.interests ?? [],
      passwordHash,
      role: options?.allowRole ? (dto.role ?? UserRole.USER) : UserRole.USER,
    });

    return this.toResponse(user);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const decoded = decodeCursor(query.cursor);
    const filter = cursorFilter(decoded);

    const rows = await this.userModel
      .find(filter)
      .select('-passwordHash')
      .sort(CURSOR_SORT)
      .limit(query.limit + 1)
      .exec();

    const { pageItems, meta } = buildCursorMeta(rows, query.limit);
    return {
      items: pageItems.map((user) => this.toResponse(user)),
      meta,
    };
  }

  async findById(id: Types.ObjectId | string): Promise<UserResponseDto> {
    const user = await this.userModel
      .findById(id)
      .select('-passwordHash')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toResponse(user);
  }

  async findByEmail(
    email: string,
    withPassword = false,
  ): Promise<UserDocument | null> {
    const query = this.userModel.findOne({ email: email.toLowerCase() });
    if (withPassword) {
      query.select('+passwordHash');
    }
    return query.exec();
  }

  async findDocumentById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('+passwordHash').exec();
  }

  async update(
    id: Types.ObjectId | string,
    dto: UpdateUserDto,
    actor: JwtPayloadUser,
  ): Promise<UserResponseDto> {
    const isAdmin = actor.role === UserRole.ADMIN;
    const isSelf = actor.id === id.toString();

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException('Insufficient permissions');
    }

    if (dto.role !== undefined && !isAdmin) {
      throw new ForbiddenException('Only admins can change roles');
    }

    if (dto.email) {
      const existing = await this.userModel.exists({
        email: dto.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    const update: Partial<User> & { passwordHash?: string } = {};
    if (dto.email !== undefined) update.email = dto.email;
    if (dto.name !== undefined) update.name = dto.name;
    if (dto.interests !== undefined) update.interests = dto.interests;
    if (dto.role !== undefined && isAdmin) update.role = dto.role;
    if (dto.password !== undefined) {
      update.passwordHash = await this.hashPassword(dto.password);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, update, { returnDocument: 'after' })
      .select('-passwordHash')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponse(user);
  }

  async remove(
    id: Types.ObjectId | string,
    actor: JwtPayloadUser,
  ): Promise<void> {
    if (actor.id === id.toString()) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get('bcrypt.saltRounds', {
      infer: true,
    })!;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  groupByInterests() {
    return this.userModel.aggregate([
      { $unwind: '$interests' },
      {
        $group: {
          _id: '$interests',
          users: {
            $push: {
              id: { $toString: '$_id' },
              email: '$email',
              name: '$name',
              role: '$role',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $project: { interest: '$_id', _id: 0, users: 1, count: 1 } },
      { $sort: { interest: 1 } },
    ]);
  }

  async findPostsByUserId(userId: string) {
    const rows = await this.userModel.aggregate([
      { $match: { _id: new Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'authorId',
          as: 'posts',
        },
      },
      {
        $project: {
          _id: 0,
          user: {
            id: { $toString: '$_id' },
            email: '$email',
            name: '$name',
            role: '$role',
          },
          posts: {
            $map: {
              input: '$posts',
              as: 'p',
              in: {
                id: { $toString: '$$p._id' },
                authorId: { $toString: '$$p.authorId' },
                title: '$$p.title',
                body: '$$p.body',
                createdAt: '$$p.createdAt',
                updatedAt: '$$p.updatedAt',
              },
            },
          },
        },
      },
    ]);

    if (!rows[0]) {
      throw new NotFoundException('User not found');
    }

    return rows[0];
  }

  toResponse(user: UserDocument | User): UserResponseDto {
    const doc = user as UserDocument;
    return {
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      role: doc.role,
      interests: doc.interests ?? [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
