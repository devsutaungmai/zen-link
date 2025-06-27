-- DropIndex
DROP INDEX "EmployeeGroup_salaryCode_businessId_key";

-- AlterTable
ALTER TABLE "EmployeeGroup" ALTER COLUMN "salaryCode" DROP NOT NULL;
