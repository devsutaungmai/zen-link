/*
  Warnings:

  - Added the required column `city` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Department` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "address2" TEXT,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "postCode" TEXT;
