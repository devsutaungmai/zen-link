'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ActiveShiftTimer from '@/components/ActiveShiftTimer'

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeNo: string
  department: string
  employeeGroup?: string
}

interface Shift {
  id: string
  date: string
  startTime: string
  endTime: string | null
  employee: {
    firstName: string
    lastName: string
  }
  employeeGroup?: {
    name: string
  }
  department?: {
    name: string
  }
}

export default function EmployeeDashboard() {
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [activeShift, setActiveShift] = useState<Shift | null>(null)
  const [loading, setLoading] = useState(true)
  const [clockingIn, setClockingIn] = useState(false)
  const [clockingOut, setClockingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployeeData()
  }, [])

  const fetchEmployeeData = async () => {
    try {
      // Get current employee from cookie/session
      const res = await fetch('/api/employee/me')
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/employee/login')
          return
        }
        throw new Error('Failed to fetch employee data')
      }

      const employeeData = await res.json()
      setEmployee(employeeData)

      // Check for active shift
      const activeShiftRes = await fetch('/api/shifts/active')
      if (activeShiftRes.ok) {
        const activeShiftData = await activeShiftRes.json()
        setActiveShift(activeShiftData)
      }
    } catch (error) {
      console.error('Error fetching employee data:', error)
      setError('Failed to load employee data')
    } finally {
      setLoading(false)
    }
  }

  const handleClockIn = async () => {
    if (!employee) return

    setClockingIn(true)
    setError(null)

    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.id,
          date: new Date().toISOString().split('T')[0],
          startTime: new Date().toISOString(),
          // Don't include endTime for active shifts
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to clock in')
      }

      const newShift = await res.json()
      setActiveShift(newShift)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setClockingIn(false)
    }
  }

  const handleClockOut = async () => {
    if (!activeShift) return

    setClockingOut(true)
    setError(null)

    try {
      const res = await fetch(`/api/shifts/${activeShift.id}/end`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endTime: new Date().toISOString(),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to clock out')
      }

      setActiveShift(null)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setClockingOut(false)
    }
  }

  const handleLogout = () => {
    // Clear the employee token cookie
    document.cookie = 'employee_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    router.push('/employee/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#31BCFF]"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load employee data</p>
          <button
            onClick={() => router.push('/employee/login')}
            className="bg-[#31BCFF] text-white px-4 py-2 rounded-md hover:bg-[#31BCFF]/90"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Punch Clock</h1>
              <p className="text-sm text-gray-600">
                Welcome, {employee.firstName} {employee.lastName} ({employee.employeeNo})
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Employee Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-gray-900">{employee.firstName} {employee.lastName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Employee ID</label>
              <p className="text-gray-900">{employee.employeeNo}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Department</label>
              <p className="text-gray-900">{employee.department}</p>
            </div>
            {employee.employeeGroup && (
              <div>
                <label className="text-sm font-medium text-gray-500">Employee Group</label>
                <p className="text-gray-900">{employee.employeeGroup}</p>
              </div>
            )}
          </div>
        </div>

        {/* Punch Clock Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Time Clock</h2>
          
          {activeShift ? (
            <div className="text-center">
              <div className="mb-6">
                <ActiveShiftTimer shift={activeShift} />
              </div>
              <button
                onClick={handleClockOut}
                disabled={clockingOut}
                className="bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {clockingOut ? 'Clocking Out...' : 'Clock Out'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-6">Ready to start your shift?</p>
              <button
                onClick={handleClockIn}
                disabled={clockingIn}
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {clockingIn ? 'Clocking In...' : 'Clock In'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
