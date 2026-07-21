-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "isActive" SET DEFAULT true;

-- CreateIndex
CREATE INDEX "availabilitySlots_technicianId_idx" ON "availabilitySlots"("technicianId");

-- CreateIndex
CREATE INDEX "services_technicianId_idx" ON "services"("technicianId");

-- CreateIndex
CREATE INDEX "services_categoryId_idx" ON "services"("categoryId");
