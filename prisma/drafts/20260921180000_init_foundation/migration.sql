-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "IdentityProvider" AS ENUM ('PHONE_OTP', 'TRUECALLER', 'EMAIL', 'GOOGLE', 'APPLE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('STORE', 'WAREHOUSE', 'ONLINE_FULFILLMENT');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('OPENING', 'PURCHASE_RECEIPT', 'SALE', 'RETURN', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT');

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(20),
    "name" VARCHAR(200),
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_identities" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "provider" "IdentityProvider" NOT NULL,
    "provider_subject" VARCHAR(320) NOT NULL,
    "verified_at" TIMESTAMPTZ(6),
    "last_used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "customer_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "name" VARCHAR(300) NOT NULL,
    "brand" VARCHAR(200),
    "description" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "name" VARCHAR(200),
    "attributes" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skus" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "sku12" VARCHAR(12),
    "legacy_sku8" VARCHAR(8),
    "barcode" VARCHAR(64),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "skus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "type" "LocationType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "sku_id" UUID NOT NULL,
    "quantity_on_hand" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" UUID NOT NULL,
    "inventory_item_id" UUID NOT NULL,
    "type" "InventoryMovementType" NOT NULL,
    "quantity_delta" INTEGER NOT NULL,
    "reason" VARCHAR(500),
    "reference_type" VARCHAR(50),
    "reference_id" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");

-- CreateIndex
CREATE INDEX "customers_status_idx" ON "customers"("status");

-- CreateIndex
CREATE INDEX "customer_identities_customer_id_idx" ON "customer_identities"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_identities_provider_provider_subject_key" ON "customer_identities"("provider", "provider_subject");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "skus_sku12_key" ON "skus"("sku12");

-- CreateIndex
CREATE UNIQUE INDEX "skus_legacy_sku8_key" ON "skus"("legacy_sku8");

-- CreateIndex
CREATE UNIQUE INDEX "skus_barcode_key" ON "skus"("barcode");

-- CreateIndex
CREATE INDEX "skus_variant_id_idx" ON "skus"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "locations_code_key" ON "locations"("code");

-- CreateIndex
CREATE INDEX "locations_type_idx" ON "locations"("type");

-- CreateIndex
CREATE INDEX "inventory_items_sku_id_idx" ON "inventory_items"("sku_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_location_id_sku_id_key" ON "inventory_items"("location_id", "sku_id");

-- CreateIndex
CREATE INDEX "inventory_movements_inventory_item_id_created_at_idx" ON "inventory_movements"("inventory_item_id", "created_at");

-- CreateIndex
CREATE INDEX "inventory_movements_type_idx" ON "inventory_movements"("type");

-- CreateIndex
CREATE INDEX "inventory_movements_reference_type_reference_id_idx" ON "inventory_movements"("reference_type", "reference_id");

-- AddForeignKey
ALTER TABLE "customer_identities" ADD CONSTRAINT "customer_identities_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skus" ADD CONSTRAINT "skus_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Data-integrity rules Prisma cannot express in schema.prisma.
ALTER TABLE "skus" ADD CONSTRAINT "skus_sku12_format_chk" CHECK ("sku12" IS NULL OR "sku12" ~ '^[0-9]{12}$');
ALTER TABLE "skus" ADD CONSTRAINT "skus_legacy_sku8_format_chk" CHECK ("legacy_sku8" IS NULL OR "legacy_sku8" ~ '^[0-9]{8}$');
ALTER TABLE "skus" ADD CONSTRAINT "skus_has_a_code_chk" CHECK ("sku12" IS NOT NULL OR "legacy_sku8" IS NOT NULL);
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_qty_nonneg_chk" CHECK ("quantity_on_hand" >= 0);
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_delta_nonzero_chk" CHECK ("quantity_delta" <> 0);
