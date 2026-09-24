import { Controller, Get, ServiceUnavailableException, VERSION_NEUTRAL } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Unversioned liveness probe. Must not touch the database. */
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  check() {
    return { status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() };
  }

  /** Readiness: verifies DB connectivity. Reveals no details on failure. */
  @Get('ready')
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException('Database not ready');
    }
    return { status: 'ok', database: 'up' };
  }
}
