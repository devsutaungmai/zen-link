'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EmployeeForm from '@/components/EmployeeForm'
import { Department, EmployeeGroup } from '@prisma/client'

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const employeeId = React.use(params).id
  const router = useRouter()
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [employeeGroups, setEmployeeGroups] = useState<EmployeeGroup[]>([])

  useEffect(() => {
    if (!employeeId) return

    const fetchData = async () => {
      try {
        const [employeeRes, deptsRes, groupsRes] = await Promise.all([
          fetch(`/api/employees/${employeeId}`),
          fetch('/api/departments'),
          fetch('/api/employee-groups')
        ])

        if (!employeeRes.ok || !deptsRes.ok || !groupsRes.ok) {
          throw new Error('Failed to fetch required data')
        }

        setEmployee(await employeeRes.json())
        setDepartments(await deptsRes.json())
        setEmployeeGroups(await groupsRes.json())
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load form data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [employeeId])

  const handleSubmit = async (formData: any) => {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          birthday: new Date(formData.birthday).toISOString(),
          dateOfHire: new Date(formData.dateOfHire).toISOString()
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update employee')
      }

      router.push('/dashboard/employees')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 text-gray-500">Loading employee data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md max-w-md text-center">
          {error}
          <div className="mt-4 space-y-2">
            <button
              onClick={() => router.push('/dashboard/employees')}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-[#31BCFF] rounded-md hover:bg-[#31BCFF]/90"
            >
              Back to Employees
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Employee</h1>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-6 bg-white shadow rounded-lg p-6">
          {employee ? (
            <EmployeeForm 
              initialData={employee}
              onSubmit={handleSubmit} 
              loading={saving}
              departments={departments}
              employeeGroups={employeeGroups}
            />
          ) : (
            <div className="p-4 text-gray-500">
              Employee data not available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
