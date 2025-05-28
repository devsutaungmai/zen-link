'use client'

import React, { useState, useEffect } from 'react'
import { ShiftType, WageType } from '@prisma/client'
import { useUser } from '@/app/lib/useUser'

interface PunchClockFormData {
  date: string
  startTime: string
  employeeId: string
  employeeGroupId?: string
  shiftType: ShiftType
  wage: number
  wageType: WageType
  note?: string
  approved: boolean
}

interface PunchClockFormProps {
  initialData?: Partial<PunchClockFormData>
  onSubmit: (data: PunchClockFormData) => void
  onCancel: () => void
  loading: boolean
  employees: { id: string; firstName: string; lastName: string; userId?: string }[]
  employeeGroups: { id: string; name: string }[]
  departments: { id: string; name: string }[]
}

export default function PunchClockForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
  employees,
  employeeGroups,
  departments,
}: PunchClockFormProps) {
  const { user } = useUser()

  const [formData, setFormData] = useState<PunchClockFormData>(() => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5)

    // Find current employee by user ID
    const currentEmployee = employees.find(emp => emp.userId === user?.id)

    return {
      date: today,
      startTime: currentTime,
      employeeId: currentEmployee?.id || '',
      employeeGroupId: '',
      shiftType: 'NORMAL' as ShiftType,
      wage: 0,
      wageType: 'HOURLY' as WageType,
      approved: false,
      note: '',
      ...initialData,
    }
  })

  const [selectedDepartment, setSelectedDepartment] = useState<string>('')

  // Filter employee groups by selected department
  const filteredEmployeeGroups = selectedDepartment
    ? employeeGroups.filter(group => 
        // You may need to adjust this filter based on your data structure
        // For now, showing all groups
        true
      )
    : employeeGroups

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const formatDateForDisplay = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    } catch (e) {
      return dateStr
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Date - Read only, showing today */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="text"
            value={formatDateForDisplay(formData.date)}
            disabled
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Start Time - Current time, read only */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Time</label>
          <input
            type="time"
            value={formData.startTime}
            disabled
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Employee - Pre-selected current user, read only */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Employee</label>
          <input
            type="text"
            value={user ? `${user.firstName} ${user.lastName}` : ''}
            disabled
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Department Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#31BCFF] focus:ring-[#31BCFF]"
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Employee Group Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Employee Group</label>
          <select
            value={formData.employeeGroupId || ''}
            onChange={(e) => setFormData({ ...formData, employeeGroupId: e.target.value || undefined })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#31BCFF] focus:ring-[#31BCFF]"
            required
          >
            <option value="">Select Employee Group</option>
            {filteredEmployeeGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* Shift Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Shift Type</label>
          <select
            value={formData.shiftType}
            onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as ShiftType })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#31BCFF] focus:ring-[#31BCFF]"
          >
            <option value="NORMAL">Normal</option>
            <option value="ABSENT">Absent</option>
            <option value="ARRIVED_LATE">Arrived Late</option>
            <option value="MEETING">Meeting</option>
            <option value="SICK">Sick</option>
            <option value="TIME_OFF">Time Off</option>
            <option value="TRAINING">Training</option>
          </select>
        </div>

        {/* Wage */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Wage</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.wage}
            onChange={(e) => setFormData({ ...formData, wage: parseFloat(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#31BCFF] focus:ring-[#31BCFF]"
            required
          />
        </div>

        {/* Note */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Note</label>
          <textarea
            value={formData.note || ''}
            onChange={(e) => setFormData({ ...formData, note: e.target.value || undefined })}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#31BCFF] focus:ring-[#31BCFF]"
            placeholder="Optional note for this shift..."
          />
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
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-[#31BCFF] border border-transparent rounded-md hover:bg-[#31BCFF]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31BCFF] disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Start Shift'}
        </button>
      </div>
    </form>
  )
}
