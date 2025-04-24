'use client'

import React, { useState, useEffect , use } from 'react'
import { useRouter } from 'next/navigation'
import ShiftForm from '@/components/ShiftForm'
import { ShiftType, WageType } from '@prisma/client'

interface Shift {
  id: string
  date: string
  startTime: string
  endTime: string
  employeeId?: string | null
  employeeGroupId?: string | null
  shiftType: ShiftType
  breakStart?: string | null
  breakEnd?: string | null
  wage: number
  wageType: WageType
  note?: string | null
  approved: boolean
  employee?: {
    id: string
    firstName: string
    lastName: string
  } | null
  employeeGroup?: {
    id: string
    name: string
  } | null
}

export default function EditShiftPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const shiftId = React.use(params).id
  const [shift, setShift] = useState<Shift | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [employees, setEmployees] = useState<{ id: string; firstName: string; lastName: string }[]>([])
  const [employeeGroups, setEmployeeGroups] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch shift data
        const shiftRes = await fetch(`/api/shifts/${shiftId}`)
        if (!shiftRes.ok) throw new Error('Failed to fetch shift')
        const shiftData = await shiftRes.json()
        
        // Format date to YYYY-MM-DD for the date input
        const formattedShift = {
          ...shiftData,
          date: new Date(shiftData.date).toISOString().split('T')[0]
        }
        
        setShift(formattedShift)

        // Fetch employees and groups (you might want to move this to a context/provider)
        const employeesRes = await fetch('/api/employees')
        const groupsRes = await fetch('/api/employee-groups')
        
        if (employeesRes.ok) {
          const employeesData = await employeesRes.json()
          setEmployees(employeesData)
        }
        
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json()
          setEmployeeGroups(groupsData)
        }

      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [shiftId])

  const handleSubmit = async (formData: Shift) => {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/shifts/${shiftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to update shift')
      }

      router.push('/dashboard/shifts')
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
        <div className="p-4 text-gray-500">Loading shift data...</div>
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
        <h1 className="text-2xl font-semibold text-gray-900">Edit Shift</h1>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-6">
          {shift && (
            <ShiftForm 
              initialData={shift}
              onSubmit={handleSubmit} 
              loading={saving}
              employees={employees}
              employeeGroups={employeeGroups}
            />
          )}
        </div>
      </div>
    </div>
  )
}
