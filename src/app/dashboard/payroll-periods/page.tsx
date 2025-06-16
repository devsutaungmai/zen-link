'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import { PayrollPeriod } from '@/types'

export default function PayrollPeriodsPage() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchPeriods = async (page = 1, status = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (status && status !== 'all') {
        params.append('status', status)
      }

      const response = await fetch(`/api/payroll-periods?${params}`)
      const data = await response.json()

      if (response.ok) {
        setPeriods(data.payrollPeriods)
        setTotalPages(data.pagination.pages)
      } else {
        console.error('Error fetching periods:', data.error)
      }
    } catch (error) {
      console.error('Error fetching periods:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeriods(currentPage, statusFilter)
  }, [currentPage, statusFilter])

  const handleDelete = async (id: string) => {
    const period = periods.find(p => p.id === id)
    
    if (!period) return

    if (period.status !== 'DRAFT') {
      alert('Cannot delete finalized or closed payroll periods')
      return
    }

    if (!confirm('Are you sure you want to delete this payroll period? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/payroll-periods/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPeriods(prev => prev.filter(period => period.id !== id))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete payroll period')
      }
    } catch (error) {
      console.error('Error deleting period:', error)
      alert('Failed to delete payroll period')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      FINALIZED: 'bg-blue-100 text-blue-800 border-blue-200',
      CLOSED: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status as keyof typeof styles] || styles.DRAFT}`}>
        {status}
      </span>
    )
  }

  const filteredPeriods = periods.filter(period =>
    period.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#31BCFF]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Payroll Periods
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your payroll periods and processing schedules
            </p>
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-[#31BCFF] rounded-full mr-2"></div>
                {periods.length} Total Periods
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {periods.filter(p => p.status === 'DRAFT').length} Draft
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                {periods.filter(p => p.status === 'FINALIZED').length} Finalized
              </span>
            </div>
          </div>
          <Link
            href="/dashboard/payroll-periods/create"
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-[#31BCFF] to-[#0EA5E9] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
          >
            <PlusIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
            Create Period
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search payroll periods..."
              className="block w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#31BCFF]/50 focus:border-[#31BCFF] transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-[#31BCFF]/50 focus:border-[#31BCFF] transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="FINALIZED">Finalized</option>
              <option value="CLOSED">Closed</option>
            </select>
            <div className="text-sm text-gray-500">
              Showing {filteredPeriods.length} of {periods.length} periods
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Periods Grid */}
      {filteredPeriods.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 border border-gray-200/50 shadow-lg text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payroll periods found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first payroll period'}
          </p>
          {!searchTerm && (
            <Link
              href="/dashboard/payroll-periods/create"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-[#31BCFF] text-white font-medium hover:bg-[#31BCFF]/90 transition-colors duration-200"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create First Period
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeriods.map((period) => (
            <div
              key={period.id}
              className="group bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-[#31BCFF]/30"
            >
              {/* Period Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#31BCFF] transition-colors duration-200">
                    {period.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Link
                    href={`/dashboard/payroll-periods/${period.id}/edit`}
                    className="p-2 text-gray-400 hover:text-[#31BCFF] hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit Period"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                  {period.status === 'DRAFT' && (
                    <button
                      onClick={() => handleDelete(period.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete Period"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Period Status */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#31BCFF]/10 rounded-lg flex items-center justify-center mr-3">
                      <CalendarIcon className="w-5 h-5 text-[#31BCFF]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Status
                      </p>
                      {getStatusBadge(period.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Period Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="w-4 h-4 mr-2 opacity-60" />
                  <span className="truncate">
                    Created {new Date(period.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="w-4 h-4 mr-2 opacity-60" />
                  <span className="truncate">
                    {Math.ceil((new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) / (1000 * 60 * 60 * 24))} days duration
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200/50">
                <Link
                  href={`/dashboard/payroll-periods/${period.id}/edit`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gray-50 text-gray-700 font-medium hover:bg-[#31BCFF] hover:text-white transition-all duration-200 group/btn"
                >
                  <PencilIcon className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" />
                  Edit Period
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white/50 border border-gray-300 rounded-lg hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white/50 border border-gray-300 rounded-lg hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
