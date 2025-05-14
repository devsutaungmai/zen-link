import { format } from 'date-fns'
import { PlusIcon } from '@heroicons/react/24/outline'

interface DayViewProps {
  selectedDate: Date
  shifts: Shift[]
  onAddShift: () => void
}

export default function DayView({ selectedDate, shifts, onAddShift }: DayViewProps) {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Schedule for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
      </h2>
      <div className="border rounded-lg bg-white shadow">
        <table className="w-full table-fixed border-collapse text-xs">
          <thead>
            <tr>
              <th className="bg-gray-100 border-b border-r w-28 py-1 px-2 text-left font-semibold text-gray-700">Hour</th>
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
            {Array.from({ length: 23 }, (_, hour) => (
              <tr key={hour} className="hover:bg-gray-50">
                <td className="border-b border-r bg-gray-50 px-2 py-1 font-medium text-xs text-gray-800 whitespace-nowrap">
                  {hour}:00
                </td>
                {Array.from({ length: 24 }, (_, hourIndex) => (
                  <td
                    key={hourIndex}
                    className="border-b border-r px-0.5 py-0.5 min-h-[20px] relative group"
                    style={{ width: '32px', minWidth: '32px', maxWidth: '32px', height: '28px' }}
                  >
                    <button
                      onClick={onAddShift}
                      className="rounded-full h-4 w-4 flex items-center justify-center bg-gray-100 hover:bg-[#31BCFF]/10 text-gray-400 hover:text-[#31BCFF] border border-gray-200 mx-auto opacity-0 group-hover:opacity-100 transition"
                      title="Add shift"
                      style={{ fontSize: '10px' }}
                    >
                      <PlusIcon className="h-2 w-2" />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}