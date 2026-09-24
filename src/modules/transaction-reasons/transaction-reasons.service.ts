import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionReasonDto } from './create-transaction-reason.dto';
import { UpdateTransactionReasonDto } from './update-transaction-reason.dto';

@Injectable()
export class TransactionReasonsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(reasonType?: string, isActive?: boolean) {
    return this.prisma.transaction_reasons.findMany({
      where: {
        ...(reasonType ? { reason_type: reasonType } : {}),
        ...(isActive !== undefined ? { is_active: isActive } : {}),
      },
      orderBy: [
        { reason_type: 'asc' },
        { reason_name: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const reason = await this.prisma.transaction_reasons.findUnique({
      where: { id },
    });

    if (!reason) {
      throw new NotFoundException('Transaction reason not found');
    }

    return reason;
  }

  async create(dto: CreateTransactionReasonDto) {
    try {
      return await this.prisma.transaction_reasons.create({
        data: {
          reason_type: dto.reason_type.trim(),
          reason_name: dto.reason_name.trim(),
          is_active: dto.is_active ?? true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A transaction reason with this name already exists for this type',
        );
      }

      throw error;
    }
  }

  async update(id: string, dto: UpdateTransactionReasonDto) {
    await this.findOne(id);

    try {
      return await this.prisma.transaction_reasons.update({
        where: { id },
        data: {
          ...(dto.reason_type !== undefined
            ? { reason_type: dto.reason_type.trim() }
            : {}),
          ...(dto.reason_name !== undefined
            ? { reason_name: dto.reason_name.trim() }
            : {}),
          ...(dto.is_active !== undefined
            ? { is_active: dto.is_active }
            : {}),
          updated_at: new Date(),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A transaction reason with this name already exists for this type',
        );
      }

      throw error;
    }
  }
}
