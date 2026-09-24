import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePurchaseInvoiceDto,
  PurchaseTaxModeDto,
} from './dto/create-purchase-invoice.dto';

@Injectable()
export class PurchaseInvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePurchaseInvoiceDto) {
    const supplierId = dto.supplier_id.trim();
    const invoiceNo = dto.invoice_no.trim();
    const locationId = dto.location_id.trim();

    if (!supplierId || !invoiceNo || !locationId) {
      throw new BadRequestException(
        'supplier_id, invoice_no and location_id are required',
      );
    }

    if (!Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException(
        'At least one purchase invoice item is required',
      );
    }

    const purchaseDate = this.parseDate(dto.purchase_date, 'purchase_date');

    const allowedGstRates = new Set(['0', '5', '12']);

    return this.prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.findUnique({
        where: { id: supplierId },
        select: {
          id: true,
          supplierName: true,
          status: true,
          addresses: {
            select: {
              state: true,
            },
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
        },
      });

      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }

      if (String(supplier.status) !== 'ACTIVE') {
        throw new BadRequestException('Supplier is inactive');
      }

      const location = await tx.locations.findUnique({
        where: { id: locationId },
        select: {
          id: true,
          location_name: true,
          location_type: true,
          status: true,
        },
      });

      if (!location) {
        throw new NotFoundException('Location not found');
      }

      if (String(location.status) !== 'Active') {
        throw new BadRequestException('Location is inactive');
      }

      if (String(location.location_type) !== 'Warehouse') {
        throw new ConflictException(
          'Purchase invoice location must be a Warehouse',
        );
      }

      const skuIds = [
        ...new Set(dto.items.map((item) => item.sku_id.trim())),
      ];

      if (skuIds.some((id) => !id)) {
        throw new BadRequestException('sku_id is required for every item');
      }

      const skus = await tx.product_skus.findMany({
        where: {
          id: { in: skuIds },
        },
        select: {
          id: true,
          sku: true,
          product_id: true,
          status: true,
          products: {
            select: {
              id: true,
              product_name: true,
              status: true,
              gst_rate: true,
              purchase_rate: true,
            },
          },
        },
      });

      const skuMap = new Map(skus.map((sku) => [sku.id, sku]));

      if (skus.length !== skuIds.length) {
        const missing = skuIds.filter((id) => !skuMap.has(id));
        throw new NotFoundException(
          `SKU not found: ${missing.join(', ')}`,
        );
      }

      let subtotal = new Prisma.Decimal(0);
      let taxableValue = new Prisma.Decimal(0);
      let gstAmount = new Prisma.Decimal(0);
      let cgstAmount = new Prisma.Decimal(0);
      let sgstAmount = new Prisma.Decimal(0);
      let igstAmount = new Prisma.Decimal(0);

      const itemData: Prisma.purchase_invoice_itemsCreateManyInput[] = [];

      for (const item of dto.items) {
        const skuId = item.sku_id.trim();
        const sku = skuMap.get(skuId)!;

        if (String(sku.status) !== 'Active') {
          throw new BadRequestException(
            `SKU ${sku.sku} is inactive`,
          );
        }

        if (String(sku.products.status) !== 'Active') {
          throw new BadRequestException(
            `Product ${sku.products.product_name} is inactive`,
          );
        }

        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          throw new BadRequestException(
            `Quantity must be greater than zero for SKU ${sku.sku}`,
          );
        }

        // Purchase rate and GST are Product-level authorities.
        // Never trust client-supplied values for these fields.
        const purchaseRate = new Prisma.Decimal(
          sku.products.purchase_rate,
        );
        const gstRate = new Prisma.Decimal(
          sku.products.gst_rate,
        );

        if (purchaseRate.isNegative()) {
          throw new BadRequestException(
            `Product purchase rate cannot be negative for SKU ${sku.sku}`,
          );
        }

        if (!allowedGstRates.has(gstRate.toString())) {
          throw new BadRequestException(
            `GST rate must be one of 0, 5 or 12 for SKU ${sku.sku}`,
          );
        }

        const quantity = new Prisma.Decimal(item.quantity);
        const gross = purchaseRate.mul(quantity);

