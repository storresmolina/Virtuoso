import React, { createContext, useContext, useEffect, useState } from 'react'
import { mockAuth } from './mockAuth'
import { login as sbLogin, register as sbRegister, logout as sbLogout, getCurrentUser } from './supabaseAuth'
import { 
  createOneUseCode, 
  listCodes as sbListCodes, 
  joinClassroomByCode,
  createClassroom,
  listClassrooms as sbListClassrooms,
  getClassroomMembers,
  getTier,
  getInstructorStudents
} from '../data/supabaseApi'
import { supabase } from '../lib/supabase'

// Unified user shape for the app UI
export interface AppUser {
  id: string
  username: string // can be email for Supabase
  name?: string | null
  role?: string | null
}
type AuthUser = AppUser | null

interface AuthContextValue {
  user: AuthUser
  login: (identifier: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  register: (identifier: string, password: string, username: string, role: 'student' | 'instructor') => Promise<{ ok: boolean; error?: string }>
  joinClassroom: (code: string) => Promise<{ ok: boolean; error?: string }>
  createClassroom: (name: string, maxSize?: number) => Promise<{ ok: boolean; classroomId?: string; error?: string }>
  createCode: (classroomId: string) => Promise<{ code: string; error?: string }>
  listClassrooms: () => Promise<any[]>
  listCodes: (classroomId?: string) => Promise<any[]>
  listClassroomMembers: (classroomId: string) => Promise<any[]>
  getTierInfo: () => Promise<any>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const LS_KEY = 'virtuoso_demo_session'
const USE_SUPABASE = !!import.meta.env.VITE_SUPABASE_URL

async function fetchProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) return null
  return data
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return null
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  })

  // On mount for Supabase, attempt restoring current user
  useEffect(() => {
    if (USE_SUPABASE) {
      (async () => {
        const u = await getCurrentUser()
        if (u?.id) {
          const profile = await fetchProfile(u.id)
          setUser({ id: u.id, username: profile?.email || u.email || '', name: profile?.name, role: (profile as any)?.role })
        }
      })()
    }
  }, [])

  useEffect(() => {
    if (user) localStorage.setItem(LS_KEY, JSON.stringify(user))
    else localStorage.removeItem(LS_KEY)
  }, [user])

  const login = async (identifier: string, password: string) => {
    if (USE_SUPABASE) {
      try {
        const u = await sbLogin(identifier, password)
        if (!u?.id) return { ok: false, error: 'invalid_credentials' }
        const profile = await fetchProfile(u.id)
        setUser({ id: u.id, username: profile?.email || u.email || identifier, name: profile?.name, role: (profile as any)?.role })
        return { ok: true }
      } catch (e: any) {
        return { ok: false, error: e.message || 'login_failed' }
      }
    } else {
      const u = mockAuth.validateLogin(identifier, password)
      if (!u) return { ok: false, error: 'invalid_credentials' }
      setUser({ id: u.id, username: u.username, name: (u as any).name, role: (u as any).role })
      return { ok: true }
    }
  }

  const logout = async () => {
    if (USE_SUPABASE) {
      try { await sbLogout() } catch {}
    }
    setUser(null)
  }

  const register = async (identifier: string, password: string, username: string, role: 'student' | 'instructor') => {
    if (USE_SUPABASE) {
      try {
        const u = await sbRegister(identifier, password, role)
        if (!u?.id) return { ok: false, error: 'registration_failed' }
        // Insert profile with username and role
        const { error: profileErr } = await supabase
          .from('profiles')
          .upsert({ id: u.id, email: identifier, name: username, role })
        if (profileErr) throw profileErr
        const profile = await fetchProfile(u.id)
        setUser({ id: u.id, username: username || identifier, name: profile?.name || username, role })
        return { ok: true }
      } catch (e: any) {
        return { ok: false, error: e.message || 'registration_failed' }
      }
    } else {
      // Mock fallback
      const res = mockAuth.registerStudentWithCode(identifier, password, username, '')
      if ((res as any).error) return { ok: false, error: (res as any).error }
      const mu = (res as any).user
      setUser({ id: mu.id, username: mu.username, name: mu.name, role })
      return { ok: true }
    }
  }

  const joinClassroom = async (code: string) => {
    if (!user) return { ok: false, error: 'not_logged_in' }
    if (USE_SUPABASE) {
      try {
        await joinClassroomByCode(user.id, code)
        return { ok: true }
      } catch (e: any) {
        const msg = e.message || 'join_failed'
        if (msg === 'classroom_full') return { ok: false, error: 'This classroom is full. Instructor needs to upgrade.' }
        return { ok: false, error: msg }
      }
    } else {
      return { ok: true }
    }
  }

  const createClassroomFn = async (name: string, maxSize?: number) => {
    if (!user) return { ok: false, error: 'not_logged_in' }
    if (USE_SUPABASE) {
      try {
        const classroom = await createClassroom(user.id, name, maxSize)
        return { ok: true, classroomId: classroom.id }
      } catch (e: any) {
        return { ok: false, error: e.message || 'create_failed' }
      }
    }
    return { ok: true, classroomId: 'mock-classroom' }
  }

  const createCodeFn = async (classroomId: string) => {
    if (USE_SUPABASE) {
      try {
        const codeRow = await createOneUseCode(classroomId)
        return { code: codeRow.code }
      } catch (e: any) {
        return { code: '', error: e.message || 'failed' }
      }
    }
    return mockAuth.createOneUseCode()
  }

  const listClassroomsFn = async () => {
    if (!user) return []
    if (USE_SUPABASE) {
      try { return await sbListClassrooms(user.id) } catch { return [] }
    }
    return []
  }

  const listCodesFn = async (classroomId?: string) => {
    if (USE_SUPABASE) {
      try { return await sbListCodes(classroomId) } catch { return [] }
    }
    return mockAuth.listCodes()
  }

  const listClassroomMembersFn = async (classroomId: string) => {
    if (USE_SUPABASE) {
      try { return await getClassroomMembers(classroomId) } catch { return [] }
    }
    return []
  }

  const getTierInfoFn = async () => {
    if (!user) return null
    if (USE_SUPABASE) {
      try { return await getTier(user.id) } catch { return null }
    }
    return { id: 'free', name: 'Free', max_students: 1, ai_analysis_enabled: false, price_monthly: 0 }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      joinClassroom, 
      createClassroom: createClassroomFn,
      createCode: createCodeFn, 
      listClassrooms: listClassroomsFn,
      listCodes: listCodesFn, 
      listClassroomMembers: listClassroomMembersFn,
      getTierInfo: getTierInfoFn
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
