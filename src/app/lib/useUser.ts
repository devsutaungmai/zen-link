import { useState, useEffect } from 'react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  employee?: {
    id: string
    employeeNo: string
    department: string
    departmentId: string
    employeeGroup?: string
    employeeGroupId?: string
  }
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/me')
        
        if (!response.ok) {
          if (response.status === 401) {
            setUser(null)
            setLoading(false)
            return
          }
          throw new Error('Failed to fetch user data')
        }
        
        const userData = await response.json()
        setUser(userData)
      } catch (err) {
        console.error('Error fetching user:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading, error }
}
