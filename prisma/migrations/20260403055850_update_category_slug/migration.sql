/*
  Warnings:

  - Made the column `icon` on table `Category` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `Category` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "icon" SET NOT NULL,
ALTER COLUMN "slug" SET NOT NULL;
