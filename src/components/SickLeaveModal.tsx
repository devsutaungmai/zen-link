import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import SickLeaveForm from "./SickLeaveForm"

interface SickLeaveFormData {
  employeeId?: string
  startDate: string
  endDate: string
  reason?: string
  document?: string
}

interface SickLeaveModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: SickLeaveFormData & { id?: string }
  onSubmit: (data: SickLeaveFormData) => void
  loading: boolean
  employees?: { id: string; firstName: string; lastName: string; employeeNo?: string }[]
  showEmployeeSelection?: boolean
  isEmployee?: boolean
}

export default function SickLeaveModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  loading,
  employees = [],
  showEmployeeSelection = false,
  isEmployee = false
}: SickLeaveModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Edit Sick Leave' : 'Add Sick Leave'}
          </DialogTitle>
        </DialogHeader>
        <SickLeaveForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          loading={loading}
          employees={employees}
          showEmployeeSelection={showEmployeeSelection}
          isEmployee={isEmployee}
        />
      </DialogContent>
    </Dialog>
  )
}
