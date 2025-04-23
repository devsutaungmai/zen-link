'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Sex } from '@prisma/client'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface EmployeeFormData {
  firstName: string
  lastName: string
  birthday: Date
  sex: Sex
  socialSecurityNo: string
  address: string
  mobile: string
  employeeNo: string
  bankAccount: string
  hoursPerMonth: number
  dateOfHire: Date
  isTeamLeader: boolean
  departmentId: string
  employeeGroupId?: string
}

interface EmployeeFormProps {
  initialData?: Partial<EmployeeFormData>
  onSubmit: (data: EmployeeFormData) => void
  loading: boolean
  departments: Array<{ id: string; name: string }>
  employeeGroups: Array<{ id: string; name: string }>
}

export default function EmployeeForm({
  initialData,
  onSubmit,
  loading,
  departments,
  employeeGroups,
}: EmployeeFormProps) {
  const [formData, setFormData] = React.useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    birthday: new Date(),
    sex: 'MALE',
    socialSecurityNo: '',
    address: '',
    mobile: '',
    employeeNo: '',
    bankAccount: '',
    hoursPerMonth: 0,
    dateOfHire: new Date(),
    isTeamLeader: false,
    departmentId: '',
    ...initialData
  })

  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof EmployeeFormData) => {
    const value = parseFloat(e.target.value) || 0
    setFormData({ ...formData, [field]: value })
  }

  const handleDateChange = (date: Date | null, field: keyof EmployeeFormData) => {
    if (date) {
      setFormData({ ...formData, [field]: date })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Personal Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Birthday <span className="text-red-500">*</span>
          </label>
          <DatePicker
            selected={formData.birthday}
            onChange={(date) => handleDateChange(date, 'birthday')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Employment Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Social Security Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="socialSecurityNo"
            value={formData.socialSecurityNo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Employee Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="employeeNo"
            value={formData.employeeNo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date of Hire <span className="text-red-500">*</span>
          </label>
          <DatePicker
            selected={formData.dateOfHire}
            onChange={(date) => handleDateChange(date, 'dateOfHire')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hours Per Month <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.hoursPerMonth}
            onChange={(e) => handleNumberChange(e, 'hoursPerMonth')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        {/* Department and Group */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            name="departmentId"
            value={formData.departmentId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          >
            <option value="">Select a department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Employee Group
          </label>
          <select
            name="employeeGroupId"
            value={formData.employeeGroupId || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
          >
            <option value="">No group</option>
            {employeeGroups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* Contact Information */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mobile <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bank Account <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="bankAccount"
            value={formData.bankAccount}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
            required
          />
        </div>

        {/* Team Leader Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isTeamLeader"
            checked={formData.isTeamLeader}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-[#31BCFF] focus:ring-[#31BCFF]"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Team Leader
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
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
