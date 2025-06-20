'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Swal from 'sweetalert2'

interface EmployeeGroup {
  id: string
  name: string
  hourlyWage: number
  wagePerShift: number
  defaultWageType: string
  salaryCode: string
  _count: {
    employees: number
  }
}

export default function EmployeeGroupsPage() {
  const [employeeGroups, setEmployeeGroups] = useState<EmployeeGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchEmployeeGroups()
  }, [])

  const fetchEmployeeGroups = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/employee-groups')
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setEmployeeGroups(data)
      } else {
        console.error('API did not return an array:', data)
        setEmployeeGroups([])
        setError('Invalid response format from server')
      }
    } catch (error) {
      console.error('Error fetching employee groups:', error)
      setError('Failed to load employee groups. Please try again later.')
      setEmployeeGroups([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#31BCFF',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      })

      if (result.isConfirmed) {
        const res = await fetch(`/api/employee-groups/${id}`, {
          method: 'DELETE',
        })
        
        if (!res.ok) {
          throw new Error('Failed to delete employee group')
        }
        
        setEmployeeGroups(employeeGroups.filter(group => group.id !== id))
        
        await Swal.fire({
          title: 'Deleted!',
          text: 'Employee group has been deleted.',
          icon: 'success',
          confirmButtonColor: '#31BCFF',
        })
      }
    } catch (error) {
      console.error('Error deleting employee group:', error)
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to delete employee group. Please try again.',
        icon: 'error',
        confirmButtonColor: '#31BCFF',
      })
    }
  }

  const filteredEmployeeGroups = employeeGroups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.salaryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.defaultWageType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="flex items-center justify-center h-32">Loading...</div>
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-red-600">{error}</div>
        <button 
          onClick={fetchEmployeeGroups}
          className="ml-4 px-4 py-2 text-sm font-medium text-white bg-[#31BCFF] rounded-md hover:bg-[#31BCFF]/90"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Employee Groups</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all employee groups in your organization.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/employee-groups/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#31BCFF] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#31BCFF]/90"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Create Employee Group
          </Link>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="relative flex-1 max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee groups..."
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow rounded-lg">
              {employeeGroups.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No employee groups found. Create one to get started.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Salary Code</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Wage Type</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Hourly Wage</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Wage/Shift</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Employees</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredEmployeeGroups.map((group) => (
                      <tr key={group.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {group.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {group.salaryCode}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {group.defaultWageType}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          $ {group.hourlyWage.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          $ {group.wagePerShift.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {group._count.employees}
                        </td>
                        <td className="relative whitespace-nowrap pl-3 pr-4 sm:pr-6 flex items-center space-x-4">
                          <Link
                            href={`/dashboard/employee-groups/${group.id}/edit`}
                            className="text-[#31BCFF] hover:text-[#31BCFF]/90"
                          >
                            <PencilIcon className="h-5 w-5 mt-3" />
                          </Link>
                          <button
                            onClick={() => handleDelete(group.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5 mt-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
