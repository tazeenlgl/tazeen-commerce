import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';

/** Global so AuditService's DI resolves from any feature module without importing this module everywhere. */
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
