-- CreateEnum
CREATE TYPE "WageType" AS ENUM ('HOURLY', 'PER_SHIFT');

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "employeeGroupId" TEXT;

-- CreateTable
CREATE TABLE "EmployeeGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hourlyWage" DOUBLE PRECISION NOT NULL,
    "wagePerShift" DOUBLE PRECISION NOT NULL,
    "defaultWageType" "WageType" NOT NULL DEFAULT 'HOURLY',
    "salaryCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeGroup_name_key" ON "EmployeeGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeGroup_salaryCode_key" ON "EmployeeGroup"("salaryCode");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_employeeGroupId_fkey" FOREIGN KEY ("employeeGroupId") REFERENCES "EmployeeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
