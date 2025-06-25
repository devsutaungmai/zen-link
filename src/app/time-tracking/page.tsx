'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MagnifyingGlassIcon, 
  ClockIcon, 
  UserGroupIcon,
  CalendarIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { useUser } from '@/app/lib/useUser'

interface Business {
  id: string
  name: string
  address: string
  type: string
  employeesCount: number
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeNo: string
  department: {
    name: string
  }
  employeeGroup?: {
    name: string
  }
  email: string
  mobile: string
  isTeamLeader: boolean
}

interface Shift {
  id: string
  date: string
  startTime: string
  endTime: string | null
  shiftType: string
  approved: boolean
  wage: number
  wageType: string
  note?: string
  employee: {
    id: string
    firstName: string
    lastName: string
    employeeNo: string
  }
  employeeGroup?: {
    name: string
  }
}

export default function TimeTrackingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [allShifts, setAllShifts] = useState<Shift[]>([])
  const [workingShifts, setWorkingShifts] = useState<Shift[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchData()
    
    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timeInterval)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchBusiness(),
        fetchEmployees(),
        fetchShifts()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchBusiness = async () => {
    try {
      const res = await fetch('/api/business')
      if (res.ok) {
        const businessData = await res.json()
        setBusiness(businessData)
      } else {
        // Fallback: create a business object from available data
        setBusiness({
          id: '',
          name: 'Your Business',
          address: '',
          type: 'business',
          employeesCount: 0
        })
      }
    } catch (error) {
      console.error('Error fetching business:', error)
      // Fallback business data
      setBusiness({
        id: '',
        name: 'Your Business',
        address: '',
        type: 'business',
        employeesCount: 0
      })
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees')
      if (res.ok) {
        const employeesData = await res.json()
        setEmployees(employeesData)
        
        // Update business employee count if we have business data
        if (business) {
          setBusiness(prev => prev ? { ...prev, employeesCount: employeesData.length } : null)
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchShifts = async () => {
    try {
      // Get today's date range
      const today = new Date()
      const startDate = new Date(today)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(today)
      endDate.setHours(23, 59, 59, 999)

      // Fetch all shifts for today
      const res = await fetch(`/api/shifts?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`)
      if (res.ok) {
        const shiftsData = await res.json()
        setAllShifts(shiftsData)
        
        // Filter working shifts (active shifts without end time)
        const activeShifts = shiftsData.filter((shift: Shift) => !shift.endTime)
        setWorkingShifts(activeShifts)
      }
    } catch (error) {
      console.error('Error fetching shifts:', error)
    }
  }

  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchLower) ||
      employee.employeeNo.toLowerCase().includes(searchLower) ||
      employee.department.name.toLowerCase().includes(searchLower) ||
      (employee.employeeGroup?.name || '').toLowerCase().includes(searchLower) ||
      employee.mobile.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower)

    if (selectedFilter === 'all') return matchesSearch
    if (selectedFilter === 'working') {
      return matchesSearch && workingShifts.some(shift => shift.employee.id === employee.id)
    }
    if (selectedFilter === 'available') {
      return matchesSearch && !workingShifts.some(shift => shift.employee.id === employee.id)
    }
    if (selectedFilter === 'team-leaders') {
      return matchesSearch && employee.isTeamLeader
    }
    
    return matchesSearch
  })

  const filteredShifts = allShifts.filter(shift => {
    const searchLower = searchTerm.toLowerCase()
    return (
      `${shift.employee.firstName} ${shift.employee.lastName}`.toLowerCase().includes(searchLower) ||
      shift.employee.employeeNo.toLowerCase().includes(searchLower) ||
      shift.shiftType.toLowerCase().includes(searchLower) ||
      (shift.employeeGroup?.name || '').toLowerCase().includes(searchLower) ||
      (shift.note || '').toLowerCase().includes(searchLower)
    )
  })

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5) // Returns HH:MM format
  }

  const calculateShiftDuration = (startTime: string, endTime?: string | null) => {
    if (!endTime) {
      // Calculate current duration for active shifts
      const now = new Date()
      const currentTime = now.toTimeString().substring(0, 5)
      return calculateTimeDifference(startTime, currentTime)
    }
    return calculateTimeDifference(startTime, endTime)
  }

  const calculateTimeDifference = (start: string, end: string) => {
    const [startHours, startMinutes] = start.split(':').map(Number)
    const [endHours, endMinutes] = end.split(':').map(Number)
    
    const startTotalMinutes = startHours * 60 + startMinutes
    let endTotalMinutes = endHours * 60 + endMinutes
    
    // Handle next day scenario
    if (endTotalMinutes < startTotalMinutes) {
      endTotalMinutes += 24 * 60
    }
    
    const diffMinutes = endTotalMinutes - startTotalMinutes
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    
    return `${hours}h ${minutes}m`
  }

  const getShiftStatusColor = (shift: Shift) => {
    if (!shift.endTime) return 'text-green-600 bg-green-100'
    if (shift.approved) return 'text-blue-600 bg-blue-100'
    return 'text-yellow-600 bg-yellow-100'
  }

  const getShiftStatusText = (shift: Shift) => {
    if (!shift.endTime) return 'Working'
    if (shift.approved) return 'Completed'
    return 'Pending'
  }

  const handleEmployeeClick = (employee: Employee) => {
    router.push(`/employee/login?employeeId=${employee.employeeNo}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#31BCFF]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error: {error}
          <button 
            onClick={fetchData}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Welcome Header - Enhanced with Business Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 flex-shrink-0">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Welcome to {business?.name || 'Time Tracking Portal'}
          </h1>
          <p className="text-gray-600 text-base mb-4">
            Real-time employee tracking and management dashboard
          </p>
          {business?.address && (
            <p className="text-sm text-gray-500 mb-3">
              📍 {business.address}
            </p>
          )}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="w-4 h-4" />
              <span>{employees.length} Employees</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              <span>{workingShifts.length} Working Now</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600 font-medium">
              <ClockIcon className="w-4 h-4" />
              <span>{currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section - iPad Optimized */}
      <div className="bg-white/90 backdrop-blur-xl rounded-xl p-4 border border-gray-200/50 shadow-lg flex-shrink-0">
        <div className="relative max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employees, shifts, or departments..."
            className="block w-full pl-12 pr-4 py-3 text-base rounded-lg border border-gray-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#31BCFF]/50 focus:border-[#31BCFF] transition-all duration-200 touch-manipulation"
          />
        </div>
        
        {/* Filter Options - Touch Friendly */}
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">Filter:</span>
          </div>
          {[
            { value: 'all', label: 'All' },
            { value: 'working', label: 'Working' },
            { value: 'available', label: 'Available' },
            { value: 'team-leaders', label: 'Leaders' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation min-w-[80px] ${
                selectedFilter === filter.value
                  ? 'bg-[#31BCFF] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Three Column Layout - iPad Optimized */}
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Left Column - All Employee Shifts */}
        <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-lg flex flex-col">
          <div className="p-4 border-b border-gray-200/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-[#31BCFF]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Today's Shifts</h3>
                <p className="text-xs text-gray-500">{filteredShifts.length} shifts</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredShifts.length === 0 ? (
              <div className="p-4 text-center">
                <ClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No shifts found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200/50">
                {filteredShifts.map((shift) => (
                  <div key={shift.id} className="p-3 hover:bg-gray-50/70 transition-colors duration-200 touch-manipulation">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900 text-sm">
                        {shift.employee.firstName} {shift.employee.lastName}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getShiftStatusColor(shift)}`}>
                        {getShiftStatusText(shift)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-3 h-3 opacity-60" />
                        <span>
                          {formatTime(shift.startTime)} - {shift.endTime ? formatTime(shift.endTime) : 'Active'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {shift.employee.employeeNo}
                        </span>
                        {shift.employeeGroup && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {shift.employeeGroup.name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Duration: {calculateShiftDuration(shift.startTime, shift.endTime)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Column - Working Shifts */}
        <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-lg flex flex-col">
          <div className="p-4 border-b border-gray-200/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <PlayIcon className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Currently Working</h3>
                <p className="text-xs text-gray-500">{workingShifts.length} active</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {workingShifts.length === 0 ? (
              <div className="p-4 text-center">
                <PauseIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No one working</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200/50">
                {workingShifts.map((shift) => (
                  <div key={shift.id} className="p-3 hover:bg-gray-50/70 transition-colors duration-200 touch-manipulation">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900 text-sm">
                        {shift.employee.firstName} {shift.employee.lastName}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">ACTIVE</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-3 h-3 opacity-60" />
                        <span>Started {formatTime(shift.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {shift.employee.employeeNo}
                        </span>
                        {shift.employeeGroup && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {shift.employeeGroup.name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        Working: {calculateShiftDuration(shift.startTime)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Employee List */}
        <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-lg flex flex-col">
          <div className="p-4 border-b border-gray-200/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">All Employees</h3>
                <p className="text-xs text-gray-500">{filteredEmployees.length} total</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredEmployees.length === 0 ? (
              <div className="p-4 text-center">
                <UserGroupIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No employees found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200/50">
                {filteredEmployees.map((employee) => {
                  const isWorking = workingShifts.some(shift => shift.employee.id === employee.id)
                  return (
                    <div 
                      key={employee.id} 
                      className="p-3 hover:bg-blue-50/70 transition-colors duration-200 touch-manipulation cursor-pointer border-2 border-transparent hover:border-blue-200 rounded-lg"
                      onClick={() => handleEmployeeClick(employee)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900 text-sm hover:text-blue-600 transition-colors">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="flex items-center gap-2">
                          {employee.isTeamLeader && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">
                              LEADER
                            </span>
                          )}
                          <div className={`w-2 h-2 rounded-full ${isWorking ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {employee.employeeNo}
                          </span>
                          <span className="text-xs text-gray-500">
                            {employee.department.name}
                          </span>
                        </div>
                        {employee.employeeGroup && (
                          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded inline-block">
                            {employee.employeeGroup.name}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {employee.mobile}
                        </div>
                        <div className={`text-xs font-medium ${isWorking ? 'text-green-600' : 'text-gray-500'}`}>
                          {isWorking ? 'Currently Working' : 'Available'}
                        </div>
                        <div className="text-xs text-blue-600 font-medium mt-1">
                          👆 Tap to login
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
