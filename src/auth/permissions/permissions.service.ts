import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Union of permission codes across every role assigned to the user, via user_roles -> roles -> role_permissions -> permissions. */
  async getPermissionCodes(userId: string): Promise<Set<string>> {
    const rows = await this.prisma.role_permissions.findMany({
      where: { roles: { user_roles: { some: { user_id: userId } } } },
      select: { permissions: { select: { code: true } } },
    });

    return new Set(rows.map((row) => row.permissions.code));
  }
}
