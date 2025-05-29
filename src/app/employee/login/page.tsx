'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EmployeeLoginPage() {
  const router = useRouter()
  const [employeeId, setEmployeeId] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePinInput = (value: string) => {
    if (value.length <= 4) {
      setPin(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!employeeId || !pin) {
      setError('Please enter both Employee ID and PIN')
      return
    }

    if (pin.length !== 4) {
      setError('PIN must be 4 digits')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/employee-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, pin }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Redirect to employee dashboard/punch clock
      router.push('/employee/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <h1 className="text-center text-3xl font-bold text-[#31BCFF] mb-2">ZenLink</h1>
        </Link>
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Employee Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your Employee ID and PIN to clock in/out
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
                Employee ID
              </label>
              <div className="mt-1">
                <input
                  id="employeeId"
                  name="employeeId"
                  type="text"
                  autoComplete="username"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#31BCFF] focus:border-[#31BCFF] sm:text-sm"
                  placeholder="EMP001"
                />
              </div>
            </div>

            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
                PIN (4 digits)
              </label>
              <div className="mt-1">
                <input
                  id="pin"
                  name="pin"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={pin}
                  onChange={(e) => handlePinInput(e.target.value.replace(/\D/g, ''))}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#31BCFF] focus:border-[#31BCFF] sm:text-sm text-center text-2xl font-mono tracking-widest"
                  placeholder="••••"
                  maxLength={4}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter your 4-digit PIN
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !employeeId || pin.length !== 4}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#31BCFF] hover:bg-[#31BCFF]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31BCFF] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31BCFF]"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
