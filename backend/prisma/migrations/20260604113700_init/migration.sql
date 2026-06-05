CREATE TYPE "CashRegisterStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "OrderStatus" AS ENUM ('OPEN', 'PAID', 'DELETED');

CREATE TABLE "categories" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "products" (
  "id" SERIAL NOT NULL,
  "category_id" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DECIMAL(12,2) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cash_registers" (
  "id" SERIAL NOT NULL,
  "initial_amount" DECIMAL(12,2) NOT NULL,
  "total_sales" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "expected_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "status" "CashRegisterStatus" NOT NULL DEFAULT 'OPEN',
  "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closed_at" TIMESTAMP(3),
  "opening_note" TEXT,
  "closing_note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "cash_registers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "orders" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'OPEN',
  "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "cash_register_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paid_at" TIMESTAMP(3),
  "deleted_at" TIMESTAMP(3),
  "delete_note" TEXT,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_items" (
  "id" SERIAL NOT NULL,
  "order_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "product_name_snapshot" TEXT NOT NULL,
  "product_price_snapshot" DECIMAL(12,2) NOT NULL,
  "quantity" INTEGER NOT NULL,
  "subtotal" DECIMAL(12,2) NOT NULL,
  "added_order" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE INDEX "products_category_id_idx" ON "products"("category_id");
CREATE INDEX "products_name_idx" ON "products"("name");
CREATE INDEX "cash_registers_status_idx" ON "cash_registers"("status");
CREATE UNIQUE INDEX "cash_registers_one_open_idx" ON "cash_registers"("status") WHERE "status" = 'OPEN';
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_cash_register_id_idx" ON "orders"("cash_register_id");
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

ALTER TABLE "products"
  ADD CONSTRAINT "products_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_cash_register_id_fkey"
  FOREIGN KEY ("cash_register_id") REFERENCES "cash_registers"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "order_items"
  ADD CONSTRAINT "order_items_order_id_fkey"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_items"
  ADD CONSTRAINT "order_items_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "products"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
