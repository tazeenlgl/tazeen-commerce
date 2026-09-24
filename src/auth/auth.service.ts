import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';
import { PrismaService } from '../prisma/prisma.service';

// A precomputed, unusable argon2id hash with no matching password. Verified against on every
// login where the phone doesn't match an active user, so a wrong-phone response takes roughly
// the same time as a wrong-password one (account-enumeration/timing hardening).
const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,p=4,t=3$pyDUygw3737j1mfV29nB/g$Gwj6RSXn5UcSF3PuLx136Rdk99YtoRrJPL6VTkUmxx8';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService,
  ) {}

  normalizePhone(phone: string): string {
    return String(phone ?? '').replace(/\D/g, '');
  }

  async validateCredentials(
    phone: string,
    password: string,
  ) {
    const normalizedPhone = this.normalizePhone(phone);

    if (!/^\d{10}$/.test(normalizedPhone)) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    const user = await this.prisma.users.findUnique({
      where: {
        phone: normalizedPhone,
      },
      select: {
        id: true,
        phone: true,
        password_hash: true,
        status: true,
        full_name: true,
      },
    });

    if (!user || String(user.status) !== 'Active') {
      // Still pay the argon2 verify cost against a dummy hash: an unknown/inactive phone
      // must not resolve measurably faster than a known one with a wrong password.
      await this.passwordService.verifyPassword(
        DUMMY_PASSWORD_HASH,
        password,
      );
      throw new UnauthorizedException('Invalid phone or password');
    }

    const validPassword = await this.passwordService.verifyPassword(
      user.password_hash,
      password,
    );

    if (!validPassword) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    return {
      id: user.id,
      phone: user.phone,
      full_name: user.full_name,
    };
  }

  async createSessionForUser(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.sessionService.createSession(
      userId,
      ipAddress,
      userAgent,
    );
  }
}
