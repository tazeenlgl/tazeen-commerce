-- CreateEnum
CREATE TYPE "purchase_return_status" AS ENUM ('Completed', 'Cancelled');

-- CreateTable
CREATE TABLE "purchase_return_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "purchase_return_id" UUID NOT NULL,
    "original_invoice_item_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "sku_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purchase_rate" DECIMAL(14,2) NOT NULL,
    "gst_rate" DECIMAL(5,2) NOT NULL,
    "taxable_value" DECIMAL(14,2) NOT NULL,
    "cgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "igst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "gst_amount" DECIMAL(14,2) NOT NULL,
    "total_value" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_returns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "return_no" VARCHAR(50) NOT NULL,
    "purchase_invoice_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "return_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" VARCHAR(200) NOT NULL,
    "status" "purchase_return_status" NOT NULL DEFAULT 'Completed',
    "taxable_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sgst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "igst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "gst_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_returns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "purchase_return_items_return_idx" ON "purchase_return_items"("purchase_return_id");

-- CreateIndex
CREATE INDEX "purchase_return_items_invoice_item_idx" ON "purchase_return_items"("original_invoice_item_id");

-- CreateIndex
CREATE INDEX "purchase_return_items_sku_idx" ON "purchase_return_items"("sku_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_returns_return_no_key" ON "purchase_returns"("return_no");

-- CreateIndex
CREATE INDEX "purchase_returns_invoice_idx" ON "purchase_returns"("purchase_invoice_id");

-- CreateIndex
CREATE INDEX "purchase_returns_supplier_idx" ON "purchase_returns"("supplier_id");

-- CreateIndex
CREATE INDEX "purchase_returns_location_idx" ON "purchase_returns"("location_id");

-- CreateIndex
CREATE INDEX "purchase_returns_date_idx" ON "purchase_returns"("return_date");

-- CreateIndex
CREATE INDEX "purchase_returns_status_idx" ON "purchase_returns"("status");

-- AddForeignKey
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_return_fk" FOREIGN KEY ("purchase_return_id") REFERENCES "purchase_returns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_invoice_item_fk" FOREIGN KEY ("original_invoice_item_id") REFERENCES "purchase_invoice_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_product_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_sku_fk" FOREIGN KEY ("sku_id") REFERENCES "product_skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_invoice_fk" FOREIGN KEY ("purchase_invoice_id") REFERENCES "purchase_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_supplier_fk" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_location_fk" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

