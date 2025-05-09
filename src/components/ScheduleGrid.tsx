import React from 'react'
import ShiftCard from './ShiftGridCard'

interface ScheduleGridProps {
  employees: Employee[]
  weekDates: Date[]
  shifts: Shift[]
  onDragStart: (e: React.DragEvent, shift: Shift, employeeId: string) => void
  onDragEnd: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, employeeId: string, date: Date) => void
  onApprove: (shiftId: string) => void
  onEdit: (shift: Shift) => void
}

export default function ScheduleGrid({
  employees,
  weekDates,
  shifts,
  onDragStart,
  onDragEnd,
  onDrop,
  onApprove,
  onEdit,
}: ScheduleGridProps) {
  return (
    <div className="grid grid-cols-[200px_repeat(7,1fr)] border-b">
      {employees.map(employee => (
        <React.Fragment key={employee.id}>
          <div className="border-b border-r p-3 bg-gray-100">
            <div className="font-medium text-gray-900">{employee.firstName} {employee.lastName}</div>
          </div>
          {weekDates.map((date, i) => {
            const formattedDate = format(date, 'yyyy-MM-dd')
            const dayShifts = shifts.filter(
              shift => shift.employeeId === employee.id && shift.date.substring(0, 10) === formattedDate
            )
            return (
              <div
                key={i}
                className="border-b border-r p-3 text-center relative min-h-[60px] hover:bg-gray-50"
                onDragOver={e => e.preventDefault()}
                onDrop={e => onDrop(e, employee.id, date)}
              >
                {dayShifts.map(shift => (
                  <ShiftCard
                    key={shift.id}
                    shift={shift}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onApprove={onApprove}
                    onEdit={onEdit}
                  />
                ))}
              </div>
            )
          })}
        </React.Fragment>
      ))}
    </div>
  )
}