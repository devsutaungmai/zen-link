'use client'

import React, { useState, useEffect } from 'react'
import { format, addDays, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns'
import { Employee, EmployeeGroup, Shift } from '@prisma/client'

import Swal from 'sweetalert2'
import ScheduleHeader from '@/components/schedule/ScheduleHeader'
import WeekView from '@/components/schedule/WeekView'
import DayView from '@/components/schedule/DayView'
import ShiftFormModal from '@/components/schedule/ShiftFormModel'

export default function SchedulePage() {
  const [showShiftModal, setShowShiftModal] = useState(false)
  const [shiftInitialData, setShiftInitialData] = useState<any>(null)
  const [modalViewType, setModalViewType] = useState<'week' | 'day'>('week')

  const [currentDate, setCurrentDate] = useState(new Date())
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeGroups, setEmployeeGroups] = useState<EmployeeGroup[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const weekScrollableRef = React.useRef<HTMLDivElement>(null)
  const dayScrollableRef = React.useRef<HTMLDivElement>(null)

  const [draggedShift, setDraggedShift] = useState<Shift | null>(null);
  const [dragSource, setDragSource] = useState<string | null>(null);

  const [dragStartHour, setDragStartHour] = useState<number | null>(null);
  const [dragEndHour, setDragEndHour] = useState<number | null>(null);
  const [isDraggingToCreate, setIsDraggingToCreate] = useState(false);
  const [dragDate, setDragDate] = useState<Date | null>(null);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 })
  const endDate = endOfWeek(currentDate, { weekStartsOn: 0 })
  
  const weekDates = Array(7).fill(0).map((_, i) => addDays(startDate, i))

  useEffect(() => {
    fetchEmployees()
    fetchEmployeeGroups()
    fetchShifts()
  }, [currentDate, selectedEmployeeId])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees')
      const data = await res.json()
      setEmployees(data)
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    }
  }

  const fetchEmployeeGroups = async () => {
    try {
      const res = await fetch('/api/employee-groups')
      const data = await res.json()
      setEmployeeGroups(data)
    } catch (error) {
      console.error('Error fetching employee groups:', error)
    }
  }

  const fetchShifts = async () => {
    try {
      const start = format(startDate, 'yyyy-MM-dd')
      const end = format(endDate, 'yyyy-MM-dd')
      
      let url = `/api/shifts?startDate=${start}&endDate=${end}`
      if (selectedEmployeeId) {
        url += `&employeeId=${selectedEmployeeId}`
      }
      
      const res = await fetch(url)
      const data = await res.json()
      setShifts(data)
    } catch (error) {
      console.error('Error fetching shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousWeek = () => {
    setCurrentDate(prevDate => subWeeks(prevDate, 1))
  }

  const handleNextWeek = () => {
    setCurrentDate(prevDate => addWeeks(prevDate, 1))
  }

  const handleShiftFormSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id 
        ? `/api/shifts/${formData.id}` 
        : '/api/shifts';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchShifts();
        setShowShiftModal(false);
        Swal.fire('Success', `Shift ${formData.id ? 'updated' : 'created'} successfully!`, 'success');
      } else {
        Swal.fire('Error', `Failed to ${formData.id ? 'update' : 'create'} shift.`, 'error');
      }
    } catch (error) {
      console.error('Error submitting shift form:', error);
      Swal.fire('Error', `Failed to ${formData.id ? 'update' : 'create'} shift.`, 'error');
    }
    setLoading(false);
  };

  const calculateShiftHours = (startTime: string, endTime: string): number => {
    const getMinutes = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return hours * 60 + minutes
    }
    
    const startMinutes = getMinutes(startTime)
    const endMinutes = getMinutes(endTime)
    
    let minutesWorked = endMinutes - startMinutes
    if (minutesWorked < 0) {
      minutesWorked += 24 * 60 
    }
    
    return minutesWorked / 60
  }

  const handleEditShift = (shift: Shift) => {
    console.log("Edit shift called with:", shift);
    setModalViewType('week');
    
    const shiftData = {
      ...shift,
      date: typeof shift.date === 'string'
        ? (shift.date as string).substring(0, 10)
        : format(shift.date, 'yyyy-MM-dd'),
      startTime: shift.startTime || '09:00',
      endTime: shift.endTime || '17:00',
      shiftType: shift.shiftType || 'NORMAL',
      wage: shift.wage || 0,
      wageType: shift.wageType || 'HOURLY',
      approved: shift.approved || false,
      employeeId: shift.employeeId || undefined,
      employeeGroupId: shift.employeeGroupId || undefined,
      breakStart: shift.breakStart || undefined,
      breakEnd: shift.breakEnd || undefined,
      note: shift.note || '',
    };
    
    console.log("Setting initial data:", shiftData);
    setShiftInitialData(shiftData);
    
    console.log("Setting showShiftModal to true");
    setShowShiftModal(true);
    console.log("showShiftModal should now be:", true);
  };

  const getShiftPosition = (startTime: string, endTime: string) => {
    const startParts = startTime.split(':');
    const endParts = endTime.split(':');

    const startHour = parseInt(startParts[0], 10);
    const startMinutes = parseInt(startParts[1], 10);

    const endHour = parseInt(endParts[0], 10);
    const endMinutes = parseInt(endParts[1], 10);

    // Calculate offsets in minutes since midnight
    const startOffset = startHour * 60 + startMinutes;
    let endOffset = endHour * 60 + endMinutes;
    
    // If end time is earlier than start time, assume it's the next day
    if (endOffset < startOffset) {
      endOffset += 24 * 60; // Add 24 hours
    }

    // Height calculation: 1 hour = 60px
    const height = ((endOffset - startOffset) / 60) * 60;
    
    // Top position: offset from the top of the schedule grid
    // Assuming the grid starts at hour 1 (not 0)
    const top = ((startOffset - 60) / 60) * 60; // Subtract 60 minutes to adjust for grid starting at hour 1
    
    return { top, height };
  };

  const handleTodayClick = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
    setViewMode('day')
  }

  const handleEmployeeChange = (employeeId: string | null) => {
    setSelectedEmployeeId(employeeId);
  }

  return (
    <div className="py-6">
      <div className="mx-auto">
        <ScheduleHeader
          startDate={startDate}
          endDate={endDate}
          viewMode={viewMode}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
          onTodayClick={handleTodayClick}
          onViewModeChange={setViewMode}
          employees={employees}
          selectedEmployeeId={selectedEmployeeId}
          onEmployeeChange={handleEmployeeChange}
        />

        {viewMode === 'week' ? (
          <WeekView
            weekDates={weekDates}
            shifts={shifts}
            employees={employees}
            onEditShift={handleEditShift}
            onAddShift={(formData) => {
              if (formData) {
                setModalViewType('week');
                if (selectedEmployeeId) {
                  formData.employeeId = selectedEmployeeId;
                }
                setShiftInitialData(formData);
              } else {
                setModalViewType('week');
                if (selectedEmployeeId) {
                  setShiftInitialData({
                    employeeId: selectedEmployeeId,
                  });
                } else {
                  setShiftInitialData(null);
                }
              }
              setShowShiftModal(true);
            }}
          />
        ) : (
         <DayView
            selectedDate={selectedDate}
            shifts={shifts.filter(shift => 
              format(
                typeof shift.date === 'string' ? new Date(shift.date) : shift.date, 
                'yyyy-MM-dd'
              ) === format(selectedDate, 'yyyy-MM-dd')
            )}
            employees={employees}
            onEditShift={handleEditShift}
            onAddShift={(formData) => {
              setModalViewType('day');
              
              if (formData) {
                if (selectedEmployeeId) {
                  formData.employeeId = selectedEmployeeId;
                }
                setShiftInitialData(formData);
              } else {
                if (selectedEmployeeId) {
                  setShiftInitialData({
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    employeeId: selectedEmployeeId,
                  });
                } else {
                  setShiftInitialData({
                    date: format(selectedDate, 'yyyy-MM-dd'),
                  });
                }
              }
              setShowShiftModal(true);
            }}
          />
        )}
      </div>

     <ShiftFormModal
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        initialData={shiftInitialData}
        employees={employees}
        employeeGroups={employeeGroups}
        onSubmit={handleShiftFormSubmit}
        viewType={modalViewType}
        loading={loading}
      />
    </div>
  )
}