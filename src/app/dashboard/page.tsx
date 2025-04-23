'use client'

import { useState } from 'react'
import { CalendarIcon, UserGroupIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline'

const stats = [
  { name: 'Total Employees', value: '25', icon: UserGroupIcon },
  { name: 'Hours Scheduled', value: '156', icon: ClockIcon },
  { name: 'Shifts Today', value: '12', icon: CalendarIcon },
  { name: 'Weekly Hours', value: '480', icon: ChartBarIcon },
]

export default function DashboardPage() {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
            <div className="mt-4">
              <div className="border-t border-gray-200">
                <p className="py-4 text-sm text-gray-500">No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}