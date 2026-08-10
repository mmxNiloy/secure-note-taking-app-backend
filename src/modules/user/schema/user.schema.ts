import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    required: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: true,
    select: false,
  })
  passwordHash: string;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({
    type: [String],
    default: [],
  })
  interests: string[];

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ interests: 1 });
UserSchema.index({ createdAt: -1, _id: -1 });
