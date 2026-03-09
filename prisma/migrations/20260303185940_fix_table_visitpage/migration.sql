/*
  Warnings:

  - Made the column `page` on table `PageVisit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PageVisit" ALTER COLUMN "page" SET NOT NULL;

-- CreateIndex
CREATE INDEX "PageVisit_page_createdAt_idx" ON "PageVisit"("page", "createdAt");

-- CreateIndex
CREATE INDEX "PageVisit_visitorId_page_idx" ON "PageVisit"("visitorId", "page");
