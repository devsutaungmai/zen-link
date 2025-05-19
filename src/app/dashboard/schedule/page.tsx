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

  const handleAddShift = async (
    employeeId: string,
    date: Date,
    startTime?: string,
    endTime?: string,
    viewType: 'week' | 'day' = 'week'
  ) => {
    const formattedDate = format(date, 'yyyy-MM-dd');

    let modalHtml = '';
    let prefilledStartTime = startTime || '';
    let prefilledEndTime = endTime || '';

    if (viewType === 'week') {
      // Week view: date is auto-filled, user picks start and end time
      modalHtml = `
        <div>
          <label class="block text-left mb-1">Date</label>
          <input id="swal-date" class="swal2-input" type="date" value="${formattedDate}" readonly />
        </div>
        <div>
          <label class="block text-left mb-1">Start Time</label>
          <input id="swal-start-time" class="swal2-input" type="time" value="${prefilledStartTime}" />
        </div>
        <div>
          <label class="block text-left mb-1">End Time</label>
          <input id="swal-end-time" class="swal2-input" type="time" value="${prefilledEndTime}" />
        </div>
      `;
    } else {
      // Day view: date and start time are auto-filled, user picks end time
      modalHtml = `
        <div>
          <label class="block text-left mb-1">Date</label>
          <input id="swal-date" class="swal2-input" type="date" value="${formattedDate}" readonly />
        </div>
        <div>
          <label class="block text-left mb-1">Start Time</label>
          <input id="swal-start-time" class="swal2-input" type="time" value="${prefilledStartTime}" readonly />
        </div>
        <div>
          <label class="block text-left mb-1">End Time</label>
          <input id="swal-end-time" class="swal2-input" type="time" value="${prefilledEndTime}" />
        </div>
      `;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Add Shift',
      html: modalHtml,
      focusConfirm: false,
      preConfirm: () => {
        const dateVal = (document.getElementById('swal-date') as HTMLInputElement).value;
        const startVal = (document.getElementById('swal-start-time') as HTMLInputElement).value;
        const endVal = (document.getElementById('swal-end-time') as HTMLInputElement).value;
        if (!startVal || !endVal) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }
        return [dateVal, startVal, endVal];
      }
    });

    if (formValues) {
      const [dateVal, startVal, endVal] = formValues;
      try {
        const res = await fetch('/api/shifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: dateVal,
            startTime: startVal,
            endTime: endVal,
            employeeId,
            shiftType: 'NORMAL',
            wage: 0,
            wageType: 'HOURLY'
          }),
        });

        if (res.ok) {
          await fetchShifts();
        } else {
          throw new Error('Failed to create shift');
        }
      } catch (error) {
        console.error('Error creating shift:', error);
        Swal.fire('Error', 'Failed to create shift.', 'error');
      }
    }
  };

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

  const getShiftCount = (employeeId: string, date: string) => {
    return shifts.filter(shift => 
      shift.employeeId === employeeId && 
      shift.date.substring(0, 10) === date
    ).length
  }

  const getDayShiftCount = (date: string) => {
    return shifts.filter(shift => shift.date.substring(0, 10) === date).length
  }

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

  const getEmployeeWeeklyStats = (employeeId: string) => {
    const employeeShifts = shifts.filter(shift => shift.employeeId === employeeId)
    
    const totalShifts = employeeShifts.length
    
    const totalHours = employeeShifts.reduce((total, shift) => {
      return total + calculateShiftHours(shift.startTime, shift.endTime)
    }, 0)
    
    return { totalShifts, totalHours }
  }

  const formatHours = (hours: number): string => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return `${wholeHours}h ${minutes}m`
  }

  const handleMouseDown = (e: React.MouseEvent, viewType: 'day' | 'week') => {
    // Don't start dragging if clicking on a shift card
    if ((e.target as HTMLElement).closest('.shift-card')) {
      return;
    }
    
    const ref = viewType === 'day' ? dayScrollableRef : weekScrollableRef
    if (!ref.current) return
    
    setIsDragging(true)
    setStartX(e.pageX - ref.current.offsetLeft)
    setScrollLeft(ref.current.scrollLeft)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent, viewType: 'day' | 'week') => {
    const ref = viewType === 'day' ? dayScrollableRef : weekScrollableRef
    if (!isDragging || !ref.current) return
    
    e.preventDefault()
    const x = e.pageX - ref.current.offsetLeft
    const walk = (x - startX) * 1.5 // Speed multiplier
    ref.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchStart = (e: React.TouchEvent, viewType: 'day' | 'week') => {
    const ref = viewType === 'day' ? dayScrollableRef : weekScrollableRef
    if (!ref.current) return
    
    setIsDragging(true)
    setStartX(e.touches[0].pageX - ref.current.offsetLeft)
    setScrollLeft(ref.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent, viewType: 'day' | 'week') => {
    const ref = viewType === 'day' ? dayScrollableRef : weekScrollableRef
    if (!isDragging || !ref.current) return
    
    const x = e.touches[0].pageX - ref.current.offsetLeft
    const walk = (x - startX) * 1.5
    ref.current.scrollLeft = scrollLeft - walk
  }

  const handleDragStart = (e: React.DragEvent, shift: Shift, employeeId: string) => {
    setDraggedShift(shift);
    setDragSource(employeeId);
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', shift.id);

    const target = e.currentTarget as HTMLElement;
    setTimeout(() => {
      target.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedShift(null);
    setDragSource(null);
    
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetEmployeeId: string, date: Date) => {
    e.preventDefault();
    
    if (!draggedShift || !dragSource || dragSource === targetEmployeeId) {
      return;
    }
    
    const shiftDate = draggedShift.date.substring(0, 10);
    const targetDate = format(date, 'yyyy-MM-dd');
    if (shiftDate !== targetDate) {
      Swal.fire('Error', 'Shifts can only be exchanged within the same day.', 'error');
      return;
    }
    
    const result = await Swal.fire({
      title: 'Exchange Shift',
      text: `Are you sure you want to reassign this shift to ${
        employees.find(e => e.id === targetEmployeeId)?.firstName || 'another employee'
      }?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#31BCFF',
      confirmButtonText: 'Yes, Exchange Shift',
      cancelButtonText: 'Cancel'
    });
    
    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/shifts/${draggedShift.id}/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newEmployeeId: targetEmployeeId }),
        });
        
        if (res.ok) {
          await fetchShifts();
          Swal.fire('Success', 'Shift exchanged successfully!', 'success');
        } else {
          const errorData = await res.json();
          
          if (res.status === 409 && errorData.conflict) {
            Swal.fire({
              title: 'Scheduling Conflict',
              html: `
                <div class="text-left">
                  <p>${errorData.error}</p>
                  <p class="mt-2"><strong>Conflicting shift time:</strong> ${errorData.conflict.time}</p>
                </div>
              `,
              icon: 'warning',
            });
          } else {
            throw new Error(errorData.error || 'Failed to exchange shift');
          }
        }
      } catch (error) {
        console.error('Error exchanging shift:', error);
        Swal.fire('Error', 'Failed to exchange shift.', 'error');
      }
    }
  };

  const getDragOverClass = (employeeId: string, date: string) => {
    if (!draggedShift || !dragSource) return '';
    
    if (dragSource === employeeId) return '';
    
    if (draggedShift.date.substring(0, 10) !== date) return '';
    
    return 'bg-blue-50 border-blue-300 border-dashed';
  };

  const handleApproveShift = async (shiftId: string) => {
    try {
      const res = await fetch(`/api/shifts/${shiftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        await fetchShifts()
        Swal.fire('Success', 'Shift approved successfully!', 'success')
      } else {
        throw new Error('Failed to approve shift')
      }
    } catch (error) {
      console.error('Error approving shift:', error)
      Swal.fire('Error', 'Failed to approve shift.', 'error')
    }
  }

  const handleEditShift = (shift: Shift) => {
    console.log("Edit shift called with:", shift);
    setModalViewType('week');
    
    const shiftData = {
      ...shift,
      date: shift.date.substring(0, 10),
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

  const handleDragStartToCreate = (hour: number, date: Date) => {
    setDragStartHour(hour);
    setDragEndHour(hour);
    setDragDate(date);
    setIsDraggingToCreate(true);
  };

  const handleDragOverToCreate = (hour: number) => {
    if (isDraggingToCreate) {
      setDragEndHour(hour);
    }
  };

  const handleDragEndToCreate = async (date: Date) => {
    if (dragStartHour !== null && dragEndHour !== null && dragDate !== null) {
      const startHour = Math.min(dragStartHour, dragEndHour);
      const endHour = Math.max(dragStartHour, dragEndHour);

      const formattedDate = format(dragDate, 'yyyy-MM-dd');
      const startTime = `${startHour.toString().padStart(2, '0')}:00`;
      const endTime = `${(endHour + 1).toString().padStart(2, '0')}:00`; // Add 1 to end hour to make range inclusive

      // Reset drag state
      setDragStartHour(null);
      setDragEndHour(null);
      setDragDate(null);
      setIsDraggingToCreate(false);

      // Instead of showing a confirmation, open the shift form with pre-filled data
      setModalViewType('week');
      setShiftInitialData({
        date: formattedDate,
        startTime,
        endTime,
        shiftType: 'NORMAL',
        wage: 0,
        wageType: 'HOURLY',
        approved: false,
        employeeId: '',
        employeeGroupId: undefined,
        note: ''
      });
      setShowShiftModal(true);
    }
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

  const SpanningShiftCard = ({ shift, date, employees }) => {
    const { top, height } = getShiftPosition(shift.startTime, shift.endTime);
    const employee = employees.find(e => e.id === shift.employeeId);
    
    return (
      <div
        className="absolute left-2 right-2 shift-card pointer-events-auto z-20"
        style={{
          top: `${top}px`,
          height: `${height}px`,
          minHeight: '20px',
          backgroundColor: shift.approved ? undefined : '#31BCFF',
          borderColor: shift.approved ? '#84cc16' : '#31BCFF',
          color: shift.approved ? '#365314' : 'white',
          borderWidth: '1px',
          borderRadius: '0.375rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          padding: '0.5rem',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          console.log("Click on shift:", shift.id);
          e.stopPropagation();
        }}
        onDoubleClick={(e) => {
          console.log("Double click on shift:", shift.id);
          e.stopPropagation();
          e.preventDefault();
          handleEditShift(shift);
        }}
        title="Double-click to edit"
        draggable={false}
      >
        <div className="font-medium text-sm">
          {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
        </div>
        {height > 40 && (
          <div className="text-xs mt-1 truncate">
            {employee ? `${employee.firstName} ${employee.lastName}` : 'Unassigned'}
          </div>
        )}
        {height > 60 && shift.employeeGroup && (
          <div className="text-xs mt-1 opacity-75 truncate">
            {shift.employeeGroup.name}
          </div>
        )}
      </div>
    );
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
            shifts={shifts.filter(shift => shift.date.substring(0, 10) === format(selectedDate, 'yyyy-MM-dd'))}
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