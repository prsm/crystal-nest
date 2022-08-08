/*
  Warnings:

  - A unique constraint covering the columns `[roleId]` on the table `DynamicRole` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roleId` to the `DynamicRole` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DynamicRole" ADD COLUMN     "roleId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DynamicRole_roleId_key" ON "DynamicRole"("roleId");
