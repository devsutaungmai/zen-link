export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  position?: string
  phone?: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export interface Shift {
  id: string
  date: string
  startTime: string
  endTime: string | null
  shiftType: 'NORMAL' | 'OVERTIME' | 'HOLIDAY' | 'TRAINING'
  wage: number
  wageType: 'HOURLY' | 'FLAT'
  approved: boolean
  employeeId: string
  employeeGroupId?: string
  note?: string
  employeeGroup?: {
    id: string
    name: string
  }
}

export interface EmployeeGroup {
  id: string
  name: string
  employees?: Employee[]
}