import ShiftForm from './ShiftForm'

interface ShiftModalProps {
  show: boolean
  initialData: any
  employees: Employee[]
  employeeGroups: EmployeeGroup[]
  onSubmit: (data: any) => void
  onCancel: () => void
  loading: boolean
}

export default function ShiftModal({
  show,
  initialData,
  employees,
  employeeGroups,
  onSubmit,
  onCancel,
  loading,
}: ShiftModalProps) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
        <ShiftForm
          initialData={initialData}
          employees={employees}
          employeeGroups={employeeGroups}
          onSubmit={onSubmit}
          onCancel={onCancel}
          loading={loading}
        />
      </div>
    </div>
  )
}