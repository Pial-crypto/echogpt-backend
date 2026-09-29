import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import {


  Get,

  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already registered',
  })
 @Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('register')
register(@Body() dto: RegisterDto) {
  return this.authService.register(dto);
}

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')
login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}
  @Get('me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({
  summary: 'Get current authenticated user',
})
getMe(@Req() req: any) {
  return this.authService.getMe(req.user.userId);
}

@Post('refresh')
@ApiOperation({
  summary: 'Refresh access token',
})
@ApiResponse({
  status: 200,
  description: 'New access and refresh tokens generated',
})
@ApiResponse({
  status: 401,
  description: 'Invalid or expired refresh token',
})
refresh(@Body() dto: RefreshTokenDto) {
  return this.authService.refresh(dto.refreshToken);
}
@Post('logout')
@ApiOperation({
  summary: 'Logout user',
})
@ApiResponse({
  status: 200,
  description: 'User logged out successfully',
})
logout(@Body() dto: RefreshTokenDto) {
  return this.authService.logout(dto.refreshToken);
}

}