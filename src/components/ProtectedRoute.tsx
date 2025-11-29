import React from 'react'
import { useAuth } from '../auth/AuthContext'

interface Props {
  requiredRole?: 'instructor' | 'student'
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<Props> = ({ requiredRole, children }) => {
  const { user } = useAuth()
  if (!user) return <div style={{padding:24}}>You must be logged in to view this content.</div>
  if (requiredRole && user.role !== requiredRole) return <div style={{padding:24}}>You do not have access to this page.</div>
  return <>{children}</>
}
