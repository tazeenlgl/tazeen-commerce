import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';
import { PrismaService } from '../prisma/prisma.service';

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
