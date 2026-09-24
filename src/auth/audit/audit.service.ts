import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditEventInput {
  userId: string | null;
  action: string;
  entityType?: string;
  entityId?: string | null;
  /** Never include passwords, session tokens, cookies, or other secrets here. */
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger('Audit');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Writes one audit_logs row. Failures are caught and logged here, never rethrown:
   * an audit-log outage must not block or fail the authentication/authorization
   * request it is recording.
   */
  async record(event: AuditEventInput): Promise<void> {
    try {
      await this.prisma.audit_logs.create({
        data: {
          id: randomUUID(),
          user_id: event.userId,
          action: event.action,
          entity_type: event.entityType ?? null,
          entity_id: event.entityId ?? null,
          metadata: event.metadata
            ? (event.metadata as Prisma.InputJsonValue)
            : undefined,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to write audit log for action "${event.action}"`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
