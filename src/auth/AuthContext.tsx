import React, { createContext, useContext, useEffect, useState } from 'react'
import { mockAuth } from './mockAuth'
import type { UserRecord } from './mockAuth'

type AuthUser = UserRecord | null

interface AuthContextValue {
  user: AuthUser
  login: (username: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
  registerStudent: (username: string, password: string, name: string, code: string) => { ok: boolean; error?: string }
  createCode: () => { code: string }
  listCodes: () => any[]
  listStudents: () => any[]
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const LS_KEY = 'virtuoso_demo_session'

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

  useEffect(() => {
    if (user) localStorage.setItem(LS_KEY, JSON.stringify(user))
    else localStorage.removeItem(LS_KEY)
  }, [user])

  const login = (username: string, password: string) => {
    const u = mockAuth.validateLogin(username, password)
    if (!u) return { ok: false, error: 'invalid_credentials' }
    setUser(u)
    return { ok: true }
  }

  const logout = () => setUser(null)

  const registerStudent = (username: string, password: string, name: string, code: string) => {
    const res = mockAuth.registerStudentWithCode(username, password, name, code)
    if ((res as any).error) return { ok: false, error: (res as any).error }
    setUser((res as any).user)
    return { ok: true }
  }

  const createCode = () => mockAuth.createOneUseCode()
  const listCodes = () => mockAuth.listCodes()
  const listStudents = () => mockAuth.listStudents()

  return (
    <AuthContext.Provider value={{ user, login, logout, registerStudent, createCode, listCodes, listStudents }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
