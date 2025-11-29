import React, { createContext, useContext, useState } from 'react'

interface ViewContextValue {
  viewingStudentId: string | null
  openStudent: (id: string) => void
  closeStudent: () => void
}

const ViewContext = createContext<ViewContextValue | undefined>(undefined)

export const ViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null)
  const openStudent = (id: string) => setViewingStudentId(id)
  const closeStudent = () => setViewingStudentId(null)
  return (
    <ViewContext.Provider value={{ viewingStudentId, openStudent, closeStudent }}>
      {children}
    </ViewContext.Provider>
  )
}

export function useView() {
  const ctx = useContext(ViewContext)
  if (!ctx) throw new Error('useView must be used within ViewProvider')
  return ctx
}
