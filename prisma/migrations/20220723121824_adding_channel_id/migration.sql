/*
  Warnings:

  - A unique constraint covering the columns `[channelId]` on the table `DynamicRole` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `channelId` to the `DynamicRole` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DynamicRole" ADD COLUMN     "channelId" VARCHAR(18) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DynamicRole_channelId_key" ON "DynamicRole"("channelId");
