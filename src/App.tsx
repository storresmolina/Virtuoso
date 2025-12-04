import { useState, useEffect } from 'react'
import './App.css'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Students } from './pages/Students'
import { Settings } from './pages/Settings'
import { StudentLayout } from './components/classroom/StudentLayout'
import { ThemeProvider } from './context/ThemeContext'
import { ViewProvider, useView } from './context/ViewContext'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { InstructorDashboard } from './pages/InstructorDashboard'
import { StudentDashboard } from './pages/StudentDashboard'

function InnerApp() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const { user } = useAuth()
  const { viewingStudentId, closeStudent } = useView()

  const renderContent = () => {
    // If a student view is opened globally, render that first
    if (viewingStudentId) return <StudentLayout studentId={viewingStudentId} onBack={() => { closeStudent() }} />

    // Drive main content by activeTab so navigation (Settings, Students, etc.) always works
    switch (activeTab) {
      case 'dashboard':
        // show role-aware dashboard
        if (user?.role === 'instructor') return <InstructorDashboard />
        if (user?.role === 'student') return <StudentDashboard />
        return <Dashboard onOpenStudent={(id: string) => { setSelectedStudentId(id); setActiveTab('student'); }} />
      case 'students':
        return <Students onOpenStudent={(id: string) => { setSelectedStudentId(id); setActiveTab('student'); }} />
      case 'student':
        return selectedStudentId ? (
          <StudentLayout studentId={selectedStudentId} onBack={() => { setSelectedStudentId(null); setActiveTab('students'); }} />
        ) : (
          <Students onOpenStudent={(id: string) => { setSelectedStudentId(id); setActiveTab('student'); }} />
        )
      case 'settings':
        return <Settings />
      default:
        if (user?.role === 'instructor') return <InstructorDashboard />
        if (user?.role === 'student') return <StudentDashboard />
        return <Dashboard onOpenStudent={(id: string) => { setSelectedStudentId(id); setActiveTab('student'); }} />
    }
  }

  return (
    <ThemeProvider>
      <div className="app-container">
        {/* Hide the global Sidebar if a student view is open */}
        {!(useView().viewingStudentId) && activeTab !== 'student' && <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />}
        <main className={`main-content ${activeTab === 'student' || useView().viewingStudentId ? 'full-width' : ''}`}>
          {renderContent()}
        </main>
      </div>
    </ThemeProvider>
  )
}

function App() {
  const [view, setView] = useState<'landing'|'login'|'register'|'forgot-password'|'reset-password'>('landing')

  // Check if URL has reset password token
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    if (hashParams.get('type') === 'recovery') {
      setView('reset-password')
    }
  }, [])

  return (
    <AuthProvider>
      <ViewProvider>
        <div>
          {/* If user not logged in show landing/login/register flows */}
          <AuthProviderWrapper view={view} setView={setView} />
        </div>
      </ViewProvider>
    </AuthProvider>
  )
}

function AuthProviderWrapper({ view, setView }: { view: string; setView: (v: any) => void }) {
  const { user } = useAuth()
  
  // Show reset password page even if user is logged in (for password recovery flow)
  if (view === 'reset-password') {
    return <ResetPassword />
  }
  
  if (!user) {
    switch (view) {
      case 'login':
        return <Login onCancel={() => setView('landing')} onForgotPassword={() => setView('forgot-password')} />
      case 'register':
        return <Register onCancel={() => setView('landing')} />
      case 'forgot-password':
        return <ForgotPassword onBack={() => setView('login')} />
      default:
        return <Landing onStart={(m) => setView(m)} />
    }
  }
  // user is logged in -> show main app
  return <InnerApp />
}

export default App