        // Purchase rate is GST-inclusive.
        const divisor = new Prisma.Decimal(1).plus(
          gstRate.div(100),
        );
        const taxable = gross.div(divisor);
        const gst = gross.minus(taxable);

        let cgst = new Prisma.Decimal(0);
        let sgst = new Prisma.Decimal(0);
        let igst = new Prisma.Decimal(0);

        if (dto.tax_mode === PurchaseTaxModeDto.INTRA_STATE) {
          cgst = gst.div(2);
          sgst = gst.minus(cgst);
        } else {
          igst = gst;
        }

        subtotal = subtotal.plus(gross);
        taxableValue = taxableValue.plus(taxable);
        gstAmount = gstAmount.plus(gst);
        cgstAmount = cgstAmount.plus(cgst);
        sgstAmount = sgstAmount.plus(sgst);
        igstAmount = igstAmount.plus(igst);

        itemData.push({
          id: crypto.randomUUID(),
          purchase_invoice_id: '',
          sku_id: sku.id,
          product_id: sku.product_id,
          quantity: item.quantity,
          purchase_rate: purchaseRate,
          gst_rate: gstRate,
          taxable_value: taxable,
          cgst_amount: cgst,
          sgst_amount: sgst,
          igst_amount: igst,
          gst_amount: gst,
          total_value: gross,
        });
      }

      const invoice = await tx.purchase_invoices.create({
        data: {
          id: crypto.randomUUID(),
          supplier_id: supplier.id,
          supplier_name: supplier.supplierName,
          supplier_state:
            supplier.addresses[0]?.state?.trim() || '',
          invoice_no: invoiceNo,
          purchase_date: purchaseDate,
          location: location.location_name,
          items_count: dto.items.length,
          taxable_value: taxableValue,
          gst_rate: new Prisma.Decimal(0),
          gst_amount: gstAmount,
          final_value: subtotal,
          document_name: dto.document_name?.trim() || '',
          status: 'Draft',
          subtotal,
          cgst_amount: cgstAmount,
          sgst_amount: sgstAmount,
          igst_amount: igstAmount,
          updated_at: new Date(),
        },
      });

      await tx.purchase_invoice_items.createMany({
        data: itemData.map(({ purchase_invoice_id: _, ...item }) => ({
          ...item,
          purchase_invoice_id: invoice.id,
        })),
      });

      return {
        ...invoice,
        tax_mode: dto.tax_mode,
      };
    });
  }

  async findAll(params: {
    supplierId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);

    const where: any = {
      ...(params.supplierId ? { supplier_id: params.supplierId } : {}),
      ...(params.status ? { status: params.status as any } : {}),
    };

    if (params.fromDate || params.toDate) {
      where.purchase_date = {
        ...(params.fromDate
          ? { gte: this.parseDate(params.fromDate, 'from_date') }
          : {}),
        ...(params.toDate
          ? { lte: this.parseDate(params.toDate, 'to_date') }
          : {}),
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.purchase_invoices.findMany({
        where,
        select: {
          id: true,
          supplier_id: true,
          supplier_name: true,
          supplier_state: true,
          invoice_no: true,
          purchase_date: true,
          location: true,
          items_count: true,
          taxable_value: true,
          gst_amount: true,
          final_value: true,
          status: true,
          subtotal: true,
          cgst_amount: true,
          sgst_amount: true,
          igst_amount: true,
          received_at: true,
          document_name: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: [{ purchase_date: 'desc' }, { created_at: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.purchase_invoices.count({ where }),
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

  async receive(id: string) {
    const invoiceId = id.trim();

    if (!invoiceId) {
      throw new BadRequestException('Purchase invoice id is required');
    }

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.purchase_invoices.findUnique({
        where: { id: invoiceId },
        include: {
          purchase_invoice_items: {
            select: {
              id: true,
              sku_id: true,
              product_id: true,
              quantity: true,
              product_skus: {
                select: {
                  id: true,
                  sku: true,
                  status: true,
                  products: {
                    select: {
                      id: true,
                      product_name: true,
                      status: true,
                    },
                  },
                },
              },
            },
            orderBy: { created_at: 'asc' },
          },
        },
      });

      if (!invoice) {
        throw new NotFoundException('Purchase invoice not found');
      }

      if (String(invoice.status) !== 'Draft') {
        throw new ConflictException(
          `Purchase invoice cannot be received from status ${invoice.status}`,
        );
      }

      if (invoice.purchase_invoice_items.length === 0) {
        throw new BadRequestException(
          'Purchase invoice has no items',
        );
      }

      const locations = await tx.locations.findMany({
        where: {
          location_name: invoice.location,
          location_type: 'Warehouse',
          status: 'Active',
        },
        select: {
          id: true,
          location_name: true,
          location_type: true,
          status: true,
        },
      });

      if (locations.length === 0) {
        throw new ConflictException(
          'Purchase invoice warehouse is not active or no longer exists',
        );
      }

      if (locations.length > 1) {
        throw new ConflictException(
          'Purchase invoice warehouse is ambiguous',
        );
      }

      const location = locations[0];

      for (const item of invoice.purchase_invoice_items) {
        if (String(item.product_skus.status) !== 'Active') {
          throw new BadRequestException(
            `SKU ${item.product_skus.sku} is inactive`,
          );
        }

        if (String(item.product_skus.products.status) !== 'Active') {
          throw new BadRequestException(
            `Product ${item.product_skus.products.product_name} is inactive`,
          );
        }

        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          throw new BadRequestException(
            `Invalid quantity for SKU ${item.product_skus.sku}`,
          );
        }

        const stock = await tx.inventory_stock.findUnique({
          where: {
            sku_id_location_id: {
              sku_id: item.sku_id,
              location_id: location.id,
            },
          },
          select: {
            id: true,
            quantity: true,
          },
        });

        const quantityBefore = stock?.quantity ?? 0;
        const quantityAfter = quantityBefore + item.quantity;

        if (quantityAfter < 0) {
          throw new ConflictException(
            `Stock cannot become negative for SKU ${item.product_skus.sku}`,
          );
        }

        if (stock) {
          await tx.inventory_stock.update({
            where: { id: stock.id },
            data: {
              quantity: quantityAfter,
              updated_at: new Date(),
            },
          });
        } else {
          await tx.inventory_stock.create({
            data: {
              id: crypto.randomUUID(),
              sku_id: item.sku_id,
              location_id: location.id,
              quantity: quantityAfter,
              updated_at: new Date(),
            },
          });
        }

        await tx.inventory_movements.create({
          data: {
            id: crypto.randomUUID(),
            sku_id: item.sku_id,
            location_id: location.id,
            movement_type: 'Purchase',
            quantity_change: item.quantity,
            quantity_before: quantityBefore,
            quantity_after: quantityAfter,
            reference_type: 'Purchase Invoice',
            reference_id: invoice.id,
            reason: `Purchase Invoice ${invoice.invoice_no}`,
          },
        });
      }

      const receivedAt = new Date();

      const updatedInvoice = await tx.purchase_invoices.update({
        where: { id: invoice.id },
        data: {
          status: 'Received',
          received_at: receivedAt,
          updated_at: receivedAt,
        },
      });

      return {
        ...updatedInvoice,
        location_id: location.id,
        location_name: location.location_name,
      };
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.purchase_invoices.findUnique({
      where: { id },
      include: {
        purchase_invoice_items: {
          select: {
            id: true,
            purchase_invoice_id: true,
            sku_id: true,
            product_id: true,
            quantity: true,
            purchase_rate: true,
            gst_rate: true,
            taxable_value: true,
            cgst_amount: true,
            sgst_amount: true,
            igst_amount: true,
            gst_amount: true,
            total_value: true,
            created_at: true,
            updated_at: true,
            product_skus: {
              select: {
                id: true,
                sku: true,
                sequence_no: true,
                mrp: true,
                status: true,
              },
            },
            products: {
              select: {
                id: true,
                product_id: true,
                product_name: true,
                core_sku: true,
                status: true,
              },
            },
          },
          orderBy: { created_at: 'asc' },
        },
        suppliers: {
          select: {
            id: true,
            supplierName: true,
            supplierCode: true,
            supplierType: true,
            mobile: true,
            gstin: true,
            pan: true,
            status: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Purchase invoice not found');
    }

    return invoice;
  }

  private parseDate(value: string, field: string) {
    const date = new Date(`${value}T00:00:00.000Z`);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${field} must be a valid date`);
    }

    return date;
  }
}
