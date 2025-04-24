'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EmployeeGroupForm from '@/components/EmployeeGroupForm'
import { WageType } from '@/components/EmployeeGroupForm'

interface EmployeeGroup {
  id: string
  name: string
  hourlyWage: number
  wagePerShift: number
  defaultWageType: WageType
  salaryCode: string
}

export default function EditEmployeeGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const employeeGroupId = React.use(params).id
  const router = useRouter()
  const [employeeGroup, setEmployeeGroup] = useState<EmployeeGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmployeeGroup = async () => {
      try {
        const res = await fetch(`/api/employee-groups/${employeeGroupId}`)
        if (!res.ok) throw new Error('Failed to fetch employee group')
        const data = await res.json()
        setEmployeeGroup(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchEmployeeGroup()
  }, [employeeGroupId])

  const handleSubmit = async (formData: EmployeeGroup) => {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/employee-groups/${employeeGroupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // Ensure numeric values are properly sent
          hourlyWage: Number(formData.hourlyWage),
          wagePerShift: Number(formData.wagePerShift)
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update employee group')
      }

      router.push('/dashboard/employee-groups')
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
        <div className="p-4 text-gray-500">Loading employee group...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
          <button 
            onClick={() => router.push('/dashboard/employee-groups')}
            className="mt-2 px-4 py-2 text-sm font-medium text-white bg-[#31BCFF] rounded-md hover:bg-[#31BCFF]/90"
          >
            Back to Employee Groups
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Employee Group</h1>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-6">
          {employeeGroup ? (
            <EmployeeGroupForm 
              initialData={employeeGroup}
              onSubmit={handleSubmit} 
              loading={saving} 
            />
          ) : (
            <div className="p-4 text-gray-500">
              Employee group data not available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
