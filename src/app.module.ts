import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { MongooseModule } from '@nestjs/mongoose';
import { Configuration } from './config/configuration.type';
import { UserModule } from './modules/user/user.module';
import { NoteModule } from './modules/note/note.module';
import { PostModule } from './modules/post/post.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema,
    }),

    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService<Configuration>) => ({
        uri: configService.get('database.uri', {
          infer: true,
        }),
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),

    UserModule,
    NoteModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
