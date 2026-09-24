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

@Controller('locations')
@UseGuards(SessionAuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  findAll(
    @Query('status') status?: location_status,
    @Query('type') type?: location_type,
  ) {
    return this.locationsService.findAll(status, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }

  @Post()
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
