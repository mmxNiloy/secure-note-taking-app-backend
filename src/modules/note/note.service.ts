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
import { UserRole } from '../user/schema/user.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note, NoteDocument } from './schema/note.schema';

@Injectable()
export class NoteService {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
  ) {}

  async create(
    dto: CreateNoteDto,
    actor: JwtPayloadUser,
  ): Promise<NoteResponseDto> {
    const note = await this.noteModel.create({
      ownerId: new Types.ObjectId(actor.id),
      title: dto.title,
      content: dto.content ?? '',
    });
    return this.toResponse(note);
  }

  async findAll(
    query: PaginationQueryDto,
    actor: JwtPayloadUser,
  ): Promise<PaginatedResult<NoteResponseDto>> {
    const decoded = decodeCursor(query.cursor);
    const ownershipFilter =
      actor.role === UserRole.ADMIN
        ? {}
        : { ownerId: new Types.ObjectId(actor.id) };

    const filter = {
      ...ownershipFilter,
      ...cursorFilter(decoded),
    };

    const rows = await this.noteModel
      .find(filter)
      .sort(CURSOR_SORT)
      .limit(query.limit + 1)
      .exec();

    const { pageItems, meta } = buildCursorMeta(rows, query.limit);
    return {
      items: pageItems.map((note) => this.toResponse(note)),
      meta,
    };
  }

  async findById(
    id: string,
    actor: JwtPayloadUser,
  ): Promise<NoteResponseDto> {
    const note = await this.getOwnedOrAdmin(id, actor);
    return this.toResponse(note);
  }

  async update(
    id: string,
    dto: UpdateNoteDto,
    actor: JwtPayloadUser,
  ): Promise<NoteResponseDto> {
    await this.getOwnedOrAdmin(id, actor);

    const note = await this.noteModel
      .findByIdAndUpdate(id, dto, { returnDocument: 'after' })
      .exec();

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return this.toResponse(note);
  }

  async remove(id: string, actor: JwtPayloadUser): Promise<void> {
    await this.getOwnedOrAdmin(id, actor);
    const result = await this.noteModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Note not found');
    }
  }

  private async getOwnedOrAdmin(
    id: string,
    actor: JwtPayloadUser,
  ): Promise<NoteDocument> {
    const note = await this.noteModel.findById(id).exec();
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const isOwner = note.ownerId.toString() === actor.id;
    if (!isOwner && actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return note;
  }

  private toResponse(note: NoteDocument): NoteResponseDto {
    return {
      id: note._id.toString(),
      ownerId: note.ownerId.toString(),
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }
}
