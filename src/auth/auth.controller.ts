import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { IsString, Matches, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import {
  clearAuthCookie,
  getAuthToken,
  setAuthCookie,
} from './auth-cookie';
import { SessionService } from './session.service';
import { SessionAuthGuard, AuthenticatedRequest } from './session-auth.guard';
import { StrictRateLimit } from '../security/rate-limit.decorator';

class LoginDto {
  @IsString()
  @Matches(/^\d{10}$/, {
    message: 'Phone must be a 10-digit number',
  })
  phone!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('login')
  @StrictRateLimit()
  async login(
    @Body() body: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateCredentials(
      body.phone,
      body.password,
    );

    const ipAddress =
      typeof request.ip === 'string' ? request.ip : undefined;

    const userAgent =
      typeof request.headers['user-agent'] === 'string'
        ? request.headers['user-agent']
        : undefined;

    const session = await this.authService.createSessionForUser(
      user.id,
      ipAddress,
      userAgent,
    );

    setAuthCookie(response, session.token, session.expiresAt);

    return {
      user,
      expires_at: session.expiresAt,
    };
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = getAuthToken(request);

    if (token) {
      await this.sessionService.revokeSession(token);
    }

    clearAuthCookie(response);

    return {
      success: true,
    };
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  async me(@Req() request: AuthenticatedRequest) {
    const session = request.authSession!;

    return {
      user: {
        id: session.user.id,
        phone: session.user.phone,
        full_name: session.user.full_name,
      },
      expires_at: session.expires_at,
    };
  }
}
