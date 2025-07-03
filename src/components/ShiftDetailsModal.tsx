import React, { useState, useEffect } from 'react'
import { 
  XMarkIcon, 
  ClockIcon, 
  CalendarIcon,
  UserIcon,
  ArrowsRightLeftIcon,
  HandRaisedIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
}

interface Shift {
  id: string
  date: string
  startTime: string
  endTime: string | null
  shiftType: string
  employeeId: string
  note?: string | null
  employee: {
    firstName: string
    lastName: string
  }
  employeeGroup?: {
    name: string
  }
  department?: {
    name: string
  }
}

interface ShiftDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  shift: Shift | null
  currentEmployeeId: string
}

type ActionType = 'swap' | 'handover' | 'sell' | null

export default function ShiftDetailsModal({ isOpen, onClose, shift, currentEmployeeId }: ShiftDetailsModalProps) {
  const [activeAction, setActiveAction] = useState<ActionType>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeShifts, setEmployeeShifts] = useState<Shift[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [selectedSwapShift, setSelectedSwapShift] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [pendingExchanges, setPendingExchanges] = useState<any[]>([])
  const [cancellingExchange, setCancellingExchange] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && shift) {
      fetchPendingExchanges()
    }
  }, [isOpen, shift])

  useEffect(() => {
    if (isOpen && (activeAction === 'swap' || activeAction === 'handover')) {
      fetchEmployees()
    }
  }, [isOpen, activeAction])

  useEffect(() => {
    if (selectedEmployee && activeAction === 'swap') {
      fetchEmployeeShifts(selectedEmployee)
    }
  }, [selectedEmployee, activeAction])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/employees')
      if (response.ok) {
        const data = await response.json()
        // Filter out current employee
        const otherEmployees = data.filter((emp: Employee) => emp.id !== currentEmployeeId)
        setEmployees(otherEmployees)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployeeShifts = async (employeeId: string) => {
    if (!shift) return
    
    setLoading(true)
    try {
      // Fetch shifts for the selected employee on the same date
      const shiftDate = shift.date.split('T')[0]
      const response = await fetch(`/api/shifts?employeeId=${employeeId}&startDate=${shiftDate}&endDate=${shiftDate}`)
      if (response.ok) {
        const data = await response.json()
        setEmployeeShifts(data)
      }
    } catch (error) {
      console.error('Error fetching employee shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingExchanges = async () => {
    if (!shift) return
    
    try {
      const response = await fetch(`/api/shift-exchanges?employeeId=${currentEmployeeId}&status=PENDING`)
      if (response.ok) {
        const data = await response.json()
        // Filter to only exchanges for this specific shift
        const shiftExchanges = data.filter((exchange: any) => exchange.shiftId === shift.id)
        setPendingExchanges(shiftExchanges)
      }
    } catch (error) {
      console.error('Error fetching pending exchanges:', error)
    }
  }

  const handleSwapRequest = async () => {
    if (!shift || !selectedEmployee) return

    setSubmitLoading(true)
    try {
      // Get selected employee details for better messaging
      const selectedEmp = employees.find(emp => emp.id === selectedEmployee)
      const selectedShiftDetails = selectedSwapShift 
        ? employeeShifts.find(s => s.id === selectedSwapShift)
        : null

      let requestReason = `Swap request with ${selectedEmp?.firstName} ${selectedEmp?.lastName}`
      if (selectedShiftDetails) {
        requestReason += ` for their shift on ${formatDate(selectedShiftDetails.date)} (${formatTime(selectedShiftDetails.startTime)} - ${selectedShiftDetails.endTime ? formatTime(selectedShiftDetails.endTime) : 'Open End'})`
      }

      const response = await fetch('/api/shift-exchanges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromShiftId: shift.id,
          toEmployeeId: selectedEmployee,
          type: 'SWAP',
          requestReason
        }),
      })

      if (response.ok) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          icon: 'success',
          title: 'Swap request submitted successfully! Waiting for admin approval.'
        })
        await fetchPendingExchanges() // Refresh pending exchanges
        resetForm()
      } else {
        const error = await response.json()
        Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          icon: 'error',
          title: error.error || 'Failed to submit swap request'
        })
      }
    } catch (error) {
      console.error('Error submitting swap request:', error)
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon: 'error',
        title: 'Failed to submit swap request'
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleHandoverRequest = async () => {
    if (!shift || !selectedEmployee) return

    setSubmitLoading(true)
    try {
      const response = await fetch('/api/shift-exchanges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromShiftId: shift.id,
          toEmployeeId: selectedEmployee,
          type: 'HANDOVER',
          requestReason: 'Handover request'
        }),
      })

      if (response.ok) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          icon: 'success',
          title: 'Handover request submitted successfully! Waiting for admin approval.'
        })
        await fetchPendingExchanges() // Refresh pending exchanges
        resetForm()
      } else {
        const error = await response.json()
        Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          icon: 'error',
          title: error.error || 'Failed to submit handover request'
        })
      }
    } catch (error) {
      console.error('Error submitting handover request:', error)
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon: 'error',
        title: 'Failed to submit handover request'
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleCancelExchange = async (exchangeId: string) => {
    setCancellingExchange(exchangeId)
    try {
      const response = await fetch(`/api/shift-exchanges/${exchangeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          icon: 'success',
          title: 'Exchange request cancelled successfully.'
        })
        await fetchPendingExchanges() // Refresh pending exchanges
      } else {
        const error = await response.json()
        Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          icon: 'error',
          title: error.error || 'Failed to cancel exchange request'
        })
      }
    } catch (error) {
      console.error('Error cancelling exchange:', error)
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon: 'error',
        title: 'Failed to cancel exchange request'
      })
    } finally {
      setCancellingExchange(null)
    }
  }

  const handleSellShift = async () => {
    if (!shift) return

    setSubmitLoading(true)
    try {
      const response = await fetch(`/api/shifts/${shift.id}/sell`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'FOR_SALE'
        }),
      })

      if (response.ok) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          icon: 'success',
          title: 'Shift marked for sale successfully!'
        })
        onClose()
        resetForm()
      } else {
        const error = await response.json()
        Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          icon: 'error',
          title: error.error || 'Failed to mark shift for sale'
        })
      }
    } catch (error) {
      console.error('Error marking shift for sale:', error)
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon: 'error',
        title: 'Failed to mark shift for sale'
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  const resetForm = () => {
    setActiveAction(null)
    setSelectedEmployee('')
    setSelectedSwapShift('')
    setEmployeeShifts([])
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5) // Returns HH:MM format
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (!isOpen || !shift) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Shift Details
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDate(shift.date)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {!activeAction ? (
            <>
              {/* Shift Information */}
              <div className="mb-6">
                <div className="bg-sky-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                        <ClockIcon className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{shift.shiftType || 'Regular Shift'}</h5>
                        <p className="text-sm text-gray-600">
                          {formatTime(shift.startTime)} - {shift.endTime ? formatTime(shift.endTime) : 'Open End'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Department:</span>
                      <p className="font-medium">{shift.department?.name || 'N/A'}</p>
                    </div>
                    {shift.employeeGroup && (
                      <div>
                        <span className="text-gray-500">Group:</span>
                        <p className="font-medium">{shift.employeeGroup.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* For Sale Status */}
              {shift.note && shift.note.includes('[FOR SALE]') && (
                <div className="mb-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="font-medium text-orange-800">Shift For Sale</span>
                      <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-sm text-orange-700">
                      This shift is currently available for purchase by other employees.
                    </p>
                  </div>
                </div>
              )}

              {/* Pending Exchange Requests */}
              {pendingExchanges.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Pending Exchange Requests</h4>
                  <div className="space-y-3">
                    {pendingExchanges.map((exchange) => (
                      <div key={exchange.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span className="font-medium text-yellow-800">
                                {exchange.reason?.includes('SWAP') ? 'Swap Request' : 'Handover Request'}
                              </span>
                              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                                PENDING
                              </span>
                            </div>
                            <p className="text-sm text-yellow-700">
                              To: {exchange.toEmployee.firstName} {exchange.toEmployee.lastName}
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                              Requested: {new Date(exchange.requestedAt).toLocaleDateString()}
                            </p>
                            {exchange.reason?.includes('shift') && (
                              <p className="text-xs text-yellow-600">
                                {exchange.reason}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleCancelExchange(exchange.id)}
                            disabled={cancellingExchange === exchange.id}
                            className="ml-3 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-lg transition-colors disabled:opacity-50"
                          >
                            {cancellingExchange === exchange.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons - Only show if no pending exchanges and not for sale */}
              {pendingExchanges.length === 0 && !(shift.note && shift.note.includes('[FOR SALE]')) && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 mb-3">Available Actions</h4>
                  
                  <button
                    onClick={() => setActiveAction('swap')}
                    className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left"
                  >
                    <ArrowsRightLeftIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Swap Shift</p>
                      <p className="text-sm text-blue-600">Exchange this shift with another employee's shift</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveAction('handover')}
                    className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-left"
                  >
                    <HandRaisedIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Handover Shift</p>
                      <p className="text-sm text-green-600">Transfer this shift to another employee</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveAction('sell')}
                    className="w-full flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors text-left"
                  >
                    <CurrencyDollarIcon className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-900">Sell Shift</p>
                      <p className="text-sm text-orange-600">Put this shift up for sale to other employees</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Message when actions are disabled */}
              {(pendingExchanges.length > 0 || (shift.note && shift.note.includes('[FOR SALE]'))) && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-blue-800 font-medium">
                      {pendingExchanges.length > 0 
                        ? 'Additional actions are disabled while you have pending exchange requests'
                        : 'Additional actions are disabled while this shift is for sale'
                      }
                    </p>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    {pendingExchanges.length > 0 
                      ? 'Cancel your pending requests above to enable new actions'
                      : 'Contact an administrator to remove this shift from sale'
                    }
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Back Button */}
              <button
                onClick={() => resetForm()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
              >
                ← Back to shift details
              </button>

              {/* Action Forms */}
              {activeAction === 'swap' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Swap Shift</h4>
                  <p className="text-sm text-gray-600">Choose an employee to swap shifts with. Optionally select a specific shift:</p>

                  {/* Employee Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Employee
                    </label>
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={loading}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose an employee..." />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName} ({employee.employeeNo}) - {employee.department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Shift Selection */}
                  {selectedEmployee && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Their Shift to Swap (Optional)
                      </label>
                      {loading ? (
                        <p className="text-sm text-gray-500">Loading shifts...</p>
                      ) : employeeShifts.length > 0 ? (
                        <Select value={selectedSwapShift} onValueChange={setSelectedSwapShift}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a shift..." />
                          </SelectTrigger>
                          <SelectContent>
                            {employeeShifts.map((empShift) => (
                              <SelectItem key={empShift.id} value={empShift.id}>
                                {formatTime(empShift.startTime)} - {empShift.endTime ? formatTime(empShift.endTime) : 'Open End'} 
                                ({empShift.shiftType || 'Regular'})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                          This employee has no shifts on the same date to swap with.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleSwapRequest}
                    disabled={!selectedEmployee || submitLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    {submitLoading ? 'Submitting Request...' : 'Submit Swap Request'}
                  </button>
                </div>
              )}

              {activeAction === 'handover' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Handover Shift</h4>
                  <p className="text-sm text-gray-600">Choose an employee to handover this shift to:</p>

                  {/* Employee Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Employee
                    </label>
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={loading}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose an employee..." />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName} ({employee.employeeNo}) - {employee.department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleHandoverRequest}
                    disabled={!selectedEmployee || submitLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    {submitLoading ? 'Submitting Request...' : 'Submit Handover Request'}
                  </button>
                </div>
              )}

              {activeAction === 'sell' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Sell Shift</h4>
                  <p className="text-sm text-gray-600">
                    This will mark your shift as available for sale. Other employees will be able to see and purchase this shift.
                  </p>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h5 className="font-medium text-orange-900 mb-2">Shift to be sold:</h5>
                    <p className="text-sm text-orange-800">
                      {formatDate(shift.date)} • {formatTime(shift.startTime)} - {shift.endTime ? formatTime(shift.endTime) : 'Open End'}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSellShift}
                    disabled={submitLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    {submitLoading ? 'Marking for Sale...' : 'Mark Shift for Sale'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!activeAction && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
