import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { getAuthToken } from './auth-cookie';
import { SessionService } from './session.service';

export interface AuthenticatedRequest extends Request {
  authSession?: {
    id: string;
    user_id: string;
    expires_at: Date;
    user: {
      id: string;
      phone: string;
      full_name: string | null;
      status: string;
    };
  };
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = getAuthToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    const session =
      await this.sessionService.getActiveSession(token);

    if (!session) {
      throw new UnauthorizedException('Authentication required');
    }

    request.authSession = {
      id: session.id,
      user_id: session.user_id,
      expires_at: session.expires_at,
      user: {
        id: session.users.id,
        phone: session.users.phone,
        full_name: session.users.full_name,
        status: String(session.users.status),
      },
    };

    return true;
  }
}
