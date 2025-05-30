'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from 'lucide-react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { APP_NAME } from '@/app/constants'

export default function EmployeeLoginPage() {
  const router = useRouter()
  const [employeeId, setEmployeeId] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePinInput = (value: string) => {
    setPin(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!employeeId || !pin) {
      setError('Please enter both Employee ID and PIN')
      return
    }

    if (pin.length !== 6) {
      setError('PIN must be 6 digits')
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
      router.push('/employee/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#E5F1FF' }}>
      {/* Logo */}
      <Link href="/">
        <h1 className="text-3xl font-bold text-[#31BCFF] mb-8">{APP_NAME}</h1>
      </Link>

      {/* Main Container */}
      <div className="w-full max-w-md">
        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#0369A1' }}>Zenlink</h1>
            <h2 className="text-xl font-semibold text-gray-800">Employee Sign in</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#31BCFF] focus:border-[#31BCFF] outline-none text-gray-900"
              placeholder="EMP001"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN (6 digits)
            </label>
            <div className="flex justify-center mt-2">
              <InputOTP
                maxLength={6}
                value={pin}
                onChange={handlePinInput}
                className="gap-2"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg font-mono border-gray-300 focus:border-[#31BCFF] focus:ring-[#31BCFF]" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg font-mono border-gray-300 focus:border-[#31BCFF] focus:ring-[#31BCFF]" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg font-mono border-gray-300 focus:border-[#31BCFF] focus:ring-[#31BCFF]" />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg font-mono border-gray-300 focus:border-[#31BCFF] focus:ring-[#31BCFF]" />
                  <InputOTPSlot index={4} className="w-12 h-12 text-lg font-mono border-gray-300 focus:border-[#31BCFF] focus:ring-[#31BCFF]" />
                  <InputOTPSlot index={5} className="w-12 h-12 text-lg font-mono border-gray-300 focus:border-[#31BCFF] focus:ring-[#31BCFF]" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <p className="text-center text-xs text-gray-600 mt-2">
              Enter your 6-digit PIN
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !employeeId || pin.length !== 6}
            className="w-full bg-[#31BCFF] hover:bg-[#31BCFF]/90 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" />
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Need admin access?</p>
          <Link 
            href="/login" 
            className="text-[#31BCFF] hover:underline font-medium"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  )
}
