-- DropIndex
DROP INDEX "EmployeeGroup_name_key";

-- DropIndex
DROP INDEX "EmployeeGroup_salaryCode_key";

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "businessId" TEXT;

-- AlterTable
ALTER TABLE "EmployeeGroup" ADD COLUMN     "businessId" TEXT;

-- AddForeignKey
ALTER TABLE "EmployeeGroup" ADD CONSTRAINT "EmployeeGroup_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
