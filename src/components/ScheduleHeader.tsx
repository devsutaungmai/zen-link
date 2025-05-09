import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface ScheduleHeaderProps {
  startDate: Date
  endDate: Date
  viewMode: 'week' | 'day'
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onSetViewMode: (mode: 'week' | 'day') => void
}

export default function ScheduleHeader({
  startDate,
  endDate,
  viewMode,
  onPrev,
  onNext,
  onToday,
  onSetViewMode,
}: ScheduleHeaderProps) {
  return (
    <div className="mb-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold text-gray-900 mr-4">Schedule</h1>
        <div className="flex space-x-2">
          <button onClick={onPrev} className="p-2 rounded-md hover:bg-gray-200 text-gray-900">
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="px-3 py-1 border rounded-md text-gray-500">
            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
          </div>
          <button onClick={onNext} className="p-2 rounded-md hover:bg-gray-200 text-gray-900">
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onToday}
          className={`px-4 py-2 rounded-md border transition-colors duration-150 ${
            viewMode === 'day' ? 'bg-[#31BCFF] text-white border-[#31BCFF]' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => onSetViewMode('week')}
          className={`px-4 py-2 rounded-md border transition-colors duration-150 ${
            viewMode === 'week' ? 'bg-[#31BCFF] text-white border-[#31BCFF]' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'
          }`}
        >
          Week
        </button>
      </div>
    </div>
  )
}