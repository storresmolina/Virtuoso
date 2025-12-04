import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { JoinClassroom } from '../components/classroom/JoinClassroom'
import { Schedule } from '../components/classroom/Schedule'
import { Notebooks } from '../components/classroom/Notebooks'
import { DocumentsDashboard } from '../components/classroom/DocumentsDashboard'
import { supabase } from '../lib/supabase'

type TabType = 'practice' | 'schedule' | 'notebooks' | 'documents'

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth()
  const [hasClassroom, setHasClassroom] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('practice')
  const [documents, setDocuments] = useState<any[]>([])
  const [practiceSessions, setPracticeSessions] = useState<any[]>([])
  const USE_SUPABASE = !!import.meta.env.VITE_SUPABASE_URL

  useEffect(() => {
    if (!user || !USE_SUPABASE) {
      setHasClassroom(true)
      return
    }
    (async () => {
      // Check if student is member of any classroom
      const { data } = await supabase
        .from('classroom_members')
        .select('classroom_id')
        .eq('user_id', user.id)
        .limit(1)
      setHasClassroom(!!data && data.length > 0)
    })()
  }, [user, USE_SUPABASE])

  if (hasClassroom === null) {
    return <div style={{padding:24}}>Loading...</div>
  }

  if (!hasClassroom) {
    return <JoinClassroom />
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'practice':
        return <PracticeSessionsTab documents={documents} sessions={practiceSessions} setSessions={setPracticeSessions} />
      case 'schedule':
        return <Schedule studentId={user?.id} availableDocuments={documents} />
      case 'notebooks':
        return <Notebooks studentId={user?.id} availableDocuments={documents} />
      case 'documents':
        return <DocumentsDashboard studentId={user?.id} onDocumentsChange={setDocuments} />
      default:
        return null
    }
  }

  return (
    <div style={{padding:24}}>
      <h2>Student Dashboard</h2>
      <p style={{marginBottom:24,color:'var(--text-secondary)'}}>Welcome, {user?.name || user?.username}</p>
      
      {/* Tab Navigation */}
      <div style={{display:'flex',gap:8,marginBottom:24,borderBottom:'1px solid var(--border-color)',paddingBottom:8}}>
        <button 
          className={activeTab === 'practice' ? 'primary-btn' : 'btn-secondary'}
          onClick={() => setActiveTab('practice')}
        >
          Practice Sessions
        </button>
        <button 
          className={activeTab === 'schedule' ? 'primary-btn' : 'btn-secondary'}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </button>
        <button 
          className={activeTab === 'notebooks' ? 'primary-btn' : 'btn-secondary'}
          onClick={() => setActiveTab('notebooks')}
        >
          Notebooks
        </button>
        <button 
          className={activeTab === 'documents' ? 'primary-btn' : 'btn-secondary'}
          onClick={() => setActiveTab('documents')}
        >
          Sheet Music & Files
        </button>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}

// Practice Sessions Tab Component
const PracticeSessionsTab: React.FC<{ documents: any[]; sessions: any[]; setSessions: (s: any[]) => void }> = ({ documents, sessions, setSessions }) => {
  const { user } = useAuth()
  const [selectedDocument, setSelectedDocument] = useState<string>('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!selectedDocument || !audioFile) {
      alert('Please select a sheet music and upload an audio recording')
      return
    }
    setUploading(true)
    // TODO: Upload to Supabase Storage and create practice_sessions record
    const newSession = {
      id: Date.now().toString(),
      student_id: user?.id,
      document_id: selectedDocument,
      audio_url: URL.createObjectURL(audioFile), // temporary preview
      notes,
      created_at: new Date().toISOString(),
      status: 'pending_review'
    }
    setSessions([...sessions, newSession])
    setSelectedDocument('')
    setAudioFile(null)
    setNotes('')
    setUploading(false)
    alert('Practice session uploaded! Your instructor will review it soon.')
  }

  return (
    <div>
      <h3>Upload Practice Session</h3>
      <div style={{background:'var(--bg-secondary)',padding:16,borderRadius:8,marginBottom:24}}>
        <div style={{marginBottom:12}}>
          <label style={{display:'block',marginBottom:4,fontWeight:500}}>Select Sheet Music</label>
          <select 
            value={selectedDocument} 
            onChange={e => setSelectedDocument(e.target.value)}
            style={{width:'100%',padding:8}}
          >
            <option value="">-- Choose a piece --</option>
            {documents.filter(d => d.visible !== false).map(doc => (
              <option key={doc.id} value={doc.id}>{doc.title || doc.name}</option>
            ))}
          </select>
        </div>

        <div style={{marginBottom:12}}>
          <label style={{display:'block',marginBottom:4,fontWeight:500}}>Upload Audio Recording</label>
          <input 
            type="file" 
            accept="audio/*"
            onChange={handleAudioChange}
            style={{width:'100%'}}
          />
          {audioFile && <p style={{fontSize:12,color:'var(--text-secondary)',marginTop:4}}>Selected: {audioFile.name}</p>}
        </div>

        <div style={{marginBottom:12}}>
          <label style={{display:'block',marginBottom:4,fontWeight:500}}>Notes (optional)</label>
          <textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any notes about this practice session..."
            rows={3}
            style={{width:'100%',padding:8}}
          />
        </div>

        <button 
          className="primary-btn" 
          onClick={handleSubmit}
          disabled={uploading || !selectedDocument || !audioFile}
        >
          {uploading ? 'Uploading...' : 'Submit Practice Session'}
        </button>
      </div>

      <h3>My Practice Sessions</h3>
      {sessions.length === 0 ? (
        <p style={{color:'var(--text-secondary)'}}>No practice sessions yet. Upload your first recording above!</p>
      ) : (
        <div style={{display:'grid',gap:12}}>
          {sessions.map(session => (
            <div key={session.id} style={{border:'1px solid var(--border-color)',padding:12,borderRadius:8}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:8}}>
                <div>
                  <strong>{documents.find(d => d.id === session.document_id)?.title || 'Unknown Piece'}</strong>
                  <p style={{fontSize:12,color:'var(--text-secondary)',marginTop:4}}>
                    {new Date(session.created_at).toLocaleDateString()} at {new Date(session.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <span style={{
                  padding:'4px 8px',
                  borderRadius:4,
                  fontSize:12,
                  background: session.status === 'reviewed' ? '#e8f5e9' : '#fff3e0',
                  color: session.status === 'reviewed' ? '#2e7d32' : '#e65100'
                }}>
                  {session.status === 'reviewed' ? '✓ Reviewed' : '⏳ Pending Review'}
                </span>
              </div>
              {session.notes && <p style={{fontSize:14,marginBottom:8}}>{session.notes}</p>}
              <audio controls src={session.audio_url} style={{width:'100%',marginTop:8}} />
              {session.feedback && (
                <div style={{marginTop:12,padding:12,background:'#f5f5f5',borderRadius:4}}>
                  <strong>Instructor Feedback:</strong>
                  <p style={{marginTop:4}}>{session.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
