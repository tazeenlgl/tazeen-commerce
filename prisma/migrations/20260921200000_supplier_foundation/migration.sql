-- CreateSchema

-- CreateEnum
CREATE TYPE "supplier_type" AS ENUM ('Manufacturer', 'Wholesaler', 'Distributor', 'Brand', 'Other');

-- CreateEnum
CREATE TYPE "supplier_status" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "supplier_address_type" AS ENUM ('Office', 'Sale Office', 'Head Office', 'Billing Address', 'Shipping Address', 'Other');

-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL,
    "supplier_code" VARCHAR(50) NOT NULL,
    "supplier_name" VARCHAR(200) NOT NULL,
    "supplier_type" "supplier_type" NOT NULL DEFAULT 'Manufacturer',
    "contact_person" VARCHAR(200),
    "mobile" VARCHAR(20) NOT NULL,
    "alternate_mobile" VARCHAR(20),
    "email" VARCHAR(320),
    "gstin" VARCHAR(20),
    "pan" VARCHAR(20),
    "status" "supplier_status" NOT NULL DEFAULT 'Active',
    "internal_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_addresses" (
    "id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "address_type" "supplier_address_type" NOT NULL DEFAULT 'Office',
    "address_line_1" VARCHAR(300),
    "address_line_2" VARCHAR(300),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "pin_code" VARCHAR(10),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "supplier_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_bank_accounts" (
    "id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "bank_name" VARCHAR(200),
    "account_number" VARCHAR(34),
    "ifsc" VARCHAR(20),
    "branch" VARCHAR(200),
    "account_holder_name" VARCHAR(200),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "supplier_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_supplier_code_key" ON "suppliers"("supplier_code");

-- CreateIndex
CREATE INDEX "suppliers_supplier_name_idx" ON "suppliers"("supplier_name");

-- CreateIndex
CREATE INDEX "suppliers_mobile_idx" ON "suppliers"("mobile");

-- CreateIndex
CREATE INDEX "suppliers_gstin_idx" ON "suppliers"("gstin");

-- CreateIndex
CREATE INDEX "suppliers_status_idx" ON "suppliers"("status");

-- CreateIndex
CREATE INDEX "supplier_addresses_supplier_id_idx" ON "supplier_addresses"("supplier_id");

-- CreateIndex
CREATE INDEX "supplier_bank_accounts_supplier_id_idx" ON "supplier_bank_accounts"("supplier_id");

-- AddForeignKey
ALTER TABLE "supplier_addresses" ADD CONSTRAINT "supplier_addresses_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_bank_accounts" ADD CONSTRAINT "supplier_bank_accounts_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
