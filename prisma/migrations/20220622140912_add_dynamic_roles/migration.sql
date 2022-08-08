/*
  Warnings:

  - You are about to drop the `Test` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Test";

-- CreateTable
CREATE TABLE "DynamicRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" VARCHAR(42) NOT NULL,
    "emojiId" TEXT NOT NULL,
    "amountOfSubscribers" INTEGER NOT NULL,

    CONSTRAINT "DynamicRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DynamicRole_name_key" ON "DynamicRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DynamicRole_emojiId_key" ON "DynamicRole"("emojiId");
