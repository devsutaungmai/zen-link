import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import PunchClockForm from "./PunchClockForm"

interface Employee {
  id: string
  firstName: string
  lastName: string
}

interface EmployeeGroup {
  id: string
  name: string
}

interface Department {
  id: string
  name: string
}

interface PunchClockModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: any
  employees: Employee[]
  employeeGroups: EmployeeGroup[]
  departments: Department[]
  onSubmit: (formData: any) => void
  loading: boolean
}

export default function PunchClockModal({
  isOpen,
  onClose,
  initialData,
  employees,
  employeeGroups,
  departments,
  onSubmit,
  loading
}: PunchClockModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Start New Shift</DialogTitle>
        </DialogHeader>
        <PunchClockForm
          initialData={initialData}
          employees={employees}
          employeeGroups={employeeGroups}
          departments={departments}
          onSubmit={onSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  )
}
