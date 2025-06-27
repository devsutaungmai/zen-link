'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import EmployeeGroupForm from '@/components/EmployeeGroupForm'
import { WageType, EmployeeGroupFormData } from '@/components/EmployeeGroupForm'

interface EmployeeGroup {
  id: string
  name: string
  hourlyWage: number
  wagePerShift: number
  defaultWageType: WageType
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

  const handleSubmit = async (formData: EmployeeGroupFormData) => {
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/employee-groups')}
            className="p-2 hover:bg-white/50 rounded-xl transition-colors duration-200"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {employeeGroup ? employeeGroup.name : 'Edit Employee Group'}
            </h1>
            <p className="mt-2 text-gray-600">
              Manage employee group wage settings and configurations
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg">
        <div className="p-6">
          {employeeGroup ? (
            <EmployeeGroupForm 
              initialData={employeeGroup}
              onSubmit={handleSubmit} 
              loading={saving} 
            />
          ) : (
            <div className="p-4 text-gray-500 text-center">
              Employee group data not available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
