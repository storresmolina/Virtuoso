import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import './App.css'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Students } from './pages/Students'
import { Settings } from './pages/Settings'
import { Subscription } from './pages/Subscription'
import { StudentLayout } from './components/classroom/StudentLayout'
import { ThemeProvider } from './context/ThemeContext'
import { ViewProvider } from './context/ViewContext'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { InstructorDashboard } from './pages/InstructorDashboard'
import { StudentDashboard } from './pages/StudentDashboard'
import { Schedule } from './components/classroom/Schedule'
import { Notebooks } from './components/classroom/Notebooks'
import { DocumentsDashboard } from './components/classroom/DocumentsDashboard'
import { InstructorClassroomPage } from './pages/InstructorClassroomPage'

function InnerApp() {
  const location = useLocation()
  const { user } = useAuth()
  
  // Determine if we should show sidebar based on current route
  const hideSidebar = location.pathname.startsWith('/student/')

  return (
    <ThemeProvider>
      <div className="app-container">
        {!hideSidebar && <Sidebar />}
        <main className={`main-content ${hideSidebar ? 'full-width' : ''}`}>
          <Routes>
            {/* Dashboard route - role-aware */}
            <Route path="/" element={
              user?.role === 'instructor' ? <InstructorDashboard /> :
              user?.role === 'student' ? <StudentDashboard /> :
              <Dashboard />
            } />
            
            {/* Instructor routes */}
            <Route path="/classroom/:classroomId" element={<InstructorClassroomPage />} />
            <Route path="/students" element={<Students />} />
            <Route path="/student/:studentId" element={<StudentLayoutWrapper />} />
            
            {/* Shared routes */}
            <Route path="/schedule" element={<Schedule studentId={user?.role === 'student' ? user.id : undefined} />} />
            <Route path="/notebooks" element={<Notebooks studentId={user?.role === 'student' ? user.id : undefined} />} />
            <Route path="/documents" element={<DocumentsDashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/subscription" element={<Subscription />} />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  )
}

// Wrapper to handle student layout with URL params
function StudentLayoutWrapper() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  
  if (!studentId) return <Navigate to="/students" replace />
  
  return (
    <StudentLayout 
      studentId={studentId} 
      onBack={() => navigate('/students')} 
    />
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ViewProvider>
          <AppRoutes />
        </ViewProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  const [authView, setAuthView] = useState<'landing'|'login'|'register'|'forgot-password'|'reset-password'>('landing')

  // Check if URL has reset password token
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    if (hashParams.get('type') === 'recovery') {
      setAuthView('reset-password')
    }
  }, [])
  
  // Show reset password page even if user is logged in (for password recovery flow)
  if (authView === 'reset-password') {
    return <ResetPassword />
  }
  
  if (!user) {
    switch (authView) {
      case 'login':
        return <Login onCancel={() => setAuthView('landing')} onForgotPassword={() => setAuthView('forgot-password')} />
      case 'register':
        return <Register onCancel={() => setAuthView('landing')} />
      case 'forgot-password':
        return <ForgotPassword onBack={() => setAuthView('login')} />
      default:
        return <Landing onStart={(m) => setAuthView(m)} />
    }
  }
  
  // user is logged in -> show main app with routes
  return <InnerApp />
}

export default App
