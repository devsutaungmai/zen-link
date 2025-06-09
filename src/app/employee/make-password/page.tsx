'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Swal from 'sweetalert2'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { APP_NAME } from '@/app/constants'

function PasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const employeeId = searchParams.get('employeeId')
  
  const [employeeInfo, setEmployeeInfo] = useState({
    firstName: '',
    lastName: '',
    email: email || '',
  })
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!email && !employeeId) {
        Swal.fire({
          title: 'Error',
          text: 'Invalid invitation link',
          icon: 'error',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        })
        setLoading(false)
        return
      }

      try {
        const query = employeeId ? `employeeId=${employeeId}` : `email=${encodeURIComponent(email || '')}`
        const res = await fetch(`/api/employees/info?${query}`)
        
        if (!res.ok) {
          throw new Error('Could not find employee information')
        }
        
        const data = await res.json()
        
        setEmployeeInfo({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || email || '',
        })
      } catch (error) {
        console.error('Error fetching employee data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployeeData()
  }, [email, employeeId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!employeeInfo.email) {
      Swal.fire({
        title: 'Error',
        text: 'Email is missing',
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        title: 'Error',
        text: 'Passwords do not match',
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
      return
    }

    setSubmitting(true)
    
    try {
      const res = await fetch('/api/employee/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: employeeInfo.email,
          firstName: employeeInfo.firstName,
          lastName: employeeInfo.lastName,
          password: formData.password,
          employeeId: employeeId || undefined,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      Swal.fire({
        title: 'Success',
        text: 'Your account has been created. You can now log in.',
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
      router.push('/login')
    } catch (error: any) {
      console.error('Registration error:', error)
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to create account',
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E5F1FF' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#31BCFF]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#E5F1FF' }}>
      {/* Logo */}
      <Link href="/">
        <h1 className="text-3xl font-bold text-[#31BCFF] mb-8">{APP_NAME}</h1>
      </Link>

      {/* Main Container */}
      <div className="w-full max-w-md">
        {/* Password Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#0369A1' }}>Zenlink</h1>
            <h2 className="text-xl font-semibold text-gray-800">Create your password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Set up your Zen Link account to get started
            </p>
          </div>
          
          {/* Employee Info */}
          <div className="mb-6 text-center p-4 bg-gray-50 rounded-md">
            <p className="text-lg font-medium text-gray-900">
              {employeeInfo.firstName} {employeeInfo.lastName}
            </p>
            <p className="text-sm text-gray-500">{employeeInfo.email}</p>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#31BCFF] focus:border-[#31BCFF] outline-none text-gray-900"
                placeholder="Password"
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

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#31BCFF] focus:border-[#31BCFF] outline-none text-gray-900"
                placeholder="Confirm Password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#31BCFF] hover:bg-[#31BCFF]/90 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Already have an account?</p>
          <Link 
            href="/login" 
            className="text-[#31BCFF] hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function MakePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E5F1FF' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#31BCFF]"></div>
      </div>
    }>
      <PasswordForm />
    </Suspense>
  )
}