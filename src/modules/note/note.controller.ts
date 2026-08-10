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
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteService } from './note.service';

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get()
  @ApiOperation({ summary: 'List notes (own notes, or all for admin)' })
  @ApiSuccessResponsePaginated(NoteResponseDto)
  @ResponseMessage('Notes retrieved')
  findAll(
    @Query() query: PaginationQueryDto,
    @CurrentUser() actor: JwtPayloadUser,
  ) {
    return this.noteService.findAll(query, actor);
  }

  @Post()
  @ApiOperation({ summary: 'Create a note' })
  @ApiSuccessResponse(NoteResponseDto)
  @ResponseMessage('Note created')
  create(@Body() dto: CreateNoteDto, @CurrentUser() actor: JwtPayloadUser) {
    return this.noteService.create(dto, actor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a note by id' })
  @ApiSuccessResponse(NoteResponseDto)
  @ResponseMessage('Note retrieved')
  findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() actor: JwtPayloadUser,
  ) {
    return this.noteService.findById(id, actor);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a note' })
  @ApiSuccessResponse(NoteResponseDto)
  @ResponseMessage('Note updated')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateNoteDto,
    @CurrentUser() actor: JwtPayloadUser,
  ) {
    return this.noteService.update(id, dto, actor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a note' })
  @ResponseMessage('Note deleted')
  async remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() actor: JwtPayloadUser,
  ) {
    await this.noteService.remove(id, actor);
    return null;
  }
}
