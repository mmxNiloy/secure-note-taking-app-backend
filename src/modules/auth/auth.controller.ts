import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '@/common/guards/jwt-refresh.guard';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from '@/modules/user/dto/user-response.dto';
import { JwtPayloadUser } from './types/jwt-payload';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiSuccessResponse(AuthResponseDto)
  @ResponseMessage('Registered successfully')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiSuccessResponse(AuthResponseDto)
  @ResponseMessage('Logged in successfully')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiSuccessResponse(AuthResponseDto)
  @ResponseMessage('Token refreshed')
  refresh(@Body() _dto: RefreshTokenDto, @CurrentUser() actor: JwtPayloadUser) {
    return this.authService.refresh(actor);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiSuccessResponse(UserResponseDto)
  @ResponseMessage('Profile retrieved')
  me(@CurrentUser() actor: JwtPayloadUser) {
    return this.authService.me(actor);
  }
}
