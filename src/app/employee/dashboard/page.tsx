"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import PunchClockModal from "@/components/PunchClockModal"
import {
  Building2,
  Clock,
  Calendar,
  User,
  LogOut,
  Play,
  Square,
  Coffee,
  Bell,
  MapPin,
  Users,
  CheckCircle,
} from "lucide-react"

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeNo: string
  department: string
  departmentId: string
  employeeGroup?: string
  employeeGroupId?: string
}

interface Shift {
  id: string
  date: string
  startTime: string
  endTime: string | null
  breakStart?: string | null
  breakEnd?: string | null
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

const events = [
  {
    id: 1,
    title: "Team Meeting",
    time: "02:00 PM",
    date: "Today",
    type: "meeting",
    location: "Conference Room A",
  },
  {
    id: 2,
    title: "Safety Training",
    time: "10:00 AM",
    date: "June 2",
    type: "training",
    location: "Training Center",
  },
  {
    id: 3,
    title: "Company Lunch",
    time: "12:00 PM",
    date: "June 5",
    type: "event",
    location: "Cafeteria",
  },
]

export default function EmployeeDashboard() {
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [activeShift, setActiveShift] = useState<Shift | null>(null)
  const [todayShift, setTodayShift] = useState<Shift | null>(null)
  const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [clockingIn, setClockingIn] = useState(false)
  const [clockingOut, setClockingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [breakLoading, setBreakLoading] = useState(false)
  const [showShiftModal, setShowShiftModal] = useState(false)
  const [employees, setEmployees] = useState([])
  const [employeeGroups, setEmployeeGroups] = useState([])
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchEmployeeData()
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Helper function to format shift date consistently
  const formatShiftDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch (error) {
      return dateString
    }
  }

  const calculateWorkedTime = () => {
    if (!activeShift?.startTime || !activeShift?.date) return "0h 0m"

    const shiftDate = new Date(activeShift.date)
    const [hours, minutes] = activeShift.startTime.split(':').map(Number)
    const startDateTime = new Date(shiftDate)
    startDateTime.setHours(hours, minutes, 0, 0)
    
    const diff = currentTime.getTime() - startDateTime.getTime()
    const hoursWorked = Math.floor(diff / (1000 * 60 * 60))
    const minutesWorked = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hoursWorked}h ${minutesWorked}m`
  }

  const formatShiftStartTime = (date: string, startTime: string) => {
    if (!date || !startTime) return "N/A"
   
    const shiftDate = new Date(date)
    const [hours, minutes] = startTime.split(':').map(Number)
    const startDateTime = new Date(shiftDate)
    startDateTime.setHours(hours, minutes, 0, 0)
    
    return formatTime(startDateTime)
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800"
      case "training":
        return "bg-green-100 text-green-800"
      case "event":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const fetchEmployeeData = async () => {
    try {
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

      // Fetch active shift
      const activeShiftRes = await fetch('/api/shifts/active')
      if (activeShiftRes.ok) {
        const activeShiftData = await activeShiftRes.json()
        setActiveShift(activeShiftData)
        
        // Check if currently on break
        if (activeShiftData && activeShiftData.breakStart && !activeShiftData.breakEnd) {
          setIsOnBreak(true)
        } else {
          setIsOnBreak(false)
        }
      }

      // Fetch today's scheduled shift and upcoming shifts
      await fetchTodayShift()
      await fetchUpcomingShifts()
    } catch (error) {
      console.error('Error fetching employee data:', error)
      setError('Failed to load employee data')
    } finally {
      setLoading(false)
    }
  }

  const fetchTodayShift = async () => {
    try {
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      const res = await fetch(`/api/shifts?startDate=${today}&endDate=${today}`)
      
      if (res.ok) {
        const shifts = await res.json()
        // Find today's shift (could be different from active shift if pre-scheduled)
        const todayScheduledShift = shifts.find((shift: Shift) => 
          shift.date.substring(0, 10) === today
        )
        setTodayShift(todayScheduledShift || null)
      }
    } catch (error) {
      console.error('Error fetching today\'s shift:', error)
    }
  }

  const fetchUpcomingShifts = async () => {
    try {
      const today = new Date()
      const nextWeek = new Date(today)
      nextWeek.setDate(today.getDate() + 7)
      
      const startDate = new Date(today)
      startDate.setDate(today.getDate() + 1) // Start from tomorrow
      
      const res = await fetch(
        `/api/shifts?startDate=${startDate.toISOString().split('T')[0]}&endDate=${nextWeek.toISOString().split('T')[0]}`
      )
      
      if (res.ok) {
        const shifts = await res.json()
        setUpcomingShifts(shifts)
      }
    } catch (error) {
      console.error('Error fetching upcoming shifts:', error)
    }
  }

  const handleClockIn = () => {
    setShowShiftModal(true)
  }

  const handleShiftSubmit = async (formData: any) => {
    if (!employee) return

    setClockingIn(true)
    setError(null)

    try {
      const now = new Date()
      
      const currentTime = now.toTimeString().slice(0, 5) 
      
      const shiftData = {
        employeeId: employee.id,
        date: now.toISOString().split('T')[0], // Today's date (YYYY-MM-DD)
        startTime: currentTime, // Current time in HH:MM format
        shiftType: 'NORMAL', // Default shift type
        wage: 0,
        wageType: 'HOURLY',
        note: formData.note || '',
        approved: false,
        ...(employee.employeeGroupId && { employeeGroupId: employee.employeeGroupId }), // Include if available
      }

      console.log('🕐 Sending shift data:', shiftData)

      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shiftData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to clock in')
      }

      const newShift = await res.json()
      setActiveShift(newShift)
      setShowShiftModal(false)
      
      await fetchTodayShift()
      await fetchUpcomingShifts()
      
      await fetchTodayShift()
      await fetchUpcomingShifts()
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
      // Format current time as HH:MM
      const now = new Date()
      const currentTime = now.toTimeString().slice(0, 5) // Gets "HH:MM" from "HH:MM:SS GMT..."
      
      const res = await fetch(`/api/shifts/${activeShift.id}/end`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endTime: currentTime, // Send time in HH:MM format
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to clock out')
      }

      setActiveShift(null)
      
      // Refresh today's shift data after clocking out
      await fetchTodayShift()
      await fetchUpcomingShifts()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setClockingOut(false)
    }
  }

  const handleLogout = () => {
    document.cookie = 'employee_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    router.push('/employee/login')
  }

  const handleStartBreak = async () => {
    if (!activeShift) return

    setBreakLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/shifts/${activeShift.id}/break`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to start break')
      }

