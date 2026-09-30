/*
  Warnings:

  - You are about to drop the column `categoryId` on the `technicianProfiles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "technicianProfiles" DROP CONSTRAINT "technicianProfiles_categoryId_fkey";

-- AlterTable
ALTER TABLE "technicianProfiles" DROP COLUMN "categoryId";
