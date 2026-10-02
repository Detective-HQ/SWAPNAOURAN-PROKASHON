-- Read back what Shiprocket actually billed on the AWB, so a courier charging a
-- heavier slab than we quoted is recorded instead of silently absorbed.
ALTER TABLE "Order" ADD COLUMN "actualShippingCharge" DECIMAL(10,2),
ADD COLUMN "actualCourierName" TEXT,
ADD COLUMN "shippingShortfall" DECIMAL(10,2),
ADD COLUMN "awbFailureReason" TEXT;