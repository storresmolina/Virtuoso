import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { JoinClassroom } from '../components/classroom/JoinClassroom'
import { supabase } from '../lib/supabase'

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth()
  const [hasClassroom, setHasClassroom] = useState<boolean | null>(null)
  const USE_SUPABASE = !!import.meta.env.VITE_SUPABASE_URL

  useEffect(() => {
    if (!user || !USE_SUPABASE) {
      setHasClassroom(true) // mock mode: always show content
      return
    }
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('classroom_code')
        .eq('id', user.id)
        .single()
      setHasClassroom(!!data?.classroom_code)
    })()
  }, [user, USE_SUPABASE])

  if (hasClassroom === null) {
    return <div style={{padding:24}}>Loading...</div>
  }

  if (!hasClassroom) {
    return <JoinClassroom />
  }

  return (
    <div style={{padding:24}}>
      <h2>Student Dashboard</h2>
      <p>Welcome, {user?.name || user?.username}. Your id: <code>{user?.id}</code></p>
      <p>You're enrolled in a classroom. Content from your instructor will appear here.</p>
    </div>
  )
}
