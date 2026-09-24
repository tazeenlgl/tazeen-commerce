import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { location_status, location_type } from '@prisma/client';
import { SessionAuthGuard } from '../../auth/session-auth.guard';
import { PermissionGuard } from '../../auth/permissions/permission.guard';
import { RequirePermission } from '../../auth/permissions/require-permission.decorator';

@Controller('locations')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @RequirePermission('location.read')
  findAll(
    @Query('status') status?: location_status,
    @Query('type') type?: location_type,
  ) {
    return this.locationsService.findAll(status, type);
  }

  @Get(':id')
  @RequirePermission('location.read')
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }

  @Post()
  @RequirePermission('location.create')
  create(
    @Body()
    body: {
      location_code: string;
      location_name: string;
      location_type: location_type;
      is_default?: boolean;
    },
  ) {
    return this.locationsService.create(body);
  }

  @Patch(':id')
  @RequirePermission('location.update')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      location_code?: string;
      location_name?: string;
      location_type?: location_type;
      status?: location_status;
      is_default?: boolean;
    },
  ) {
    return this.locationsService.update(id, body);
  }
}
