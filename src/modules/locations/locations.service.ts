import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { location_status, location_type } from '@prisma/client';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: location_status, type?: location_type) {
    return this.prisma.locations.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(type ? { location_type: type } : {}),
      },
      orderBy: [{ location_name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const location = await this.prisma.locations.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async create(data: {
    location_code: string;
    location_name: string;
    location_type: location_type;
    is_default?: boolean;
  }) {
    const code = data.location_code.trim();
    const name = data.location_name.trim();

    if (!code || !name) {
      throw new BadRequestException(
        'location_code and location_name are required',
      );
    }

    try {
      return await this.prisma.locations.create({
        data: {
          location_code: code,
          location_name: name,
          location_type: data.location_type,
          status: location_status.Active,
          is_default: data.is_default ?? false,
        },
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Location code already exists');
      }
      throw error;
    }
  }

  async update(
    id: string,
    data: {
      location_code?: string;
      location_name?: string;
      location_type?: location_type;
      status?: location_status;
      is_default?: boolean;
    },
  ) {
    await this.findOne(id);

    const updateData: {
      location_code?: string;
      location_name?: string;
      location_type?: location_type;
      status?: location_status;
      is_default?: boolean;
      updated_at?: Date;
    } = {};

    if (data.location_code !== undefined) {
      const value = data.location_code.trim();
      if (!value) {
        throw new BadRequestException('location_code cannot be empty');
      }
      updateData.location_code = value;
    }

    if (data.location_name !== undefined) {
      const value = data.location_name.trim();
      if (!value) {
        throw new BadRequestException('location_name cannot be empty');
      }
      updateData.location_name = value;
    }

    if (data.location_type !== undefined) {
      updateData.location_type = data.location_type;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.is_default !== undefined) {
      updateData.is_default = data.is_default;
    }

    updateData.updated_at = new Date();

    try {
      return await this.prisma.locations.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Location code already exists');
      }
      throw error;
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }
}
