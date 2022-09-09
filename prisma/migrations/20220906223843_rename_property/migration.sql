/*
  Warnings:

  - You are about to drop the column `emoji` on the `DynamicRole` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[guildEmojiId]` on the table `DynamicRole` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `guildEmojiId` to the `DynamicRole` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DynamicRole_emoji_key";

-- AlterTable
ALTER TABLE "DynamicRole" DROP COLUMN "emoji",
ADD COLUMN     "guildEmojiId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DynamicRole_guildEmojiId_key" ON "DynamicRole"("guildEmojiId");
