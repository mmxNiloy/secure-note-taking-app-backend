import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { MongooseModule } from '@nestjs/mongoose';
import { Configuration } from './config/configuration.type';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
