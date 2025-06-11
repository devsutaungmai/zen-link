import React from 'react'
import { Badge } from "@/components/ui/badge"
import { ArrowRightLeft, Users } from "lucide-react"

interface ShiftExchangeInfoProps {
  shift: {
    id: string
    approved: boolean
    shiftExchanges?: Array<{
      id: string
      status: string
      fromEmployee: {
        firstName: string
        lastName: string
        department: {
          name: string
        }
      }
      toEmployee: {
        firstName: string
        lastName: string
        department: {
          name: string
        }
      }
    }>
    employee?: {
      firstName: string
      lastName: string
      department?: {
        name: string
      }
    }
  }
}

export default function ShiftExchangeInfo({ shift }: ShiftExchangeInfoProps) {
  // Only show exchange info if shift is approved and has approved exchanges
  const approvedExchange = shift.shiftExchanges?.find(exchange => exchange.status === 'APPROVED')
  
  if (!shift.approved || !approvedExchange) {
    return null
  }

  return (
    <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 mb-1">
        <ArrowRightLeft className="w-4 h-4 text-blue-600" />
        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
          Exchange Approved
        </Badge>
      </div>
      
      <div className="text-xs text-blue-700 space-y-1">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span className="font-medium">Current:</span>
          <span>
            {shift.employee?.firstName} {shift.employee?.lastName}
            {shift.employee?.department && (
              <span className="text-blue-500 ml-1">({shift.employee.department.name})</span>
            )}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span className="font-medium">Originally assigned to:</span>
          <span>
            {approvedExchange.fromEmployee.firstName} {approvedExchange.fromEmployee.lastName}
            <span className="text-blue-500 ml-1">({approvedExchange.fromEmployee.department.name})</span>
          </span>
        </div>
      </div>
    </div>
  )
}
