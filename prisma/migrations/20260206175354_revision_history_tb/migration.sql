/*
  Warnings:

  - You are about to drop the `read_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."read_history" DROP CONSTRAINT "read_history_newsId_fkey";

-- DropForeignKey
ALTER TABLE "public"."read_history" DROP CONSTRAINT "read_history_userId_fkey";

-- DropTable
DROP TABLE "public"."read_history";

-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "lastViewedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "History_userId_lastViewedAt_idx" ON "History"("userId", "lastViewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "History_userId_newsId_key" ON "History"("userId", "newsId");

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
