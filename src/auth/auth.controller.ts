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
import { AuditService } from './audit/audit.service';

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
    private readonly auditService: AuditService,
  ) {}

  @Post('login')
  @StrictRateLimit()
  async login(
    @Body() body: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const ipAddress =
      typeof request.ip === 'string' ? request.ip : undefined;

    const userAgent =
      typeof request.headers['user-agent'] === 'string'
        ? request.headers['user-agent']
        : undefined;

    let user: { id: string; phone: string; full_name: string | null };

    try {
      user = await this.authService.validateCredentials(
        body.phone,
        body.password,
      );
    } catch (error) {
      await this.auditService.record({
        userId: null,
        action: 'auth.login.failure',
        entityType: 'user',
        metadata: {
          phone: this.authService.normalizePhone(body.phone),
          ip: ipAddress,
        },
      });
      throw error;
    }

    const session = await this.authService.createSessionForUser(
      user.id,
      ipAddress,
      userAgent,
    );

    await this.auditService.record({
      userId: user.id,
      action: 'auth.login.success',
      entityType: 'user',
      entityId: user.id,
      metadata: { ip: ipAddress, user_agent: userAgent },
    });

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
      const session = await this.sessionService.peekActiveSession(token);
      await this.sessionService.revokeSession(token);

      if (session) {
        await this.auditService.record({
          userId: session.user_id,
          action: 'auth.logout',
          entityType: 'user',
          entityId: session.user_id,
        });
      }
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
