-- Add extra catalog metadata and bestseller support for books
ALTER TABLE "Book"
ADD COLUMN "isbn" TEXT,
ADD COLUMN "pageCount" INTEGER,
ADD COLUMN "bindingDetails" TEXT,
ADD COLUMN "copiesSold" INTEGER NOT NULL DEFAULT 0;
