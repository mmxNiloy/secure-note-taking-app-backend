import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { Note, NoteSchema } from './schema/note.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
    UserModule,
  ],
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
