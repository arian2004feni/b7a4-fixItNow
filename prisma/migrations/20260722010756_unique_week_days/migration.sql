/*
  Warnings:

  - A unique constraint covering the columns `[technicianId,dayOfWeek]` on the table `availabilitySlots` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "availabilitySlots_technicianId_dayOfWeek_key" ON "availabilitySlots"("technicianId", "dayOfWeek");
