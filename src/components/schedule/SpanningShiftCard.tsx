import { format } from 'date-fns'

interface SpanningShiftCardProps {
  shift: Shift
  date: string
  employees: Employee[]
  onEdit: (shift: Shift) => void
}

export default function SpanningShiftCard({ shift, date, employees, onEdit }: SpanningShiftCardProps) {
  const { top, height } = getShiftPosition(shift.startTime, shift.endTime)
  const employee = employees.find(e => e.id === shift.employeeId)
  
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
      onDoubleClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        onEdit(shift)
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
  )
}

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

// Group shifts by overlapping time ranges
const groupShiftsByOverlap = (shifts: Shift[]) => {
  const grouped: Shift[][] = [];

  shifts.forEach((shift) => {
    let added = false;

    for (const group of grouped) {
      // Check if the shift overlaps with any shift in the group
      if (
        group.some(
          (s) =>
            (shift.startTime < s.endTime && shift.endTime > s.startTime) // Overlap condition
        )
      ) {
        group.push(shift);
        added = true;
        break;
      }
    }

    if (!added) {
      grouped.push([shift]);
    }
  });

  return grouped;
};