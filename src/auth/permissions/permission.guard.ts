import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../session-auth.guard';
import { PERMISSIONS_KEY } from './require-permission.decorator';
import { PermissionsService } from './permissions.service';

/** Must run after SessionAuthGuard: it reads request.authSession, never re-validates the session itself. */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[] | undefined>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const session = request.authSession;

    if (!session) {
      throw new UnauthorizedException('Authentication required');
    }

    const permissionCodes = await this.permissionsService.getPermissionCodes(
      session.user_id,
    );

    const hasPermission = required.some((code) => permissionCodes.has(code));

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
