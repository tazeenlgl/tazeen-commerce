import { Global, Module } from '@nestjs/common';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SessionAuthGuard } from './session-auth.guard';

/** Global so SessionAuthGuard's DI (SessionService) resolves from any feature module without importing AuthModule everywhere. */
@Global()
@Module({
  controllers: [AuthController],
  providers: [PasswordService, SessionService, AuthService, SessionAuthGuard],
  exports: [PasswordService, SessionService, AuthService, SessionAuthGuard],
})
export class AuthModule {}
