import { Global, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionGuard } from './permission.guard';

/** Global so PermissionGuard's DI (PermissionsService) resolves from any feature module without importing this module everywhere. */
@Global()
@Module({
  providers: [PermissionsService, PermissionGuard],
  exports: [PermissionsService, PermissionGuard],
})
export class PermissionsModule {}
