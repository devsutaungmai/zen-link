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
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {initialData?.id ? 'Edit Shift' : 'Create New Shift'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <span className="text-xl">&times;</span>
          </button>
        </div>
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
      </div>
    </div>
  )
}