'use client'

import { useState, useEffect } from 'react'
import { CalendarIcon, UserGroupIcon, ClockIcon, ChartBarIcon, PlayIcon } from '@heroicons/react/24/outline'
import { useUser } from '@/app/lib/useUser'
import PunchClockModal from '@/components/PunchClockModal'
import ActiveShiftTimer from '@/components/ActiveShiftTimer'

interface Employee {
  id: string
  firstName: string
  lastName: string
  userId: string
}

interface EmployeeGroup {
  id: string
  name: string
}

interface Department {
  id: string
  name: string
}

interface ActiveShift {
  id: string
  startTime: string
  date: string
  department?: {
    name: string
  }
  employeeGroup?: {
    name: string
  }
}

const stats = [
  { name: 'Total Employees', value: '25', icon: UserGroupIcon },
  { name: 'Hours Scheduled', value: '156', icon: ClockIcon },
  { name: 'Shifts Today', value: '12', icon: CalendarIcon },
  { name: 'Weekly Hours', value: '480', icon: ChartBarIcon },
]

export default function DashboardPage() {
  const { user, loading } = useUser()
  const [showShiftModal, setShowShiftModal] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeGroups, setEmployeeGroups] = useState<EmployeeGroup[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [submittingShift, setSubmittingShift] = useState(false)
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null)
  const [loadingActiveShift, setLoadingActiveShift] = useState(false)
  const [endingShift, setEndingShift] = useState(false)

  // Fetch data needed for the shift form and check for active shifts
  useEffect(() => {
    if (user?.role === 'EMPLOYEE') {
      fetchEmployees()
      fetchEmployeeGroups()
      fetchDepartments()
      fetchActiveShift()
    }
  }, [user])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchEmployeeGroups = async () => {
    try {
      const response = await fetch('/api/employee-groups')
      if (response.ok) {
        const data = await response.json()
        setEmployeeGroups(data)
      }
    } catch (error) {
      console.error('Error fetching employee groups:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchActiveShift = async () => {
    console.log('🔍 Fetching active shift...')
    setLoadingActiveShift(true)
    try {
      const response = await fetch('/api/shifts/active')
      console.log('📡 Active shift response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Active shift data:', data)
        setActiveShift(data.activeShift)
      }
    } catch (error) {
      console.error('Error fetching active shift:', error)
    } finally {
      setLoadingActiveShift(false)
    }
  }

  const handleStartNewShift = () => {
    setShowShiftModal(true)
  }

  const handleShiftFormSubmit = async (formData: any) => {
    console.log('🚀 Submitting shift form with data:', formData)
    setSubmittingShift(true)
    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      console.log('📡 Shift creation response status:', response.status)
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Shift created successfully:', result)
        setShowShiftModal(false)
        // Refresh active shift data
        console.log('🔄 Refreshing active shift data...')
        await fetchActiveShift()
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to create shift:', errorData)
        throw new Error('Failed to create shift')
      }
    } catch (error) {
      console.error('Error creating shift:', error)
    } finally {
      setSubmittingShift(false)
    }
  }

  const handleEndShift = async (shiftId: string) => {
    setEndingShift(true)
    try {
      const response = await fetch(`/api/shifts/${shiftId}/end`, {
        method: 'PATCH',
      })

      if (response.ok) {
        setActiveShift(null)
      } else {
        throw new Error('Failed to end shift')
      }
    } catch (error) {
      console.error('Error ending shift:', error)
    } finally {
      setEndingShift(false)
    }
  }

  const currentEmployee = employees.find(emp => 
    emp.userId === user?.id
  )

  const getInitialShiftData = () => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5)

    return {
      date: today,
      startTime: currentTime,
      employeeId: currentEmployee?.id || '',
      employeeGroupId: '',
      shiftType: 'NORMAL',
      wage: 0,
      wageType: 'HOURLY',
      approved: false,
      note: ''
    }
  }

  if (loading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>

      {/* Punch Clock Card - Only for Employees */}
      {user?.role === 'EMPLOYEE' && (
        <div className="mt-8">
          {activeShift ? (
            <ActiveShiftTimer
              activeShift={activeShift}
              onEndShift={handleEndShift}
              loading={endingShift}
            />
          ) : (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Punch Clock</h3>
                    <p className="text-sm text-gray-500 mt-1">Working as an extra shift today?</p>
                  </div>
                  <button 
                    onClick={handleStartNewShift}
                    disabled={loadingActiveShift}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#31BCFF] hover:bg-[#31BCFF]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31BCFF] disabled:opacity-50"
                  >
                    <PlayIcon className="h-5 w-5 mr-2" />
                    {loadingActiveShift ? 'Loading...' : 'Start New Shift'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
            <div className="mt-4">
              <div className="border-t border-gray-200">
                <p className="py-4 text-sm text-gray-500">No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Punch Clock Modal */}
      {user?.role === 'EMPLOYEE' && (
        <PunchClockModal
          isOpen={showShiftModal}
          onClose={() => setShowShiftModal(false)}
          initialData={getInitialShiftData()}
          employees={employees}
          employeeGroups={employeeGroups}
          departments={departments}
          onSubmit={handleShiftFormSubmit}
          loading={submittingShift}
        />
      )}
    </div>
  )
}