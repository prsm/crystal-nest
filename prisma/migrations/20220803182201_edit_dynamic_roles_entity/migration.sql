/*
  Warnings:

  - Added the required column `createdBy` to the `DynamicRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DynamicRole` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DynamicRole" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#ff6969',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
