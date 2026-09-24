import { BadRequestException } from '@nestjs/common';
import { ReportsService } from '../src/modules/reports/reports.service';
import { PrismaService } from '../src/prisma/prisma.service';

function makePrisma(overrides: Record<string, any> = {}): PrismaService {
  return {
    $queryRaw: jest.fn().mockResolvedValue([]),
    ...overrides,
  } as unknown as PrismaService;
}

describe('ReportsService — date validation guard clauses (mocked Prisma)', () => {
  it('rejects an invalid from_date', async () => {
    const service = new ReportsService(makePrisma());

    await expect(
      service.salesRegister({ fromDate: 'not-a-date', toDate: '2026-04-30' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an invalid to_date', async () => {
    const service = new ReportsService(makePrisma());

    await expect(
      service.gstSummary({ fromDate: '2026-04-01', toDate: 'not-a-date' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects from_date after to_date', async () => {
    const service = new ReportsService(makePrisma());

    await expect(
      service.salesRegister({ fromDate: '2026-04-30', toDate: '2026-04-01' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts a valid range and queries the database', async () => {
    const queryRaw = jest.fn().mockResolvedValue([]);
    const service = new ReportsService(makePrisma({ $queryRaw: queryRaw }));

    await service.gstSummary({ fromDate: '2026-04-01', toDate: '2026-04-30' });

    expect(queryRaw).toHaveBeenCalled();
  });
});
