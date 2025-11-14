import { useState } from 'react'
import './App.css'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Students } from './pages/Students'
import { Settings } from './pages/Settings'
import { StudentPage } from './pages/StudentPage'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onOpenStudent={(id: string) => { setSelectedStudentId(id); setActiveTab('student'); }} />
      case 'students':
        return <Students onOpenStudent={(id: string) => { setSelectedStudentId(id); setActiveTab('student'); }} />
      case 'student':
        return selectedStudentId ? (
          <StudentPage studentId={selectedStudentId} onBack={() => { setSelectedStudentId(null); setActiveTab('students'); }} />
        ) : (
          <Students onOpenStudent={(id: string) => { setSelectedStudentId(id); setActiveTab('student'); }} />
        )
      case 'settings':
        return <Settings />
      default:
        return <Dashboard onOpenStudent={(id: string) => { setSelectedStudentId(id); setActiveTab('student'); }} />
    }
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
