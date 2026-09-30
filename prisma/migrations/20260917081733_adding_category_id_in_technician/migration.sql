-- AlterTable
ALTER TABLE "technicianProfiles" ADD COLUMN     "categoryId" TEXT;

-- AddForeignKey
ALTER TABLE "technicianProfiles" ADD CONSTRAINT "technicianProfiles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
