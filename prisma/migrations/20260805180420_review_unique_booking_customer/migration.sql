/*
  Warnings:

  - A unique constraint covering the columns `[bookingId]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bookingId,customerId]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "reviews_bookingId_key" ON "reviews"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_bookingId_customerId_key" ON "reviews"("bookingId", "customerId");
