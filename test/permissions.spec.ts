import { Controller, Get, UseGuards } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup-app';
import { SessionService } from '../src/auth/session.service';
import { SessionAuthGuard } from '../src/auth/session-auth.guard';
import { PermissionGuard } from '../src/auth/permissions/permission.guard';
import { PermissionsService } from '../src/auth/permissions/permissions.service';
import { RequirePermission } from '../src/auth/permissions/require-permission.decorator';
import { PERMISSIONS_KEY } from '../src/auth/permissions/require-permission.decorator';

// Every controller AUTH-03 must protect end-to-end.
import { CategoriesController } from '../src/modules/catalog/categories.controller';
import { SubcategoriesController } from '../src/modules/catalog/subcategories.controller';
import { ProductsController } from '../src/modules/products/products.controller';
import { SkusController } from '../src/modules/products/skus.controller';
import { SkuAttributesController } from '../src/modules/products/sku-attributes.controller';
import { LocationsController } from '../src/modules/locations/locations.controller';
import { TransactionReasonsController } from '../src/modules/transaction-reasons/transaction-reasons.controller';
import { SuppliersController } from '../src/modules/suppliers/suppliers.controller';
import { InventoryController } from '../src/modules/inventory/inventory.controller';
import { PurchaseInvoicesController } from '../src/modules/purchase-invoices/purchase-invoices.controller';

const AUTH_COOKIE_NAME = 'tazeen_session'; // non-production cookie name (see auth-cookie.ts)
const VALID_TOKEN = 'valid-test-token';

const PROTECTED_CONTROLLERS = [
  CategoriesController,
  SubcategoriesController,
  ProductsController,
  SkusController,
  SkuAttributesController,
  LocationsController,
  TransactionReasonsController,
  SuppliersController,
  InventoryController,
  PurchaseInvoicesController,
];

describe('every business controller handler declares a permission', () => {
  it.each(PROTECTED_CONTROLLERS)('%p has @RequirePermission on every route handler', (controllerClass) => {
    const prototype = controllerClass.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
    const methodNames = Object.getOwnPropertyNames(prototype).filter(
      (name) => name !== 'constructor' && typeof prototype[name] === 'function',
    );

    expect(methodNames.length).toBeGreaterThan(0);

    for (const name of methodNames) {
      const codes = Reflect.getMetadata(PERMISSIONS_KEY, prototype[name] as object);
      expect(codes).toBeDefined();
      expect(Array.isArray(codes)).toBe(true);
      expect(codes.length).toBeGreaterThan(0);
    }
  });
});

@Controller('probe-permissions')
@UseGuards(SessionAuthGuard, PermissionGuard)
class ProbePermissionsController {
  @Get('needs-product-read')
  @RequirePermission('product.read')
  needsProductRead() {
    return { ok: true };
  }
}

describe('permission enforcement (end to end)', () => {
  let app: NestExpressApplication;
  let permissionsService: { getPermissionCodes: jest.Mock };

  beforeAll(async () => {
    const fakeSessionService = {
      getActiveSession: jest.fn(async (token: string) => {
        if (token !== VALID_TOKEN) return null;
        return {
          id: 'session-1',
          user_id: 'user-1',
          expires_at: new Date(Date.now() + 1000 * 60),
          users: { id: 'user-1', phone: '9999999999', full_name: 'Test User', status: 'Active' },
        };
      }),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [ProbePermissionsController],
    })
      .overrideProvider(SessionService)
      .useValue(fakeSessionService)
      .overrideProvider(PermissionsService)
      .useValue({ getPermissionCodes: jest.fn() })
      .compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    setupApp(app);
    await app.init();

    permissionsService = moduleRef.get(PermissionsService) as unknown as typeof permissionsService;
  });

  afterAll(() => app.close());

  it('rejects with 401 when there is no session cookie', async () => {
    await request(app.getHttpServer())
      .get('/api/probe-permissions/needs-product-read')
      .expect(401);
  });

  it('rejects with 403 when authenticated but missing the required permission', async () => {
    permissionsService.getPermissionCodes.mockResolvedValue(new Set(['product.create']));

    await request(app.getHttpServer())
      .get('/api/probe-permissions/needs-product-read')
      .set('Cookie', `${AUTH_COOKIE_NAME}=${VALID_TOKEN}`)
      .expect(403);
  });

  it('succeeds when authenticated with the required permission', async () => {
    permissionsService.getPermissionCodes.mockResolvedValue(new Set(['product.read']));

    await request(app.getHttpServer())
      .get('/api/probe-permissions/needs-product-read')
      .set('Cookie', `${AUTH_COOKIE_NAME}=${VALID_TOKEN}`)
      .expect(200, { ok: true });
  });

  it('leaves the health route unaffected (no session, no permission check)', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(permissionsService.getPermissionCodes).not.toHaveBeenCalledWith(undefined);
  });

  it('leaves auth/me unaffected by permission checks (still 401 without a session)', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });
});
