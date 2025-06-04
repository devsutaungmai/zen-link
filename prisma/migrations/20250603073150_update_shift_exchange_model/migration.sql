/*
  Warnings:

  - You are about to drop the column `pin` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `exchangedAt` on the `ShiftExchange` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `ShiftExchange` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Employee_pin_key";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "pin";

-- AlterTable
ALTER TABLE "ShiftExchange" DROP COLUMN "exchangedAt",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
