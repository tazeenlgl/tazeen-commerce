import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface DateRange {
  from: Date;
  to: Date;
}

interface SalesRegisterParams {
  fromDate: string;
  toDate: string;
  locationId?: string;
  gstRate?: number;
  page?: number;
  limit?: number;
}

interface GstSummaryParams {
  fromDate: string;
  toDate: string;
  locationId?: string;
  gstRate?: number;
}

interface SalesRegisterRow {
  row_type: 'Sale' | 'Return';
  reference_no: string;
  date: Date;
  location_id: string;
  sku_id: string;
  product_id: string;
  quantity: number;
  gst_rate: Prisma.Decimal;
  taxable_value: Prisma.Decimal;
  cgst_amount: Prisma.Decimal;
  sgst_amount: Prisma.Decimal;
  igst_amount: Prisma.Decimal;
  gst_amount: Prisma.Decimal;
  total_value: Prisma.Decimal;
}

/**
 * Reports are read-only aggregations over existing transactional tables.
 * They never mutate state and reuse the same indexed date/location/status
 * fields already relied on by SALES-01/02/03.
 *
 * Exchange transactions are intentionally excluded from both reports:
 * exchange_replacement_items stores only mrp/discount_amount/net_value —
 * no gst_rate/taxable_value/cgst/sgst/igst columns — so a correct GST
 * breakdown cannot be produced for the replacement leg without inventing
 * or estimating figures, which is explicitly disallowed. Only completed
 * sales and completed plain returns (return_type = 'Return') are reported.
 */
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private parseDateRange(fromDate: string, toDate: string): DateRange {
    const from = new Date(`${fromDate}T00:00:00.000Z`);
    const to = new Date(`${toDate}T23:59:59.999Z`);

    if (Number.isNaN(from.getTime())) {
      throw new BadRequestException('from_date must be a valid date');
    }
    if (Number.isNaN(to.getTime())) {
      throw new BadRequestException('to_date must be a valid date');
    }
    if (from.getTime() > to.getTime()) {
      throw new BadRequestException('from_date must not be after to_date');
    }

    return { from, to };
  }

  async salesRegister(params: SalesRegisterParams) {
    const { from, to } = this.parseDateRange(params.fromDate, params.toDate);
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 200);
    const offset = (page - 1) * limit;

    const locationFilter = params.locationId
      ? Prisma.sql`AND location_id = ${params.locationId}::uuid`
      : Prisma.empty;
    const gstRateFilter = params.gstRate !== undefined
      ? Prisma.sql`AND gst_rate = ${params.gstRate}`
      : Prisma.empty;

    // Sale rows are reported at their stored, authoritative values. Return
    // rows are derived by proration against the ORIGINAL invoice item's
    // stored gst_rate/taxable/GST fields (sales_return_items itself only
    // persists unit_value/total_value) — this reconstructs the exact
    // historical tax split rather than estimating it, since it uses the
    // same rate and ratio SALES-02 itself used to compute total_value.
    const unionQuery = Prisma.sql`
      SELECT * FROM (
        SELECT
          'Sale' AS row_type,
          si.invoice_no AS reference_no,
          si.invoice_date AS date,
          si.location_id AS location_id,
          sii.sku_id AS sku_id,
          sii.product_id AS product_id,
          sii.quantity AS quantity,
          sii.gst_rate AS gst_rate,
          sii.taxable_value AS taxable_value,
          sii.cgst_amount AS cgst_amount,
          sii.sgst_amount AS sgst_amount,
          sii.igst_amount AS igst_amount,
          sii.gst_amount AS gst_amount,
          sii.total_value AS total_value
        FROM sales_invoice_items sii
        JOIN sales_invoices si ON si.id = sii.sales_invoice_id
        WHERE si.status = 'Completed'
          AND si.invoice_date BETWEEN ${from} AND ${to}
          ${params.locationId ? Prisma.sql`AND si.location_id = ${params.locationId}::uuid` : Prisma.empty}
          ${params.gstRate !== undefined ? Prisma.sql`AND sii.gst_rate = ${params.gstRate}` : Prisma.empty}

        UNION ALL

        SELECT
          'Return' AS row_type,
          sr.return_no AS reference_no,
          sr.return_date AS date,
          sr.location_id AS location_id,
          sri.sku_id AS sku_id,
          sri.product_id AS product_id,
          -sri.quantity AS quantity,
          sii.gst_rate AS gst_rate,
          -(sii.taxable_value * sri.quantity / sii.quantity) AS taxable_value,
          -(sii.cgst_amount * sri.quantity / sii.quantity) AS cgst_amount,
          -(sii.sgst_amount * sri.quantity / sii.quantity) AS sgst_amount,
          -(sii.igst_amount * sri.quantity / sii.quantity) AS igst_amount,
          -(sii.gst_amount * sri.quantity / sii.quantity) AS gst_amount,
          -(sii.total_value * sri.quantity / sii.quantity) AS total_value
        FROM sales_return_items sri
        JOIN sales_returns sr ON sr.id = sri.sales_return_id
        JOIN sales_invoice_items sii ON sii.id = sri.original_invoice_item_id
        WHERE sr.status = 'Completed'
          AND sr.return_type = 'Return'
          AND sr.return_date BETWEEN ${from} AND ${to}
          ${params.locationId ? Prisma.sql`AND sr.location_id = ${params.locationId}::uuid` : Prisma.empty}
          ${params.gstRate !== undefined ? Prisma.sql`AND sii.gst_rate = ${params.gstRate}` : Prisma.empty}
      ) combined
      ORDER BY date ASC, reference_no ASC, sku_id ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countQuery = Prisma.sql`
      SELECT COUNT(*)::text AS total FROM (
        SELECT si.id
        FROM sales_invoice_items sii
        JOIN sales_invoices si ON si.id = sii.sales_invoice_id
        WHERE si.status = 'Completed'
          AND si.invoice_date BETWEEN ${from} AND ${to}
          ${params.locationId ? Prisma.sql`AND si.location_id = ${params.locationId}::uuid` : Prisma.empty}
          ${params.gstRate !== undefined ? Prisma.sql`AND sii.gst_rate = ${params.gstRate}` : Prisma.empty}

        UNION ALL

        SELECT sr.id
        FROM sales_return_items sri
        JOIN sales_returns sr ON sr.id = sri.sales_return_id
        JOIN sales_invoice_items sii ON sii.id = sri.original_invoice_item_id
        WHERE sr.status = 'Completed'
          AND sr.return_type = 'Return'
          AND sr.return_date BETWEEN ${from} AND ${to}
          ${params.locationId ? Prisma.sql`AND sr.location_id = ${params.locationId}::uuid` : Prisma.empty}
          ${params.gstRate !== undefined ? Prisma.sql`AND sii.gst_rate = ${params.gstRate}` : Prisma.empty}
      ) combined
    `;

    const [rows, countRows] = await Promise.all([
      this.prisma.$queryRaw<SalesRegisterRow[]>(unionQuery),
      this.prisma.$queryRaw<{ total: string }[]>(countQuery),
    ]);

    const total = parseInt(countRows[0]?.total ?? '0', 10);

    return {
      items: rows,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }

  async gstSummary(params: GstSummaryParams) {
    const { from, to } = this.parseDateRange(params.fromDate, params.toDate);

    const grossRows = await this.prisma.$queryRaw<
      { gst_rate: Prisma.Decimal; taxable_value: Prisma.Decimal; cgst_amount: Prisma.Decimal; sgst_amount: Prisma.Decimal; igst_amount: Prisma.Decimal; gst_amount: Prisma.Decimal }[]
    >(Prisma.sql`
      SELECT
        sii.gst_rate AS gst_rate,
        COALESCE(SUM(sii.taxable_value), 0) AS taxable_value,
        COALESCE(SUM(sii.cgst_amount), 0) AS cgst_amount,
        COALESCE(SUM(sii.sgst_amount), 0) AS sgst_amount,
        COALESCE(SUM(sii.igst_amount), 0) AS igst_amount,
        COALESCE(SUM(sii.gst_amount), 0) AS gst_amount
      FROM sales_invoice_items sii
      JOIN sales_invoices si ON si.id = sii.sales_invoice_id
      WHERE si.status = 'Completed'
        AND si.invoice_date BETWEEN ${from} AND ${to}
        ${params.locationId ? Prisma.sql`AND si.location_id = ${params.locationId}::uuid` : Prisma.empty}
        ${params.gstRate !== undefined ? Prisma.sql`AND sii.gst_rate = ${params.gstRate}` : Prisma.empty}
      GROUP BY sii.gst_rate
    `);

    const returnRows = await this.prisma.$queryRaw<
      { gst_rate: Prisma.Decimal; taxable_value: Prisma.Decimal; cgst_amount: Prisma.Decimal; sgst_amount: Prisma.Decimal; igst_amount: Prisma.Decimal; gst_amount: Prisma.Decimal }[]
    >(Prisma.sql`
      SELECT
        sii.gst_rate AS gst_rate,
        COALESCE(SUM(sii.taxable_value * sri.quantity / sii.quantity), 0) AS taxable_value,
        COALESCE(SUM(sii.cgst_amount * sri.quantity / sii.quantity), 0) AS cgst_amount,
        COALESCE(SUM(sii.sgst_amount * sri.quantity / sii.quantity), 0) AS sgst_amount,
        COALESCE(SUM(sii.igst_amount * sri.quantity / sii.quantity), 0) AS igst_amount,
        COALESCE(SUM(sii.gst_amount * sri.quantity / sii.quantity), 0) AS gst_amount
      FROM sales_return_items sri
      JOIN sales_returns sr ON sr.id = sri.sales_return_id
      JOIN sales_invoice_items sii ON sii.id = sri.original_invoice_item_id
      WHERE sr.status = 'Completed'
        AND sr.return_type = 'Return'
        AND sr.return_date BETWEEN ${from} AND ${to}
        ${params.locationId ? Prisma.sql`AND sr.location_id = ${params.locationId}::uuid` : Prisma.empty}
        ${params.gstRate !== undefined ? Prisma.sql`AND sii.gst_rate = ${params.gstRate}` : Prisma.empty}
      GROUP BY sii.gst_rate
    `);

    const grossByRate = new Map(grossRows.map((r) => [r.gst_rate.toString(), r]));
    const returnByRate = new Map(returnRows.map((r) => [r.gst_rate.toString(), r]));
    const allRates = new Set([...grossByRate.keys(), ...returnByRate.keys()]);

    const zero = new Prisma.Decimal(0);
    const byRate = [...allRates].map((rateKey) => {
      const gross = grossByRate.get(rateKey);
      const ret = returnByRate.get(rateKey);

      const grossTaxable = gross ? new Prisma.Decimal(gross.taxable_value) : zero;
      const grossCgst = gross ? new Prisma.Decimal(gross.cgst_amount) : zero;
      const grossSgst = gross ? new Prisma.Decimal(gross.sgst_amount) : zero;
      const grossIgst = gross ? new Prisma.Decimal(gross.igst_amount) : zero;
      const grossGst = gross ? new Prisma.Decimal(gross.gst_amount) : zero;

      const returnTaxable = ret ? new Prisma.Decimal(ret.taxable_value) : zero;
      const returnCgst = ret ? new Prisma.Decimal(ret.cgst_amount) : zero;
      const returnSgst = ret ? new Prisma.Decimal(ret.sgst_amount) : zero;
      const returnIgst = ret ? new Prisma.Decimal(ret.igst_amount) : zero;
      const returnGst = ret ? new Prisma.Decimal(ret.gst_amount) : zero;

      return {
        gst_rate: new Prisma.Decimal(rateKey),
        gross_taxable_value: grossTaxable,
        return_taxable_value: returnTaxable,
        net_taxable_value: grossTaxable.minus(returnTaxable),
        gross_cgst_amount: grossCgst,
        return_cgst_amount: returnCgst,
        net_cgst_amount: grossCgst.minus(returnCgst),
        gross_sgst_amount: grossSgst,
        return_sgst_amount: returnSgst,
        net_sgst_amount: grossSgst.minus(returnSgst),
        gross_igst_amount: grossIgst,
        return_igst_amount: returnIgst,
        net_igst_amount: grossIgst.minus(returnIgst),
        gross_gst_amount: grossGst,
        return_gst_amount: returnGst,
        net_gst_amount: grossGst.minus(returnGst),
      };
    });

    const totals = byRate.reduce(
      (acc, r) => ({
        gross_sales: acc.gross_sales.plus(r.gross_taxable_value).plus(r.gross_gst_amount),
        sales_returns: acc.sales_returns.plus(r.return_taxable_value).plus(r.return_gst_amount),
        gross_taxable_value: acc.gross_taxable_value.plus(r.gross_taxable_value),
        return_taxable_value: acc.return_taxable_value.plus(r.return_taxable_value),
        gross_cgst_amount: acc.gross_cgst_amount.plus(r.gross_cgst_amount),
        return_cgst_amount: acc.return_cgst_amount.plus(r.return_cgst_amount),
        gross_sgst_amount: acc.gross_sgst_amount.plus(r.gross_sgst_amount),
        return_sgst_amount: acc.return_sgst_amount.plus(r.return_sgst_amount),
        gross_igst_amount: acc.gross_igst_amount.plus(r.gross_igst_amount),
        return_igst_amount: acc.return_igst_amount.plus(r.return_igst_amount),
        gross_gst_amount: acc.gross_gst_amount.plus(r.gross_gst_amount),
        return_gst_amount: acc.return_gst_amount.plus(r.return_gst_amount),
      }),
      {
        gross_sales: zero,
        sales_returns: zero,
        gross_taxable_value: zero,
        return_taxable_value: zero,
        gross_cgst_amount: zero,
        return_cgst_amount: zero,
        gross_sgst_amount: zero,
        return_sgst_amount: zero,
        gross_igst_amount: zero,
        return_igst_amount: zero,
        gross_gst_amount: zero,
        return_gst_amount: zero,
      },
    );

    return {
      from_date: params.fromDate,
      to_date: params.toDate,
      by_gst_rate: byRate,
      totals: {
        gross_sales: totals.gross_sales,
        sales_returns: totals.sales_returns,
        net_sales: totals.gross_sales.minus(totals.sales_returns),
        gross_taxable_value: totals.gross_taxable_value,
        return_taxable_value: totals.return_taxable_value,
        net_taxable_value: totals.gross_taxable_value.minus(totals.return_taxable_value),
        gross_cgst_amount: totals.gross_cgst_amount,
        return_cgst_amount: totals.return_cgst_amount,
        net_cgst_amount: totals.gross_cgst_amount.minus(totals.return_cgst_amount),
        gross_sgst_amount: totals.gross_sgst_amount,
        return_sgst_amount: totals.return_sgst_amount,
        net_sgst_amount: totals.gross_sgst_amount.minus(totals.return_sgst_amount),
        gross_igst_amount: totals.gross_igst_amount,
        return_igst_amount: totals.return_igst_amount,
        net_igst_amount: totals.gross_igst_amount.minus(totals.return_igst_amount),
        gross_gst_amount: totals.gross_gst_amount,
        return_gst_amount: totals.return_gst_amount,
        net_gst_amount: totals.gross_gst_amount.minus(totals.return_gst_amount),
      },
    };
  }
}
