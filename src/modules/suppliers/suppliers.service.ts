import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SupplierType, SupplierStatus, SupplierAddressType } from '@prisma/client';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreateSupplierAddressDto } from './dto/create-supplier-address.dto';
import { UpdateSupplierAddressDto } from './dto/update-supplier-address.dto';
import { CreateSupplierBankAccountDto } from './dto/create-supplier-bank-account.dto';
import { UpdateSupplierBankAccountDto } from './dto/update-supplier-bank-account.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSupplierDto) {
    const supplierCode = dto.supplier_code.trim();
    const supplierName = dto.supplier_name.trim();
    const mobile = dto.mobile.trim();

    try {
      return await this.prisma.supplier.create({
        data: {
          supplierCode,
          supplierName,
          supplierType:
            dto.supplier_type === 'Manufacturer'
              ? SupplierType.MANUFACTURER
              : dto.supplier_type === 'Wholesaler'
                ? SupplierType.WHOLESALER
                : dto.supplier_type === 'Distributor'
                  ? SupplierType.DISTRIBUTOR
                  : dto.supplier_type === 'Brand'
                    ? SupplierType.BRAND
                    : dto.supplier_type === 'Other'
                      ? SupplierType.OTHER
                      : SupplierType.MANUFACTURER,
          contactPerson: dto.contact_person?.trim() || null,
          mobile,
          alternateMobile: dto.alternate_mobile?.trim() || null,
          email: dto.email?.trim() || null,
          gstin: dto.gstin?.trim() || null,
          pan: dto.pan?.trim() || null,
          status: dto.status
            ? SupplierStatus[dto.status as keyof typeof SupplierStatus]
            : SupplierStatus.ACTIVE,
          internalNotes: dto.internal_notes?.trim() || null,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Supplier code already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateSupplierDto) {
    const existing = await this.prisma.supplier.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Supplier not found');
    }

    const data: Prisma.SupplierUpdateInput = {};

    if (dto.supplier_name !== undefined) {
      data.supplierName = dto.supplier_name.trim();
    }

    if (dto.supplier_type !== undefined) {
      data.supplierType =
        dto.supplier_type === 'Manufacturer'
          ? SupplierType.MANUFACTURER
          : dto.supplier_type === 'Wholesaler'
            ? SupplierType.WHOLESALER
            : dto.supplier_type === 'Distributor'
              ? SupplierType.DISTRIBUTOR
              : dto.supplier_type === 'Brand'
                ? SupplierType.BRAND
                : SupplierType.OTHER;
    }

    if (dto.contact_person !== undefined) {
      data.contactPerson = dto.contact_person.trim() || null;
    }

    if (dto.mobile !== undefined) {
      data.mobile = dto.mobile.trim();
    }

    if (dto.alternate_mobile !== undefined) {
      data.alternateMobile = dto.alternate_mobile.trim() || null;
    }

    if (dto.email !== undefined) {
      data.email = dto.email.trim() || null;
    }

    if (dto.gstin !== undefined) {
      data.gstin = dto.gstin.trim() || null;
    }

    if (dto.pan !== undefined) {
      data.pan = dto.pan.trim() || null;
    }

    if (dto.status !== undefined) {
      data.status =
        dto.status === 'Active'
          ? SupplierStatus.ACTIVE
          : SupplierStatus.INACTIVE;
    }

    if (dto.internal_notes !== undefined) {
      data.internalNotes = dto.internal_notes.trim() || null;
    }

    try {
      return await this.prisma.supplier.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Supplier already conflicts with an existing unique value');
      }
      throw error;
    }
  }

  async findAll(params: {
    status?: string;
    supplierType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);

    const search = params.search?.trim();

    const where: any = {
      ...(params.status ? { status: params.status as any } : {}),
      ...(params.supplierType
        ? { supplierType: params.supplierType as any }
        : {}),
      ...(search
        ? {
            OR: [
              {
                supplierName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                supplierCode: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                mobile: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                gstin: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.supplier.findMany({
        where,
        select: {
          id: true,
          supplierCode: true,
          supplierName: true,
          supplierType: true,
          contactPerson: true,
          mobile: true,
          alternateMobile: true,
          email: true,
          gstin: true,
          pan: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              addresses: true,
              bankAccounts: true,
            },
          },
        },
        orderBy: [{ supplierName: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: { createdAt: 'asc' },
        },
        bankAccounts: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async findAddresses(supplierId: string) {
    await this.ensureSupplierExists(supplierId);

    return this.prisma.supplierAddress.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createAddress(
    supplierId: string,
    dto: CreateSupplierAddressDto,
  ) {
    await this.ensureSupplierExists(supplierId);

    return this.prisma.supplierAddress.create({
      data: {
        supplierId,
        addressType: this.mapAddressType(dto.address_type),
        addressLine1: dto.address_line_1?.trim() || null,
        addressLine2: dto.address_line_2?.trim() || null,
        city: dto.city?.trim() || null,
        state: dto.state?.trim() || null,
        pinCode: dto.pin_code?.trim() || null,
      },
    });
  }

  async updateAddress(
    supplierId: string,
    addressId: string,
    dto: UpdateSupplierAddressDto,
  ) {
    const address = await this.prisma.supplierAddress.findFirst({
      where: { id: addressId, supplierId },
      select: { id: true },
    });

    if (!address) {
      throw new NotFoundException('Supplier address not found');
    }

    const data: Prisma.SupplierAddressUpdateInput = {};

    if (dto.address_type !== undefined) {
      data.addressType = this.mapAddressType(dto.address_type);
    }
    if (dto.address_line_1 !== undefined) {
      data.addressLine1 = dto.address_line_1.trim() || null;
    }
    if (dto.address_line_2 !== undefined) {
      data.addressLine2 = dto.address_line_2.trim() || null;
    }
    if (dto.city !== undefined) {
      data.city = dto.city.trim() || null;
    }
    if (dto.state !== undefined) {
      data.state = dto.state.trim() || null;
    }
    if (dto.pin_code !== undefined) {
      data.pinCode = dto.pin_code.trim() || null;
    }

    return this.prisma.supplierAddress.update({
      where: { id: addressId },
      data,
    });
  }

  async findBankAccounts(supplierId: string) {
    await this.ensureSupplierExists(supplierId);

    return this.prisma.supplierBankAccount.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createBankAccount(
    supplierId: string,
    dto: CreateSupplierBankAccountDto,
  ) {
    await this.ensureSupplierExists(supplierId);

    return this.prisma.supplierBankAccount.create({
      data: {
        supplierId,
        bankName: dto.bank_name?.trim() || null,
        accountNumber: dto.account_number?.trim() || null,
        ifsc: dto.ifsc?.trim() || null,
        branch: dto.branch?.trim() || null,
        accountHolderName: dto.account_holder_name?.trim() || null,
      },
    });
  }

  async updateBankAccount(
    supplierId: string,
    bankAccountId: string,
    dto: UpdateSupplierBankAccountDto,
  ) {
    const account = await this.prisma.supplierBankAccount.findFirst({
      where: { id: bankAccountId, supplierId },
      select: { id: true },
    });

    if (!account) {
      throw new NotFoundException('Supplier bank account not found');
    }

    const data: Prisma.SupplierBankAccountUpdateInput = {};

    if (dto.bank_name !== undefined) {
      data.bankName = dto.bank_name.trim() || null;
    }
    if (dto.account_number !== undefined) {
      data.accountNumber = dto.account_number.trim() || null;
    }
    if (dto.ifsc !== undefined) {
      data.ifsc = dto.ifsc.trim() || null;
    }
    if (dto.branch !== undefined) {
      data.branch = dto.branch.trim() || null;
    }
    if (dto.account_holder_name !== undefined) {
      data.accountHolderName =
        dto.account_holder_name.trim() || null;
    }

    return this.prisma.supplierBankAccount.update({
      where: { id: bankAccountId },
      data,
    });
  }

  private async ensureSupplierExists(supplierId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
  }

  private mapAddressType(value: string): SupplierAddressType {
    const map: Record<string, SupplierAddressType> = {
      Office: SupplierAddressType.OFFICE,
      'Sale Office': SupplierAddressType.SALE_OFFICE,
      'Head Office': SupplierAddressType.HEAD_OFFICE,
      'Billing Address': SupplierAddressType.BILLING_ADDRESS,
      'Shipping Address': SupplierAddressType.SHIPPING_ADDRESS,
      Other: SupplierAddressType.OTHER,
    };

    return map[value];
  }

}
