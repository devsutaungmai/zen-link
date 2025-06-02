'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Swal from 'sweetalert2'

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeNo: string
  department: {
    name: string
  }
  employeeGroup?: {
    name: string
  }
  mobile: string
  email?: string
  isTeamLeader: boolean
  dateOfHire: Date
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteEmployeeId, setInviteEmployeeId] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinEmployeeId, setPinEmployeeId] = useState('');
  const [pinEmployeeName, setPinEmployeeName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/employees')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch employees')
      }
      
      const data = await response.json()
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setEmployees(data)
      } else {
        console.error('Expected array but got:', data)
        throw new Error('Invalid data format received from server')
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

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
        const res = await fetch(`/api/employees/${id}`, {
          method: 'DELETE',
        })
        
        if (res.ok) {
          setEmployees(employees.filter(emp => emp.id !== id))
          
          await Swal.fire({
            title: 'Deleted!',
            text: 'Employee has been deleted.',
            icon: 'success',
            confirmButtonColor: '#31BCFF',
          })
        } else {
          throw new Error('Failed to delete employee')
        }
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to delete employee.',
        icon: 'error',
        confirmButtonColor: '#31BCFF',
      })
    }
  }

  const handleInvite = (email: string, employeeId: string) => {
    setInviteEmail(email);
    setInviteEmployeeId(employeeId);
    setShowInviteModal(true);
  };

  const handleSetPin = (employeeId: string, employeeName: string) => {
    setPinEmployeeId(employeeId);
    setPinEmployeeName(employeeName);
    setNewPin('');
    setShowPinModal(true);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^\d{6}$/.test(newPin)) {
      await Swal.fire({
        title: 'Invalid PIN',
        text: 'PIN must be exactly 6 digits',
        icon: 'error',
        confirmButtonColor: '#31BCFF',
      });
      return;
    }

    try {
      const res = await fetch(`/api/employees/${pinEmployeeId}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: newPin }),
      });

      if (res.ok) {
        await Swal.fire({
          title: 'Success',
          text: 'PIN has been set successfully!',
          icon: 'success',
          confirmButtonColor: '#31BCFF',
        });
        setShowPinModal(false);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to set PIN');
      }
    } catch (error) {
      console.error('Error setting PIN:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Failed to set PIN. Please try again.',
        icon: 'error',
        confirmButtonColor: '#31BCFF',
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  // Show loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading employees...</div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error: {error}
          <button 
            onClick={fetchEmployees}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Employees</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all employees in your organization.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/employees/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#31BCFF] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#31BCFF]/90"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Employee
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
            placeholder="Search employees..."
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-[#31BCFF] focus:outline-none focus:ring-1 focus:ring-[#31BCFF]"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Employee No.</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Department</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Group</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mobile</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {employee.firstName} {employee.lastName}
                        {employee.isTeamLeader && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Team Lead
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.employeeNo}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.department.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.employeeGroup?.name || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.mobile}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleInvite(employee.email || '', employee.id)}
                            className="flex items-center text-[#31BCFF] hover:text-[#31BCFF]/90 px-2 py-1"
                            title="Send Invite"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleSetPin(employee.id, `${employee.firstName} ${employee.lastName}`)}
                            className="flex items-center text-green-600 hover:text-green-700 px-2 py-1"
                            title="Set PIN"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                              />
                            </svg>
                          </button>
                          <Link
                            href={`/dashboard/employees/${employee.id}/edit`}
                            className="text-[#31BCFF] hover:text-[#31BCFF]/90 p-1"
                            title="Edit Employee"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(employee.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Employee"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Send Invite</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch('/api/employees/invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      email: inviteEmail,
                      employeeId: inviteEmployeeId,
                    }),
                  });
                  if (res.ok) {
                    // Update the employee's email in the local state
                    setEmployees(employees.map(emp => 
                      emp.id === inviteEmployeeId 
                        ? { ...emp, email: inviteEmail } 
                        : emp
                    ));
                    
                    Swal.fire('Success', 'Invite sent successfully!', 'success');
                  } else {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to send invite');
                  }
                } catch (error) {
                  console.error('Error sending invite:', error);
                  Swal.fire('Error', 'Failed to send invite.', 'error');
                } finally {
                  setShowInviteModal(false);
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#31BCFF] focus:ring-[#31BCFF]"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#31BCFF] text-white rounded-md hover:bg-[#31BCFF]/90"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Set PIN for {pinEmployeeName}
            </h2>
            <form onSubmit={handlePinSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  6-Digit PIN
                </label>
                <input
                  type="text"
                  value={newPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                    if (value.length <= 6) {
                      setNewPin(value);
                    }
                  }}
                  placeholder="123456"
                  maxLength={6}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-center text-lg font-mono tracking-wider shadow-sm focus:border-[#31BCFF] focus:ring-[#31BCFF]"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter a 6-digit PIN that the employee will use to punch in/out
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newPin.length !== 6}
                  className="px-4 py-2 bg-[#31BCFF] text-white rounded-md hover:bg-[#31BCFF]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Set PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
