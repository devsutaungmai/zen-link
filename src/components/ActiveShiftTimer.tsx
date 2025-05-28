'use client'

import React, { useState, useEffect } from 'react'
import { StopIcon, ClockIcon } from '@heroicons/react/24/outline'

interface ActiveShift {
  id: string
  startTime: string
  date: string
  department?: {
    name: string
  }
  employeeGroup?: {
    name: string
  }
}

interface ActiveShiftTimerProps {
  activeShift: ActiveShift
  onEndShift: (shiftId: string) => void
  loading: boolean
}

export default function ActiveShiftTimer({ 
  activeShift, 
  onEndShift,
  loading 
}: ActiveShiftTimerProps) {
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00')

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      console.log('ActiveShiftTimer - Current time:', now.toISOString())
      console.log('ActiveShiftTimer - Shift date:', activeShift.date)
      console.log('ActiveShiftTimer - Shift startTime:', activeShift.startTime)
      
      // Handle the date format properly - extract just the date part if it's a full DateTime
      const dateString = activeShift.date.split('T')[0] // Get just the YYYY-MM-DD part
      const shiftStart = new Date(`${dateString}T${activeShift.startTime}:00`) // Add seconds for proper ISO format
      console.log('ActiveShiftTimer - Parsed shiftStart:', shiftStart.toISOString())
      console.log('ActiveShiftTimer - Is shiftStart valid?', !isNaN(shiftStart.getTime()))
      
      const diff = now.getTime() - shiftStart.getTime()
      console.log('ActiveShiftTimer - Time difference (ms):', diff)

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        console.log('ActiveShiftTimer - Calculated time:', { hours, minutes, seconds })

        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        )
      } else {
        console.log('ActiveShiftTimer - Negative diff, setting 00:00:00')
        setElapsedTime('00:00:00')
      }
    }

    // Update immediately
    updateTimer()

    // Update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [activeShift.date, activeShift.startTime])

  const handleEndShift = () => {
    onEndShift(activeShift.id)
  }

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':')
      const time = new Date()
      time.setHours(parseInt(hours), parseInt(minutes))
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } catch {
      return timeString
    }
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-green-900">Active Shift</h3>
            <div className="mt-1 space-y-1">
              <p className="text-sm text-green-700">
                Started at: {formatTime(activeShift.startTime)}
              </p>
              {activeShift.department && (
                <p className="text-sm text-green-700">
                  Department: {activeShift.department.name}
                </p>
              )}
              {activeShift.employeeGroup && (
                <p className="text-sm text-green-700">
                  Group: {activeShift.employeeGroup.name}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-2 mb-3">
            <ClockIcon className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-mono font-bold text-green-900">
              {elapsedTime}
            </span>
          </div>
          <button
            onClick={handleEndShift}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <StopIcon className="h-4 w-4 mr-2" />
            {loading ? 'Ending...' : 'End Shift'}
          </button>
        </div>
      </div>
    </div>
  )
}
