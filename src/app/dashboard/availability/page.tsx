'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeNo: string
  department: {
    id: string
    name: string
  }
  employeeGroup?: {
    id: string
    name: string
  }
}

interface Availability {
  id: string
  date: string
  isAvailable: boolean
  note?: string
  employee: {
    id: string
    firstName: string
    lastName: string
    employeeNo: string
  }
}

interface AvailabilityStats {
  totalEmployees: number
  availableToday: number
  unavailableToday: number
  pendingRequests: number
}

export default function AdminAvailabilityPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [employees, setEmployees] = useState<Employee[]>([])
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [stats, setStats] = useState<AvailabilityStats>({
    totalEmployees: 0,
    availableToday: 0,
    unavailableToday: 0,
    pendingRequests: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [employeesPerPage] = useState(20) // Limit employees per page
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar') // Add view mode toggle
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  useEffect(() => {
    fetchData()
  }, [currentMonth, currentYear])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchEmployees(),
        fetchAvailabilities(),
        fetchStats()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load availability data')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees')
      if (res.ok) {
        const employeesData = await res.json()
        setEmployees(employeesData)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchAvailabilities = async () => {
    try {
      const res = await fetch(`/api/availability?month=${currentMonth + 1}&year=${currentYear}`)
      if (res.ok) {
        const availabilitiesData = await res.json()
        setAvailabilities(availabilitiesData)
      }
    } catch (error) {
      console.error('Error fetching availabilities:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const todayAvailabilities = availabilities.filter(a => 
        a.date.split('T')[0] === today
      )
      
      setStats({
        totalEmployees: employees.length,
        availableToday: todayAvailabilities.filter(a => a.isAvailable).length,
        unavailableToday: todayAvailabilities.filter(a => !a.isAvailable).length,
        pendingRequests: 0 // Can be enhanced based on business logic
      })
    } catch (error) {
      console.error('Error calculating stats:', error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getAvailabilityForDate = useMemo(() => {
    // Create a lookup map for better performance with many employees
    const availabilityMap = new Map<string, Availability>()
    availabilities.forEach(availability => {
      const key = `${availability.employee.id}-${availability.date.split('T')[0]}`
      availabilityMap.set(key, availability)
    })
    
    return (employeeId: string, date: Date) => {
      const dateStr = date.toISOString().split('T')[0]
      const key = `${employeeId}-${dateStr}`
      return availabilityMap.get(key)
    }
  }, [availabilities])

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchLower) ||
        employee.employeeNo.toLowerCase().includes(searchLower) ||
        employee.department.name.toLowerCase().includes(searchLower)

      const matchesDepartment = selectedDepartment === 'all' || employee.department.id === selectedDepartment

      if (selectedFilter === 'all') return matchesSearch && matchesDepartment
      
      const today = new Date().toISOString().split('T')[0]
      const todayAvailability = availabilities.find(a => 
        a.employee.id === employee.id && 
        a.date.split('T')[0] === today
      )

      if (selectedFilter === 'available') {
        return matchesSearch && matchesDepartment && (!todayAvailability || todayAvailability.isAvailable)
      }
      if (selectedFilter === 'unavailable') {
        return matchesSearch && matchesDepartment && (todayAvailability && !todayAvailability.isAvailable)
      }

      return matchesSearch && matchesDepartment
    })
  }, [employees, searchTerm, selectedFilter, selectedDepartment, availabilities])

  // Pagination calculations
  const { totalPages, currentEmployees } = useMemo(() => {
    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage)
    const startIndex = (currentPage - 1) * employeesPerPage
    const endIndex = startIndex + employeesPerPage
    const currentEmployees = filteredEmployees.slice(startIndex, endIndex)
    
    return { totalPages, currentEmployees }
  }, [filteredEmployees, currentPage, employeesPerPage])

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(employees.map(e => e.department.id)))
      .map(id => employees.find(e => e.department.id === id)?.department)
      .filter(Boolean)
  }, [employees])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedFilter, selectedDepartment])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const days = getDaysInMonth(currentDate)

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
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-semibold">{error}</p>
          <Button onClick={fetchData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Employee Availability
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and view employee availability across all departments
            </p>
          </div>
          <CalendarIcon className="w-12 h-12 text-[#31BCFF]" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <UserGroupIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                  <p className="text-sm text-gray-600">Total Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.availableToday}</p>
                  <p className="text-sm text-gray-600">Available Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircleIcon className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.unavailableToday}</p>
                  <p className="text-sm text-gray-600">Unavailable Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ClockIcon className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select 
              value={selectedFilter} 
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full md:w-48 h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#31BCFF] focus:border-[#31BCFF]"
            >
              <option value="all">All Employees</option>
              <option value="available">Available Today</option>
              <option value="unavailable">Unavailable Today</option>
            </select>
            
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full md:w-48 h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#31BCFF] focus:border-[#31BCFF]"
            >
              <option key="all-depts" value="all">All Departments</option>
              {uniqueDepartments.map(dept => dept && (
                <option key={`dept-${dept.id}`} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Results summary and view toggle */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>
                Showing {currentEmployees.length} of {filteredEmployees.length} employees
              </span>
              
              {/* View mode toggle */}
              <div className="flex items-center gap-2">
                <span>View:</span>
                <div className="flex rounded-md border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      viewMode === 'calendar' 
                        ? 'bg-[#31BCFF] text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Calendar
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-[#31BCFF] text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
            
            {filteredEmployees.length > employeesPerPage && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calendar or List View */}
      {viewMode === 'calendar' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {monthNames[currentMonth]} {currentYear}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeftIcon className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Week days header */}
                <div className="grid grid-cols-8 gap-1 mb-2">
                  <div className="p-2 font-semibold text-gray-600">Employee</div>
                  {weekDays.map(day => (
                    <div key={day} className="p-2 text-center font-semibold text-gray-600 bg-gray-50 rounded">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Employee rows */}
                {currentEmployees.map(employee => (
                  <div key={employee.id} className="grid grid-cols-8 gap-1 mb-1 items-center">
                    <div className="p-2 font-medium text-sm">
                      <div>{employee.firstName} {employee.lastName}</div>
                      <div className="text-xs text-gray-500">{employee.employeeNo}</div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {employee.department.name}
                      </Badge>
                    </div>
                    
                    {/* Calendar days for this employee */}
                    {days.map((day, dayIndex) => {
                      if (!day) {
                        return <div key={dayIndex} className="p-2"></div>
                      }
                      
                      const availability = getAvailabilityForDate(employee.id, day)
                      const isToday = day.toDateString() === new Date().toDateString()
                      
                      return (
                        <div
                          key={dayIndex}
                          className={`p-2 text-center text-xs border rounded ${
                            isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="font-semibold text-gray-700">{day.getDate()}</div>
                          {availability && (
                            <div className={`mt-1 p-1 rounded text-white text-xs ${
                              availability.isAvailable 
                                ? 'bg-green-500' 
                                : 'bg-red-500'
                            }`}>
                              {availability.isAvailable ? '✓' : '✗'}
                            </div>
                          )}
                          {availability?.note && (
                            <div className="mt-1 text-xs text-gray-600 truncate" title={availability.note}>
                              📝
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View for better performance with many employees */
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Employee Availability List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentEmployees.map(employee => {
                const today = new Date().toISOString().split('T')[0]
                const todayAvailability = availabilities.find(a => 
                  a.employee.id === employee.id && 
                  a.date.split('T')[0] === today
                )
                
                return (
                  <div key={employee.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {employee.employeeNo} • {employee.department.name}
                        </p>
                        {employee.employeeGroup && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {employee.employeeGroup.name}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                          !todayAvailability || todayAvailability.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {!todayAvailability || todayAvailability.isAvailable ? (
                            <>
                              <CheckCircleIcon className="w-4 h-4" />
                              Available Today
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-4 h-4" />
                              Unavailable Today
                            </>
                          )}
                        </div>
                        {todayAvailability?.note && (
                          <p className="text-xs text-gray-500 mt-1 max-w-48 truncate">
                            Note: {todayAvailability.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📝</span>
              <span>Has Note</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
