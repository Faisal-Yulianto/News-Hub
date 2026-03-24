/*
  Warnings:

  - You are about to drop the column `createById` on the `Category` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_createById_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "createById",
ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
