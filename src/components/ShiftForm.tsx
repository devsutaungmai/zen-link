'use client'

import React, { useState, useEffect } from 'react'
import { ShiftType, WageType } from '@prisma/client'
import { useUser } from '@/app/lib/useUser'

const formatDateForDisplay = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateStr;
  }
}

const parseDateForSubmission = (displayDate: string): string => {
  try {
    const [day, month, year] = displayDate.split('/');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return displayDate;
  }
}

interface ShiftFormData {
  date: string
  startTime: string
  endTime: string
  employeeId?: string
  employeeGroupId?: string
  shiftType: ShiftType
  breakStart?: string
  breakEnd?: string
  wage: number
  wageType: WageType
  note?: string
  approved: boolean
}

interface ShiftFormProps {
  initialData?: ShiftFormData
  onSubmit: (data: ShiftFormData) => void
  onCancel: () => void
  loading: boolean
  employees: { id: string; firstName: string; lastName: string }[]
  employeeGroups: { id: string; name: string }[]
  showEmployee?: boolean
  showStartTime?: boolean
  showDate?: boolean
}

export default function ShiftForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
  employees,
  employeeGroups,
  showEmployee = true,
  showStartTime = true,
  showDate = true,
}: ShiftFormProps) {
  const { user } = useUser() // Get the current user
  const isEmployee = user?.role === 'EMPLOYEE'

  const today = new Date()
  const todayString = today.toISOString().split('T')[0]

  // Add display date state
  const [displayDate, setDisplayDate] = useState<string>('')

  const [formData, setFormData] = useState<ShiftFormData>(() => {
    return initialData || {
      date: todayString,
      startTime: '09:00',
      endTime: '17:00',
      shiftType: 'NORMAL',
      wage: 0,
      wageType: 'HOURLY',
      approved: false,
      employeeId: undefined,
      employeeGroupId: undefined,
      breakStart: undefined,
      breakEnd: undefined,
      note: undefined,
    }
  })

  const [showBreakFields, setShowBreakFields] = useState<boolean>(() => {
    return initialData ? !!initialData.breakStart || !!initialData.breakEnd : false
  })

  // Set display date when formData changes
  useEffect(() => {
    setDisplayDate(formatDateForDisplay(formData.date))
  }, [formData.date])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Block submission if user is an employee
    if (isEmployee) {
      return
    }
    
    // Convert the display date back to YYYY-MM-DD for submission
    const submissionData = {
      ...formData,
      date: parseDateForSubmission(displayDate)
    }
    onSubmit(submissionData)
  }

  const toggleBreakFields = () => {
    const newShowBreakFields = !showBreakFields
    setShowBreakFields(newShowBreakFields)

    if (!newShowBreakFields) {
      setFormData({
        ...formData,
        breakStart: undefined,
        breakEnd: undefined,
      })
    } else {
      setFormData({
        ...formData,
        breakStart: '12:00',
        breakEnd: '13:00',
      })
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplayDate = e.target.value;
    setDisplayDate(newDisplayDate);
    
    // Update the actual form data with the parsed date
    try {
      const [day, month, year] = newDisplayDate.split('/');
      if (day && month && year && year.length === 4) {
        const parsedDate = `${year}-${month}-${day}`;
        setFormData({ ...formData, date: parsedDate });
      }
    } catch (e) {
      // If parsing fails, keep the display value but don't update form data
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* If user is employee, add a notice at the top */}
        {isEmployee && (
          <div className="sm:col-span-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-700">
              As an employee, you can view shifts but cannot create or edit them.
            </p>
          </div>
        )}
      
        {/* Form fields with disabled attribute based on role */}
        {showDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={displayDate}
              onChange={handleDateChange}
              disabled={isEmployee} // Disable if employee
              placeholder="DD/MM/YYYY"
              className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#31BCFF] focus:ring-[#31BCFF] ${isEmployee ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
            />
            <p className="mt-1 text-xs text-gray-500">Format: DD/MM/YYYY</p>
          </div>
        )}

        {/* Shift Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Shift Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.shiftType}
            onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as ShiftType })}
            disabled={isEmployee} // Disable if employee
            className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#31BCFF] focus:ring-[#31BCFF] ${isEmployee ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
          >
            {Object.values(ShiftType).map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Start Time */}
        {showStartTime && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              disabled={isEmployee} // Disable if employee
              className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#31BCFF] focus:ring-[#31BCFF] ${isEmployee ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
            />
          </div>
        )}

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            disabled={isEmployee} // Disable if employee
            className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#31BCFF] focus:ring-[#31BCFF] ${isEmployee ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
          />
        </div>

        {/* Employee */}
        {showEmployee && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee</label>
            <select
              value={formData.employeeId || ''}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value || undefined })}
              disabled={isEmployee} // Disable if employee
              className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#31BCFF] focus:ring-[#31BCFF] ${isEmployee ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Select an employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Employee Group */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Employee Group</label>
          <select
            value={formData.employeeGroupId || ''}
            onChange={(e) => setFormData({ ...formData, employeeGroupId: e.target.value || undefined })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#31BCFF] focus:ring-[#31BCFF]"
          >
            <option value="">Select a group</option>
            {employeeGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* Wage */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Wage (THB) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={isNaN(formData.wage) ? '' : formData.wage}
            onChange={(e) => {
              const value = parseFloat(e.target.value)
              setFormData({ ...formData, wage: isNaN(value) ? 0 : value })
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#31BCFF] focus:ring-[#31BCFF]"
            required
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={formData.note || ''}
            onChange={(e) => setFormData({ ...formData, note: e.target.value || undefined })}
            rows={3}
            disabled={isEmployee} // Disable if employee
            className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#31BCFF] focus:ring-[#31BCFF] ${isEmployee ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Approved */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.approved}
              onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
              className="rounded border-gray-300 text-[#31BCFF] focus:ring-[#31BCFF]"
            />
            <span className="text-sm text-gray-700">Approved</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31BCFF]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || isEmployee} // Disable if employee or loading
          className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31BCFF] disabled:opacity-50 ${
            isEmployee ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#31BCFF] hover:bg-[#31BCFF]/90'
          }`}
          title={isEmployee ? "Employees cannot create or edit shifts" : ""}
        >
          {loading ? 'Saving...' : isEmployee ? 'Not Authorized' : 'Save'}
        </button>
      </div>
    </form>
  )
}
