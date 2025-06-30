'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BuildingOfficeIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function TimeTrackingLoginPage() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!businessName.trim()) {
      setError('Please enter a business name')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/business/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: businessName.trim()
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate business')
      }

      // Store the validated business information
      localStorage.setItem('timeTrackingBusiness', businessName.trim())
      localStorage.setItem('timeTrackingBusinessData', JSON.stringify(data.business))
      
      setSuccess(`Business "${data.business.name}" found! Redirecting...`)
      
      // Small delay to show success message
      setTimeout(() => {
        router.push('/time-tracking')
      }, 1000)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to access time tracking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#31BCFF] to-[#0EA5E9] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ClockIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Time Tracking Portal
          </h1>
          <p className="text-gray-600">
            Access your business time tracking dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name"
                  className="block w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#31BCFF]/50 focus:border-[#31BCFF] transition-all duration-200"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter the exact business name as registered in the system
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3">
                <div className="text-sm">{error}</div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3">
                <div className="text-sm">{success}</div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#31BCFF] to-[#0EA5E9] border border-transparent rounded-xl hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31BCFF] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Accessing...
                </>
              ) : (
                <>
                  Access Time Tracking
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Features Preview */}
        <div className="mt-8 bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Time Tracking Features
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Real-time shift tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm text-gray-700">Employee status monitoring</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm text-gray-700">Business dashboard overview</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Device IP verification will be added in future updates
          </p>
        </div>
      </div>
    </div>
  )
}
