'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DepartmentForm from '@/components/DepartmentForm'

interface Department {
  id: string
  name: string
  number?: string
  address: string
  address2?: string
  postCode?: string
  city: string
  phone: string
  country: string
}

export default function EditDepartmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const departmentId = React.use(params).id
  const [department, setDepartment] = useState<Department | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const res = await fetch(`/api/departments/${departmentId}`)
        if (!res.ok) throw new Error('Failed to fetch department')
        const data = await res.json()
        setDepartment(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDepartment()
  }, [departmentId])

  const handleSubmit = async (formData: Department) => {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/departments/${departmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to update department')
      }

      router.push('/dashboard/departments')
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
        <div className="p-4 text-gray-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
        {error}
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Department</h1>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-6">
          <DepartmentForm 
            initialData={department}
            onSubmit={handleSubmit} 
            loading={saving} 
          />
        </div>
      </div>
    </div>
  )
}