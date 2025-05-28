/*
  Warnings:

  - A unique constraint covering the columns `[name,businessId]` on the table `EmployeeGroup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[salaryCode,businessId]` on the table `EmployeeGroup` will be added. If there are existing duplicate values, this will fail.
  - Made the column `businessId` on table `Department` required. This step will fail if there are existing NULL values in that column.
  - Made the column `businessId` on table `EmployeeGroup` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_businessId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeGroup" DROP CONSTRAINT "EmployeeGroup_businessId_fkey";

-- AlterTable
ALTER TABLE "Department" ALTER COLUMN "businessId" SET NOT NULL;

-- AlterTable
ALTER TABLE "EmployeeGroup" ALTER COLUMN "businessId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Shift" ALTER COLUMN "endTime" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeGroup_name_businessId_key" ON "EmployeeGroup"("name", "businessId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeGroup_salaryCode_businessId_key" ON "EmployeeGroup"("salaryCode", "businessId");

-- AddForeignKey
ALTER TABLE "EmployeeGroup" ADD CONSTRAINT "EmployeeGroup_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
