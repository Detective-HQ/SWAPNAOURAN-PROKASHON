-- Snapshot package dimensions at checkout so fulfillment uses the same dims as the quote
ALTER TABLE "Order" ADD COLUMN "packageWeightKg" DECIMAL(10,3),
ADD COLUMN "packageLengthCm" DECIMAL(10,2),
ADD COLUMN "packageBreadthCm" DECIMAL(10,2),
ADD COLUMN "packageHeightCm" DECIMAL(10,2);
