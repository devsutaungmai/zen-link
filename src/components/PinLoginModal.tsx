'use client'

import React, { useState, useEffect } from 'react'
import { 
  XMarkIcon, 
  LockClosedIcon, 
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeNo: string
  department: {
    name: string
  }
  employeeGroup?: {
    name: string
  }
  email: string
  mobile: string
  isTeamLeader: boolean
}

interface PinLoginModalProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee | null
  onSuccess: (employee: Employee) => void
}

export default function PinLoginModal({ isOpen, onClose, employee, onSuccess }: PinLoginModalProps) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const maxAttempts = 3

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPin('')
      setError('')
      setAttempts(0)
    }
  }, [isOpen, employee])

  const handlePinChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    setPin(numericValue)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!employee || !pin) return
    
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits')
      return
    }

    if (attempts >= maxAttempts) {
      setError('Too many failed attempts. Please contact your manager.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/employees/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employee.id,
          pin: pin
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Redirect to employee dashboard page with employee ID
        window.location.href = `/employee/dashboard?employeeId=${employee.id}`
      } else {
        setAttempts(prev => prev + 1)
        setError(data.error || 'Invalid PIN. Please try again.')
        setPin('')
      }
    } catch (error) {
      console.error('Error verifying PIN:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNumberClick = (number: string) => {
    if (pin.length < 6) {
      handlePinChange(pin + number)
    }
  }

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1))
  }

  const handleClear = () => {
    setPin('')
    setError('')
  }

  if (!isOpen || !employee) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <LockClosedIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Employee Login</h3>
                <p className="text-sm text-gray-600">Enter your PIN to continue</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Employee Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                {employee.firstName} {employee.lastName}
              </h4>
              <p className="text-sm text-gray-600">
                {employee.employeeNo} • {employee.department.name}
              </p>
              {employee.employeeGroup && (
                <p className="text-xs text-blue-600">
                  {employee.employeeGroup.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* PIN Input */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enter PIN
              </label>
              <div className="flex justify-center mb-4">
                <div className="flex gap-2">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center text-lg font-bold ${
                        pin.length > index
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-gray-50 text-gray-400'
                      }`}
                    >
                      {pin.length > index ? '•' : ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => handleNumberClick(number.toString())}
                  className="h-12 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg text-lg font-semibold text-gray-700 transition-colors touch-manipulation"
                  disabled={loading}
                >
                  {number}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-12 bg-red-100 hover:bg-red-200 active:bg-red-300 rounded-lg text-sm font-medium text-red-600 transition-colors touch-manipulation"
                disabled={loading}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleNumberClick('0')}
                className="h-12 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg text-lg font-semibold text-gray-700 transition-colors touch-manipulation"
                disabled={loading}
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 bg-yellow-100 hover:bg-yellow-200 active:bg-yellow-300 rounded-lg text-sm font-medium text-yellow-600 transition-colors touch-manipulation"
                disabled={loading}
              >
                ⌫
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Attempts Warning */}
            {attempts > 0 && attempts < maxAttempts && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  {maxAttempts - attempts} attempt{maxAttempts - attempts !== 1 ? 's' : ''} remaining
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || pin.length < 4 || attempts >= maxAttempts}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3">
          <p className="text-xs text-gray-500 text-center">
            Contact your manager if you've forgotten your PIN
          </p>
        </div>
      </div>
    </div>
  )
}
