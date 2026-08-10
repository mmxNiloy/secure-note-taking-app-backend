import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Configuration } from '@/config/configuration.type';
import { JwtPayload, JwtPayloadUser } from '@/modules/auth/types/jwt-payload';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService<Configuration>) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.refreshSecret', { infer: true })!,
      passReqToCallback: true,
    });
  }

  validate(_req: Request, payload: JwtPayload): JwtPayloadUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
