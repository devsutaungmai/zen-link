import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import ShiftForm from "../ShiftForm"

interface ShiftFormModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: any
  employees: Employee[]
  employeeGroups: EmployeeGroup[]
  onSubmit: (formData: any) => void
  viewType: 'week' | 'day'
  loading: boolean
}

export default function ShiftFormModal({
  isOpen,
  onClose,
  initialData,
  employees,
  employeeGroups,
  onSubmit,
  viewType,
  loading
}: ShiftFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Edit Shift' : 'Create New Shift'}
          </DialogTitle>
        </DialogHeader>
        <ShiftForm
          initialData={initialData}
          employees={employees}
          employeeGroups={employeeGroups}
          onSubmit={onSubmit}
          onCancel={onClose}
          loading={loading}
          showEmployee={viewType === 'week'}
          showStartTime={viewType === 'week'}
          showDate={true}
        />
      </DialogContent>
    </Dialog>
  )
}