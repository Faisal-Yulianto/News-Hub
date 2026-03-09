-- AlterTable
ALTER TABLE "PageVisit" ADD COLUMN     "visitDate" DATE;

-- CreateIndex
CREATE INDEX "PageVisit_visitDate_idx" ON "PageVisit"("visitDate");
