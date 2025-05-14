'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Swal from 'sweetalert2'

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

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!email && !employeeId) {
        Swal.fire('Error', 'Invalid invitation link', 'error')
        setLoading(false)
        return
      }

      try {
        // Get employee information if we have an ID or email
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
      Swal.fire('Error', 'Email is missing', 'error')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      Swal.fire('Error', 'Passwords do not match', 'error')
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

      await Swal.fire('Success', 'Your account has been created. You can now log in.', 'success')
      router.push('/login')
    } catch (error: any) {
      console.error('Registration error:', error)
      Swal.fire('Error', error.message || 'Failed to create account', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#31BCFF]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up your Zen Link account to get started
          </p>
          
          {/* Show employee name */}
          <div className="mt-4 text-center">
            <p className="text-lg font-medium text-gray-900">
              {employeeInfo.firstName} {employeeInfo.lastName}
            </p>
            <p className="text-sm text-gray-500">{employeeInfo.email}</p>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-3">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#31BCFF] focus:border-[#31BCFF] focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#31BCFF] focus:border-[#31BCFF] focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#31BCFF] hover:bg-[#31BCFF]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31BCFF] disabled:opacity-50"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MakePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#31BCFF]"></div>
      </div>
    }>
      <PasswordForm />
    </Suspense>
  )
}