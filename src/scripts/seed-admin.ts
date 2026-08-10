import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import configuration from '@/config/configuration';
import { validationSchema } from '@/config/validation';
import { Configuration } from '@/config/configuration.type';
import {
  User,
  UserDocument,
  UserRole,
  UserSchema,
} from '@/modules/user/schema/user.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configuration>) => ({
        uri: configService.get('database.uri', { infer: true }),
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
class SeedAdminModule {}

async function seedAdmin() {
  const app = await NestFactory.createApplicationContext(SeedAdminModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const configService = app.get(ConfigService<Configuration>);
    const email = configService.get('admin.email', { infer: true });
    const password = configService.get('admin.password', { infer: true });
    const name = configService.get('admin.name', { infer: true }) ?? 'Admin';

    if (!email || !password) {
      throw new Error(
        'ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment',
      );
    }

    const saltRounds = configService.get('bcrypt.saltRounds', { infer: true })!;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

    const user = await userModel
      .findOneAndUpdate(
        { email: email.toLowerCase() },
        {
          email: email.toLowerCase(),
          name,
          role: UserRole.ADMIN,
          passwordHash,
          interests: [],
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
      )
      .exec();

    console.log(
      `Admin ready: ${user.email} (id=${user._id.toString()}, role=${user.role})`,
    );
  } finally {
    await app.close();
  }
}

seedAdmin().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
