'use client'

import { useState } from 'react'
import DashboardNavbar from '@/components/DashboardNavbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar setMobileMenuOpen={setMobileMenuOpen} />
      
      <div className="flex flex-col flex-1">
        <div className="pt-16"> {/* Padding to account for fixed navbar */}
          <div className="py-8 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}