import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Configuration } from '../../config/configuration.type';
import { UserService } from '../user/user.service';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload, JwtPayloadUser } from './types/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Configuration>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.userService.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      interests: dto.interests,
    });
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(dto.email, true);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await this.userService.comparePassword(
      dto.password,
      user.passwordHash,
    );
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(this.userService.toResponse(user));
  }

  async refresh(actor: JwtPayloadUser): Promise<AuthResponseDto> {
    const user = await this.userService.findById(actor.id);
    return this.buildAuthResponse(user);
  }

  async me(actor: JwtPayloadUser): Promise<UserResponseDto> {
    return this.userService.findById(actor.id);
  }

  private async buildAuthResponse(
    user: UserResponseDto,
  ): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.secret', { infer: true }),
      expiresIn: this.configService.get('jwt.expiresIn', { infer: true }),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.refreshSecret', { infer: true }),
      expiresIn: this.configService.get('jwt.refreshExpiresIn', {
        infer: true,
      }),
    });

    return { accessToken, refreshToken, user };
  }
}