      const updatedShift = await res.json()
      setActiveShift(updatedShift)
      setIsOnBreak(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setBreakLoading(false)
    }
  }

  const handleEndBreak = async () => {
    if (!activeShift) return

    setBreakLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/shifts/${activeShift.id}/break`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to end break')
      }

      const updatedShift = await res.json()
      setActiveShift(updatedShift)
      setIsOnBreak(false)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setBreakLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="text-center">
          <p className="text-sky-600 mb-4">Unable to load employee data</p>
          <button
            onClick={() => router.push('/employee/login')}
            className="bg-sky-500 text-white px-4 py-2 rounded-md hover:bg-sky-600"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-6">
            {/* <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div> */}
            <div>
              <h1 className="text-4xl font-bold text-sky-700">Zenlink Dashboard</h1>
              <p className="text-sky-600 text-lg">Welcome back, {employee.firstName} {employee.lastName}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="border-sky-300 text-sky-700 hover:bg-sky-50 px-6 py-3"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Current Time & Date */}
        <Card className="bg-white/95 backdrop-blur border-sky-200 mb-8">
          <CardContent className="text-center py-8">
            <div className="text-6xl font-bold text-sky-700 mb-2" suppressHydrationWarning>
              {formatTime(currentTime)}
            </div>
            <p className="text-sky-600 text-xl" suppressHydrationWarning>
              {formatDate(currentTime)}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Time Card & Profile */}
          <div className="space-y-6">
            {/* Punch Time Card */}
            <Card className="bg-white/95 backdrop-blur border-sky-200">
              <CardHeader>
                <CardTitle className="text-sky-700 flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                 Punch Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-2 ${activeShift ? "text-green-600" : "text-gray-500"}`}>
                    {activeShift ? "CLOCKED IN" : "CLOCKED OUT"}
                  </div>
                  {activeShift && (
                    <div className="text-sky-600">
                      <p>Since: {formatShiftStartTime(activeShift.date, activeShift.startTime)}</p>
                      <p suppressHydrationWarning>Worked: {calculateWorkedTime()}</p>
                      {isOnBreak && <p className="text-orange-600 font-medium">Currently on break</p>}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {!activeShift ? (
                    <Button
                      onClick={handleClockIn}
                      disabled={clockingIn}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-4 text-lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {clockingIn ? 'Clocking In...' : 'Clock In'}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={isOnBreak ? handleEndBreak : handleStartBreak}
                        disabled={breakLoading}
                        className={`w-full py-3 ${
                          isOnBreak ? "bg-orange-500 hover:bg-orange-600" : "bg-sky-500 hover:bg-sky-600"
                        } text-white`}
                      >
                        <Coffee className="w-5 h-5 mr-2" />
                        {breakLoading ? 'Processing...' : (isOnBreak ? "End Break" : "Start Break")}
                      </Button>
                      <Button 
                        onClick={handleClockOut} 
                        disabled={clockingOut}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-3"
                      >
                        <Square className="w-5 h-5 mr-2" />
                        {clockingOut ? 'Clocking Out...' : 'Clock Out'}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Employee Profile */}
            <Card className="bg-white/95 backdrop-blur border-sky-200">
              <CardHeader>
                <CardTitle className="text-sky-700 flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sky-700">{employee.firstName} {employee.lastName}</h3>
                      <p className="text-sky-600">Employee</p>
                      <p className="text-sky-500 text-sm">{employee.department}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-sky-600">Employee ID:</span>
                      <span className="font-medium">{employee.employeeNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sky-600">Department:</span>
                      <span className="font-medium">{employee.department}</span>
                    </div>
                    {employee.employeeGroup && (
                      <div className="flex justify-between">
                        <span className="text-sky-600">Group:</span>
                        <span className="font-medium">{employee.employeeGroup}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Today's Shift */}
          <div className="space-y-6">
            <Card className="bg-white/95 backdrop-blur border-sky-200">
              <CardHeader>
                <CardTitle className="text-sky-700 flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Today's Shift
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayShift ? (
                  <>
                    <div className="text-center p-4 bg-sky-50 rounded-lg">
                      <h3 className="font-semibold text-sky-700 mb-2">
                        {formatShiftDate(todayShift.date)}
                      </h3>
                      <div className="text-2xl font-bold text-sky-600 mb-2">
                        {todayShift.startTime.substring(0, 5)} - {todayShift.endTime ? todayShift.endTime.substring(0, 5) : 'Active'}
                      </div>
                      {todayShift.employeeGroup && (
                        <div className="flex justify-center gap-4 text-sm text-sky-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {todayShift.employeeGroup.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {todayShift.endTime && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sky-700">Shift Status</h4>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-green-700 font-medium">Shift Completed</p>
                          <p className="text-green-600 text-sm">
                            {todayShift.startTime.substring(0, 5)} - {todayShift.endTime.substring(0, 5)}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-700 mb-2">No Shift Today</h3>
                    <p className="text-gray-600 text-sm">You don't have any scheduled shifts for today.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Shifts */}
            <Card className="bg-white/95 backdrop-blur border-sky-200">
              <CardHeader>
                <CardTitle className="text-sky-700">Upcoming Shifts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingShifts.length > 0 ? (
                    upcomingShifts.map((shift) => {
                      const shiftDate = new Date(shift.date)
                      const today = new Date()
                      const tomorrow = new Date(today)
                      tomorrow.setDate(today.getDate() + 1)
                      
                      const isTomorrow = shiftDate.toDateString() === tomorrow.toDateString()
                      
                      const dayOfWeek = shiftDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
                      const formattedDate = isTomorrow 
                        ? 'Tomorrow' 
                        : shiftDate.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })
                      const timeRange = `${shift.startTime.substring(0, 5)} - ${shift.endTime ? shift.endTime.substring(0, 5) : 'TBD'}`
                      
                      return (
                        <div key={shift.id} className="flex items-center justify-between p-3 bg-sky-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                              {dayOfWeek}
                            </div>
                            <div>
                              <p className="font-medium text-sky-700">{formattedDate}</p>
                              <p className="text-sky-600 text-sm">{timeRange}</p>
                            </div>
                          </div>
                          <div className="text-right text-sm text-sky-600">
                            {shift.employeeGroup?.name || 'General'}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm">No upcoming shifts scheduled</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Events & Notifications */}
          <div className="space-y-6">
            <Card className="bg-white/95 backdrop-blur border-sky-200">
              <CardHeader>
                <CardTitle className="text-sky-700 flex items-center gap-2">
                  <Bell className="w-6 h-6" />
                  Events & Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="p-4 border border-sky-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sky-700">{event.title}</h4>
                        <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-sky-600">
                        <p className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.date} at {event.time}
                        </p>
                        <p className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/95 backdrop-blur border-sky-200">
              <CardHeader>
                <CardTitle className="text-sky-700">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="border-sky-300 text-sky-700 hover:bg-sky-50 py-3">
                    <Users className="w-4 h-4 mr-2" />
                    Team
                  </Button>
                  <Button variant="outline" className="border-sky-300 text-sky-700 hover:bg-sky-50 py-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                  <Button variant="outline" className="border-sky-300 text-sky-700 hover:bg-sky-50 py-3">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tasks
                  </Button>
                  <Button variant="outline" className="border-sky-300 text-sky-700 hover:bg-sky-50 py-3">
                    <Bell className="w-4 h-4 mr-2" />
                    Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Shift Modal */}
      <PunchClockModal
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        initialData={{
          note: '', // Only note field is needed
        }}
        employees={employees}
        employeeGroups={employeeGroups}
        departments={departments}
        onSubmit={handleShiftSubmit}
        loading={clockingIn}
      />
    </div>
  )
}
