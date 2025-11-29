import React from 'react'
import { useAuth } from '../auth/AuthContext'

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth()
  return (
    <div style={{padding:24}}>
      <h2>Student Dashboard</h2>
      <p>Welcome, {user?.name || user?.username}. Your id: <code>{user?.id}</code></p>
      <p>Only classes assigned by instructor codes will be visible in a real backend.</p>
    </div>
  )
}
