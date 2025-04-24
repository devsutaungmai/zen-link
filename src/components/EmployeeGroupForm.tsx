import React from 'react'

export enum WageType {
  HOURLY = 'HOURLY',
  PER_SHIFT = 'PER_SHIFT'
}

interface EmployeeGroupFormData {
  name: string
  hourlyWage: number
  wagePerShift: number
  defaultWageType: WageType
  salaryCode: string
}

interface EmployeeGroupFormProps {
  initialData?: EmployeeGroupFormData
  onSubmit: (data: EmployeeGroupFormData) => void
  loading: boolean
}

export default function EmployeeGroupForm({ initialData, onSubmit, loading }: EmployeeGroupFormProps) {
  const [formData, setFormData] = React.useState<EmployeeGroupFormData>(
    initialData || {
      name: '',
      hourlyWage: 0,
      wagePerShift: 0,
      defaultWageType: WageType.HOURLY,
      salaryCode: '',
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleWageChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof EmployeeGroupFormData) => {
    // Remove non-numeric characters except decimal point
    const numericValue = e.target.value.replace(/[^0-9.]/g, '')
    // Parse to float or default to 0
    const value = numericValue ? parseFloat(numericValue) : 0
    setFormData({ ...formData, [field]: value })
  }

  const formatCurrency = (value: number) => {
    // Format as THB with 2 decimal places
    return `${value.toFixed(2)}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Group Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Salary Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.salaryCode}
            onChange={(e) => setFormData({ ...formData, salaryCode: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hourly Wage <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">THB</span>
            </div>
            <input
              type="text"
              value={formData.hourlyWage === 0 ? '' : formatCurrency(formData.hourlyWage)}
              onChange={(e) => handleWageChange(e, 'hourlyWage')}
              className="block w-full rounded-md border border-gray-300 py-2 pl-12 pr-3 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Wage Per Shift <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">THB</span>
            </div>
            <input
              type="text"
              value={formData.wagePerShift === 0 ? '' : formatCurrency(formData.wagePerShift)}
              onChange={(e) => handleWageChange(e, 'wagePerShift')}
              className="block w-full rounded-md border border-gray-300 py-2 pl-12 pr-3 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
              required
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Default Wage Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.defaultWageType}
            onChange={(e) => setFormData({ ...formData, defaultWageType: e.target.value as WageType })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          >
            <option value={WageType.HOURLY}>Hourly Wage</option>
            <option value={WageType.PER_SHIFT}>Wage Per Shift</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {}}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31BCFF]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-[#31BCFF] border border-transparent rounded-md hover:bg-[#31BCFF]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31BCFF] disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}
