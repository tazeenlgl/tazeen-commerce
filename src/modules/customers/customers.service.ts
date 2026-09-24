import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { customer_status } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

/** Same normalization rule used for user login (auth.service.ts): strips non-digits before
 * persistence/lookup so a phone entered with spaces, dashes, or a leading "+91" never creates
 * a duplicate customer record for the same underlying number. */
export function normalizePhone(phone: string): string {
  return String(phone ?? '').replace(/\D/g, '');
}

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: customer_status) {
    return this.prisma.customers.findMany({
      where: status ? { status } : {},
      orderBy: [{ created_at: 'desc' }],
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customers.findUnique({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async findByPhone(phone: string) {
    const normalizedPhone = normalizePhone(phone);

    if (!/^\d{10}$/.test(normalizedPhone)) {
      throw new BadRequestException('Phone must be a 10-digit number');
    }

    const customer = await this.prisma.customers.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async create(dto: CreateCustomerDto) {
    const customerId = dto.customer_id.trim();
    const normalizedPhone = normalizePhone(dto.phone);

    if (!customerId) {
      throw new BadRequestException('customer_id is required');
    }

    if (!/^\d{10}$/.test(normalizedPhone)) {
      throw new BadRequestException('Phone must be a 10-digit number');
    }

    try {
      // Customer and their (always-present, zero-balance) wallet are created together so
      // every credit/debit afterwards is a plain UPDATE on a row that already exists —
      // no upsert-on-first-use branch needed for the wallet mutation path.
      return await this.prisma.$transaction(async (tx) => {
        const customer = await tx.customers.create({
          data: {
            customer_id: customerId,
            phone: normalizedPhone,
            name: dto.name?.trim() || null,
            email: dto.email?.trim() || null,
            address: dto.address?.trim() || null,
            status: customer_status.Active,
          },
        });

        await tx.customer_wallets.create({
          data: { customer_id: customer.id, balance: 0 },
        });

        return customer;
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('customer_id or phone already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);

    const updateData: {
      phone?: string;
      name?: string | null;
      email?: string | null;
      address?: string | null;
      status?: customer_status;
      updated_at: Date;
    } = { updated_at: new Date() };

    if (dto.phone !== undefined) {
      const normalizedPhone = normalizePhone(dto.phone);
      if (!/^\d{10}$/.test(normalizedPhone)) {
        throw new BadRequestException('Phone must be a 10-digit number');
      }
      updateData.phone = normalizedPhone;
    }

    if (dto.name !== undefined) updateData.name = dto.name.trim() || null;
    if (dto.email !== undefined) updateData.email = dto.email.trim() || null;
    if (dto.address !== undefined) updateData.address = dto.address.trim() || null;
    if (dto.status !== undefined) updateData.status = dto.status;

    try {
      return await this.prisma.customers.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Phone already in use by another customer');
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
