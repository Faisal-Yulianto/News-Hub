-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "createById" TEXT;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_createById_fkey" FOREIGN KEY ("createById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
