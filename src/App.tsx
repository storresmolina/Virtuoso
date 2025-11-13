import { useState } from 'react'
import './App.css'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { DocumentsDashboard } from './pages/DocumentsDashboard'
import { Notebooks } from './pages/Notebooks'
import { Students } from './pages/Students'
import { Settings } from './pages/Settings'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'documents':
        return <DocumentsDashboard />
      case 'notebooks':
        return <Notebooks />
      case 'students':
        return <Students />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
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
