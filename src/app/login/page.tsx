'use client'

import { useState } from 'react'
import { useAuth } from '@/app/lib/useAuth'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { User } from 'lucide-react'
import { APP_NAME } from '@/app/constants'

export default function LoginPage() {
  const { login, error, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
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
            <h2 className="text-xl font-semibold text-gray-800">Sign in</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#31BCFF] focus:border-[#31BCFF] outline-none text-gray-900"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#31BCFF] focus:border-[#31BCFF] outline-none text-gray-900"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#31BCFF] hover:bg-[#31BCFF]/90 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="mt-4">
            <Link 
              href="/employee/login"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 border border-gray-300"
            >
              <User className="w-4 h-4" />
              Time Tracker Portal
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link 
              href="/forgot-password" 
              className="text-sm text-[#31BCFF] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Don't have an account?</p>
          <Link 
            href="/register" 
            className="text-[#31BCFF] hover:underline font-medium"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}
