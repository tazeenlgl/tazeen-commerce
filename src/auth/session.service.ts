import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

const SESSION_TTL_DAYS = 7;

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  generateToken(): string {
    return randomBytes(32).toString('base64url');
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  }

  async createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ token: string; expiresAt: Date }> {
    const token = this.generateToken();
    const sessionHash = this.hashToken(token);

    const expiresAt = new Date(
      Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.prisma.sessions.create({
      data: {
        id: crypto.randomUUID(),
        user_id: userId,
        session_hash: sessionHash,
        expires_at: expiresAt,
        ip_address: ipAddress ?? null,
        user_agent: userAgent ?? null,
        last_seen_at: new Date(),
      },
    });

    return {
      token,
      expiresAt,
    };
  }

  async getActiveSession(token: string) {
    if (!token) {
      return null;
    }

    const sessionHash = this.hashToken(token);
    const now = new Date();

    const session = await this.prisma.sessions.findUnique({
      where: {
        session_hash: sessionHash,
      },
      include: {
        users: {
          select: {
            id: true,
            phone: true,
            full_name: true,
            status: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    if (session.revoked_at || session.expires_at <= now) {
      return null;
    }

    if (String(session.users.status) !== 'Active') {
      return null;
    }

    await this.prisma.sessions.update({
      where: {
        id: session.id,
      },
      data: {
        last_seen_at: now,
      },
    });

    return session;
  }

  /**
   * Read-only lookup for a still-valid session, used where the caller (e.g. logout audit
   * attribution) must not touch last_seen_at — that would be a write with no purpose since
   * the session is about to be revoked anyway.
   */
  async peekActiveSession(
    token: string,
  ): Promise<{ id: string; user_id: string } | null> {
    if (!token) {
      return null;
    }

    const sessionHash = this.hashToken(token);
    const now = new Date();

    const session = await this.prisma.sessions.findUnique({
      where: { session_hash: sessionHash },
      select: {
        id: true,
        user_id: true,
        revoked_at: true,
        expires_at: true,
      },
    });

    if (!session || session.revoked_at || session.expires_at <= now) {
      return null;
    }

    return { id: session.id, user_id: session.user_id };
  }

  async revokeSession(token: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    const sessionHash = this.hashToken(token);

    const result = await this.prisma.sessions.updateMany({
      where: {
        session_hash: sessionHash,
        revoked_at: null,
      },
      data: {
        revoked_at: new Date(),
      },
    });

    return result.count > 0;
  }
}
