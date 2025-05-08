'use client'

import React, { useState, useEffect } from 'react'
import { format, addDays, subDays, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns'
import Link from 'next/link'
import { 
  PlusIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline'
import Swal from 'sweetalert2'
import ShiftForm from '@/components/ShiftForm'

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

  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 })
  const endDate = endOfWeek(currentDate, { weekStartsOn: 0 })
  
  const weekDates = Array(7).fill(0).map((_, i) => addDays(startDate, i))

  useEffect(() => {
    fetchEmployees()
    fetchEmployeeGroups()
    fetchShifts()
  }, [currentDate])

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
      
      const res = await fetch(`/api/shifts?startDate=${start}&endDate=${end}`)
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
    setLoading(true)
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        await fetchShifts()
        setShowShiftModal(false)
      } else {
        Swal.fire('Error', 'Failed to create shift.', 'error')
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to create shift.', 'error')
    }
    setLoading(false)
  }

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
    // Set data for the drag operation
    setDraggedShift(shift);
    setDragSource(employeeId);
    
    // Set a custom drag image/ghost
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', shift.id);
    
    // Add a CSS class to show this is being dragged
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => {
      target.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedShift(null);
    setDragSource(null);
    
    // Remove drag styling
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    // Necessary to allow dropping
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetEmployeeId: string, date: Date) => {
    e.preventDefault();
    
    if (!draggedShift || !dragSource || dragSource === targetEmployeeId) {
      return;
    }
    
    // Make sure we're dropping on the same date (for week view)
    const shiftDate = draggedShift.date.substring(0, 10);
    const targetDate = format(date, 'yyyy-MM-dd');
    if (shiftDate !== targetDate) {
      Swal.fire('Error', 'Shifts can only be exchanged within the same day.', 'error');
      return;
    }
    
    // Confirm the exchange
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
        // Call the exchange API
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
    
    // Don't highlight the source
    if (dragSource === employeeId) return '';
    
    // Only highlight same day cells
    if (draggedShift.date.substring(0, 10) !== date) return '';
    
    return 'bg-blue-50 border-blue-300 border-dashed';
  };

  const handleApproveShift = async (shiftId: string) => {
    try {
      const res = await fetch(`/api/shifts/${shiftId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        await fetchShifts();
        Swal.fire('Success', 'Shift approved successfully!', 'success');
      } else {
        throw new Error('Failed to approve shift');
      }
    } catch (error) {
      console.error('Error approving shift:', error);
      Swal.fire('Error', 'Failed to approve shift.', 'error');
    }
  };

  const handleEditShift = (shift: Shift) => {
    setShiftInitialData(shift);
    setShowShiftModal(true);
  };

  return (
    <div className="py-6">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900 mr-4">Schedule</h1>
            
            <div className="flex space-x-2">
              <button 
                onClick={handlePreviousWeek}
                className="p-2 rounded-md hover:bg-gray-200 text-gray-900"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              
              <div className="px-3 py-1 border rounded-md text-gray-500">
                {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
              </div>
              
              <button 
                onClick={handleNextWeek}
                className="p-2 rounded-md hover:bg-gray-200 text-gray-900"
              >
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const today = new Date()
                setCurrentDate(today)
                setSelectedDate(today)
                setViewMode('day')
              }}
              className={`px-4 py-2 rounded-md border transition-colors duration-150
                ${viewMode === 'day' ? 'bg-[#31BCFF] text-white border-[#31BCFF]' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'}`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-md border transition-colors duration-150
                ${viewMode === 'week' ? 'bg-[#31BCFF] text-white border-[#31BCFF]' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'}`}
            >
              Week
            </button>
          </div>
        </div>

        {viewMode === 'week' ? (
          <div 
            className="overflow-hidden"
            onMouseLeave={handleMouseUp}
          >
            <div 
              ref={weekScrollableRef}
              className="min-w-full cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => handleMouseDown(e, 'week')}
              onMouseUp={handleMouseUp}
              onMouseMove={(e) => handleMouseMove(e, 'week')}
              onTouchStart={(e) => handleTouchStart(e, 'week')}
              onTouchMove={(e) => handleTouchMove(e, 'week')}
              onTouchEnd={handleMouseUp}
            >
              <div className="min-w-full">
                <div className="grid grid-cols-[200px_repeat(7,1fr)] border-b">
                  <div className="p-3 font-medium text-center border-r bg-gray-100"></div>
                  
                  {weekDates.map((date, i) => {
                    const isToday = new Date().toDateString() === date.toDateString();
                    return (
                      <div 
                        key={i} 
                        className={`p-3 font-medium text-center border-r ${isToday ? 'bg-blue-50' : ''}`}
                      >
                        <div className={`text-gray-950 font-bold ${isToday ? 'text-blue-700' : ''}`}>
                          {isToday ? (
                            <span className="text-blue-700">Today</span>
                          ) : (
                            format(date, 'EEE, MMM d')
                          )}
                        </div>
                        <div className="text-sm text-gray-900">
                          <PlusIcon className="inline h-4 w-4 mr-1" />
                          {getDayShiftCount(format(date, 'yyyy-MM-dd'))} Shifts
                        </div>
                      </div>
                    );
                  })}

                  {employees.map(employee => (
                    <React.Fragment key={employee.id}>
                      <div className="border-b border-r p-3 bg-gray-100">
                        <div className="font-medium text-gray-900">{employee.firstName} {employee.lastName}</div>
                        <div className="text-sm text-gray-900">
                          {formatHours(getEmployeeWeeklyStats(employee.id).totalHours)} / {getEmployeeWeeklyStats(employee.id).totalShifts} Shifts
                        </div>
                      </div>
                      
                      {weekDates.map((date, i) => {
                        const formattedDate = format(date, 'yyyy-MM-dd')
                        const dayShifts = shifts.filter(shift => 
                          shift.employeeId === employee.id && 
                          shift.date.substring(0, 10) === formattedDate
                        )
                        
                        return (
                          <div 
                            key={i} 
                            className={`border-b border-r p-3 text-center relative min-h-[60px] hover:bg-gray-50 ${
                              getDragOverClass(employee.id, formattedDate)
                            }`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, employee.id, date)}
                          >
                            {dayShifts.length > 0 ? (
                              <div className="space-y-1"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, employee.id, date)}>
                                {dayShifts.map(shift => (
                                  <div
                                    key={shift.id}
                                    className={`relative block py-2 px-3 rounded text-sm shadow-sm
                                      ${shift.approved
                                        ? "bg-green-100 border border-green-300 text-green-800"
                                        : "bg-gray-100 border border-gray-300 text-gray-800"}
                                      hover:opacity-90 cursor-grab transition group`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, shift, employee.id)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => window.location.href = `/dashboard/shifts/${shift.id}/edit`}
                                    style={{ fontSize: '12px', lineHeight: '16px' }}
                                  >
                                    {/* Shift Details */}
                                    <div className="font-semibold truncate">{shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}</div>
                                    {shift.employeeGroup && (
                                      <div className="text-xs mt-1 opacity-75">{shift.employeeGroup.name}</div>
                                    )}
                                    <div className="text-xs mt-1">
                                      {shift.approved ? "✓ Approved" : "Pending"}
                                    </div>

                                    {/* Mini Actions */}
                                    <div className="absolute top-1 right-1 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
                                      {/* Approve Button */}
                                      {!shift.approved && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering the card click
                                            handleApproveShift(shift.id);
                                          }}
                                          className="text-green-600 hover:text-green-800"
                                          title="Approve Shift"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M4.5 12.75l6 6 9-13.5"
                                            />
                                          </svg>
                                        </button>
                                      )}

                                      {/* Edit Button */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent triggering the card click
                                          handleEditShift(shift);
                                        }}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Edit Shift"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth={1.5}
                                          stroke="currentColor"
                                          className="w-5 h-5"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16.862 3.487a2.25 2.25 0 113.182 3.182L6.75 19.964l-4.5.75.75-4.5 13.862-13.727z"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div
                                className="h-full w-full absolute top-0 left-0"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, employee.id, date)}
                              >
                                <button
                                  onClick={() => {
                                    setModalViewType('week')
                                    setShiftInitialData({
                                      date: format(date, 'yyyy-MM-dd'),
                                      employeeId: employee.id,
                                      startTime: '',
                                      endTime: '',
                                      shiftType: 'NORMAL',
                                      wage: 0,
                                      wageType: 'HOURLY',
                                      approved: false,
                                      employeeGroupId: undefined,
                                      note: ''
                                    })
                                    setShowShiftModal(true)
                                  }}
                                  className="rounded-full h-6 w-6 flex items-center justify-center bg-gray-100 hover:bg-[#31BCFF]/10 mx-auto text-gray-500 hover:text-[#31BCFF] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-gray-200"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Schedule for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h2>
            <div className="border rounded-lg bg-white shadow">
              <table className="w-full table-fixed border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="bg-gray-100 border-b border-r w-28 py-1 px-2 text-left font-semibold text-gray-700">Employee</th>
                    {Array.from({ length: 24 }, (_, hour) => (
                      <th
                        key={hour}
                        className="bg-gray-100 border-b border-r py-1 px-0.5 font-medium text-center text-gray-700 w-8"
                        style={{ width: '32px', minWidth: '32px', maxWidth: '32px' }}
                      >
                        {hour.toString().padStart(2, '0')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map(employee => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="border-b border-r bg-gray-50 px-2 py-1 font-medium text-xs text-gray-800 whitespace-nowrap">
                        {employee.firstName} {employee.lastName}
                      </td>
                      {Array.from({ length: 24 }, (_, hour) => {
                        const hourShifts = shifts.filter(shift => {
                          if (shift.employeeId !== employee.id ||
                              shift.date.substring(0, 10) !== format(selectedDate, 'yyyy-MM-dd')) {
                            return false;
                          }
                          const startHour = parseInt(shift.startTime.split(':')[0]);
                          const endHour = parseInt(shift.endTime.split(':')[0]);
                          const endMinute = parseInt(shift.endTime.split(':')[1]);
                          return (startHour === hour) ||
                                 (startHour < hour && (endHour > hour || (endHour === hour && endMinute > 0)));
                        });
                        return (
                          <td
                            key={hour}
                            className="border-b border-r px-0.5 py-0.5 min-h-[20px] relative group"
                            style={{ width: '32px', minWidth: '32px', maxWidth: '32px', height: '28px' }}
                            onDragOver={handleDragOver}
                            onDrop={e => handleDrop(e, employee.id, selectedDate)}
                          >
                            {hourShifts.map(shift => {
                              const startHour = parseInt(shift.startTime.split(':')[0]);
                              const isStartingHour = startHour === hour;
                              return isStartingHour ? (
                                <div
                                  key={shift.id}
                                  className={`block py-0.5 px-1 rounded text-[10px] shadow-sm
                                    ${shift.approved
                                      ? "bg-green-100 border border-green-300 text-green-800"
                                      : "bg-gray-100 border border-gray-300 text-gray-800"}
                                    hover:opacity-90 cursor-grab transition`}
                                  draggable
                                  onDragStart={e => handleDragStart(e, shift, employee.id)}
                                  onDragEnd={handleDragEnd}
                                  onClick={() => window.location.href = `/dashboard/shifts/${shift.id}/edit`}
                                  style={{ fontSize: '10px', lineHeight: '12px' }}
                                >
                                  <div className="font-semibold truncate">{shift.startTime.substring(0,5)}-{shift.endTime.substring(0,5)}</div>
                                  {shift.employeeGroup && (
                                    <div className="text-[9px] mt-0.5 opacity-75">{shift.employeeGroup.name}</div>
                                  )}
                                  <div className="text-[9px] mt-0.5">
                                    {shift.approved ? "✓" : ""}
                                  </div>
                                </div>
                              ) : null;
                            })}
                            {hourShifts.length === 0 && (
                              <button
                                onClick={() => {
                                  setModalViewType('day')
                                  setShiftInitialData({
                                    date: format(selectedDate, 'yyyy-MM-dd'),
                                    employeeId: employee.id,
                                    startTime: `${hour.toString().padStart(2, '0')}:00`,
                                    endTime: '',
                                    shiftType: 'NORMAL',
                                    wage: 0,
                                    wageType: 'HOURLY',
                                    approved: false,
                                    employeeGroupId: undefined,
                                    note: ''
                                  })
                                  setShowShiftModal(true)
                                }}
                                className="rounded-full h-4 w-4 flex items-center justify-center bg-gray-100 hover:bg-[#31BCFF]/10 text-gray-400 hover:text-[#31BCFF] border border-gray-200 mx-auto opacity-0 group-hover:opacity-100 transition"
                                title="Add shift"
                                style={{ fontSize: '10px' }}
                              >
                                <PlusIcon className="h-2 w-2" />
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
            <ShiftForm
              initialData={shiftInitialData}
              employees={employees}
              employeeGroups={employeeGroups}
              onSubmit={handleShiftFormSubmit}
              onCancel={() => setShowShiftModal(false)}
              loading={loading}
              showEmployee={modalViewType === 'week'}
              showStartTime={modalViewType === 'week'}
              showDate={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}