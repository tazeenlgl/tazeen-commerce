import { Injectable, BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
  async hashPassword(password: string): Promise<string> {
    if (!password || password.length === 0) {
      throw new BadRequestException('Password is required');
    }

    return argon2.hash(password, {
      type: argon2.argon2id,
    });
  }

  async verifyPassword(
    passwordHash: string,
    password: string,
  ): Promise<boolean> {
    if (!passwordHash || !password) {
      return false;
    }

    try {
      return await argon2.verify(passwordHash, password);
    } catch {
      return false;
    }
  }
}
