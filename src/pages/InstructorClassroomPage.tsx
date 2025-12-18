import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { PracticeSession, PracticeComment } from '../data/supabaseApi'
import { 
  getPracticeSessions, 
  createPracticeSession, 
  addPracticeComment, 
  getPracticeComments, 
  uploadFile
} from '../data/supabaseApi'

interface PracticeUpload extends PracticeSession {
  comments?: PracticeComment[]
  newComment?: string
}

export const InstructorClassroomPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>()
  const navigate = useNavigate()
  const { user, listClassrooms } = useAuth()
  const [classroom, setClassroom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadingPractice, setLoadingPractice] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'practice'|'schedule'|'notebooks'|'files'>('practice')
  const [uploads, setUploads] = useState<PracticeUpload[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    load()
  }, [classroomId])

  useEffect(() => {
    if (activeTab === 'practice' && user && classroomId) {
      loadPracticeSessions()
    }
  }, [activeTab, user, classroomId])

  async function load() {
    setLoading(true)
    try {
      const classrooms = await listClassrooms()
      const found = classrooms.find((c: any) => c.id === classroomId)
      if (found) {
        setClassroom(found)
      } else {
        navigate('/', { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  async function loadPracticeSessions() {
    if (!classroomId || !user) return
    
    try {
      setLoadingPractice(true)
      const sessions = await getPracticeSessions(classroomId)
      
      // Load comments for each session
      const withComments = await Promise.all(
        sessions.map(async (session) => {
          const comments = await getPracticeComments(session.id)
          return { ...session, comments }
        })
      )
      
      setUploads(withComments)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load practice sessions')
    } finally {
      setLoadingPractice(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !classroomId || !classroom) return

    try {
      setIsSaving(true)
      
      // 1. Upload audio file to Storage (private bucket)
      const { path } = await uploadFile(
        'practice-sessions',
        `${classroomId}/${user.id}/${Date.now()}-${file.name}`,
        file
      )

      // 2. Create practice session record in database (store path only)
      // Need to get student_id and instructor_id from classroom context
      const newSession = await createPracticeSession(
        classroomId,
        user.id,  // student_id (instructor uploading for demonstration)
        classroom.instructor_id,  // instructor_id
        {
          file_name: file.name,
          file_size_mb: Math.round(file.size / 1024 / 1024 * 100) / 100,
          file_url: path,  // Store storage path
          upload_date: new Date().toISOString(),
          ai_processing_status: 'pending'
        }
      )

      setUploads(prev => [...prev, { ...newSession, comments: [], newComment: '' }])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload practice session')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddComment = async (sessionId: string, comment: string) => {
    if (!user || !comment.trim()) return

    try {
      setIsSaving(true)
      
      await addPracticeComment(
        sessionId,
        user.id,  // author_id
        comment
      )

      // Reload comments for this session
      const updated = uploads.map(async (u) => {
        if (u.id === sessionId) {
          const comments = await getPracticeComments(sessionId)
          return { ...u, comments, newComment: '' }
        }
        return u
      })
      
      setUploads(await Promise.all(updated))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'practice', label: 'Practice Sessions', icon: '🎧' },
    { id: 'schedule', label: 'Schedule', icon: '📅' },
    { id: 'notebooks', label: 'Notebooks', icon: '📓' },
    { id: 'files', label: 'Sheet Music & Files', icon: '📄' }
  ]

  if (loading) return <div style={{padding:24}}>Loading classroom...</div>

  if (!classroom) {
    return (
      <div style={{padding:24}}>
        <button className="btn-secondary" onClick={() => navigate('/')} style={{marginBottom:12}}>← Back to dashboard</button>
        <div style={{color:'var(--text-secondary)'}}>Classroom not found.</div>
      </div>
    )
  }

  return (
    <div style={{padding:24,maxWidth:1200,margin:'0 auto'}}>
      <div style={{
        background:'var(--bg-secondary)',
        borderRadius:16,
        border:'1px solid var(--border-color)',
        boxShadow:'0 8px 16px rgba(0,0,0,0.08)',
        padding:20,
        marginBottom:32
      }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div>
            <button className="btn-secondary" onClick={() => navigate('/')} style={{marginBottom:10}}>
              ← Back to dashboard
            </button>
            <div style={{fontSize:'0.9rem',color:'var(--text-secondary)'}}>Classroom</div>
            <h3 style={{margin:'4px 0',fontSize:'1.6rem',fontFamily:'var(--font-title)',fontStyle:'italic'}}>
              {classroom.name}
            </h3>
            {classroom.description && (
              <p style={{margin:'4px 0 0',color:'var(--text-secondary)'}}>{classroom.description}</p>
            )}
          </div>
        </div>

        <div style={{display:'flex',borderBottom:'1px solid var(--border-color)',padding:'8px 12px',gap:8,overflowX:'auto'}}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={activeTab === t.id ? 'primary-btn' : 'btn-secondary'}
              onClick={() => setActiveTab(t.id as any)}
              style={{padding:'8px 12px', whiteSpace:'nowrap'}}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            marginTop: '16px',
            backgroundColor: '#fee',
            border: '1px solid #f99',
            borderRadius: '4px',
            color: '#c33'
          }}>
            {error}
          </div>
        )}

        <div style={{padding:20}}>
          {activeTab === 'practice' && (
            <div style={{display:'grid',gap:16}}>
              <div style={{
                padding:16,
                border:'1px dashed var(--border-color)',
                borderRadius:12,
                background:'var(--bg-primary)',
                display:'flex',
                alignItems:'center',
                justifyContent:'space-between',
                gap:12,
                flexWrap:'wrap'
              }}>
                <div>
                  <div style={{fontWeight:600}}>Upload practice session (.mp3)</div>
                  <div style={{fontSize:'0.9rem',color:'var(--text-secondary)'}}>
                    Students upload, instructors can listen and comment. AI breakdown will appear after upload.
                  </div>
                </div>
                <label className="primary-btn" style={{cursor:'pointer',padding:'10px 14px',opacity: isSaving ? 0.5 : 1}}>
                  {isSaving ? '⏳ Uploading...' : 'Upload'}
                  <input type="file" accept="audio/mpeg" style={{display:'none'}} onChange={handleUpload} disabled={isSaving} />
                </label>
              </div>

              {loadingPractice ? (
                <div style={{color:'var(--text-secondary)',fontSize:'0.95rem'}}>Loading practice sessions...</div>
              ) : (
              <div style={{display:'grid',gap:12}}>
                {uploads.length === 0 && (
                  <div style={{color:'var(--text-secondary)',fontSize:'0.95rem'}}>No practice sessions yet.</div>
                )}
                {uploads.map(u => (
                  <div key={u.id} style={{
                    border:'1px solid var(--border-color)',
                    borderRadius:12,
                    padding:12,
                    background:'var(--bg-primary)'
                  }}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <div style={{fontWeight:600}}>{u.file_name}</div>
                      <span style={{fontSize:'0.85rem',color: u.ai_processing_status === 'ready' ? 'var(--accent-primary)' : 'var(--text-secondary)'}}>
                        {u.ai_processing_status === 'ready' ? 'Ready' : 'Processing...'}
                      </span>
                    </div>
                    <div style={{fontSize:'0.9rem',color:'var(--text-secondary)',marginBottom:8}}>
                      Uploaded on {new Date(u.upload_date).toLocaleDateString()}
                    </div>
                    
                    <div style={{
                      border:'1px solid var(--border-color)',
                      borderRadius:8,
                      padding:10,
                      background:'var(--bg-secondary)',
                      marginBottom:12
                    }}>
                      <div style={{fontWeight:600,marginBottom:4}}>Comments</div>
                      <div style={{display:'grid',gap:8}}>
                        {u.comments && u.comments.length > 0 ? (
                          u.comments.map((c, idx) => (
                            <div key={idx} style={{fontSize:'0.9rem',padding:8,background:'var(--bg-primary)',borderRadius:4}}>
                              <div style={{fontWeight:500,marginBottom:2}}>{c.author_id}</div>
                              <div>{c.comment}</div>
                              <div style={{fontSize:'0.8rem',color:'var(--text-secondary)',marginTop:4}}>
                                {new Date(c.created_at).toLocaleString()}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{fontSize:'0.9rem',color:'var(--text-secondary)'}}>No comments yet.</div>
                        )}
                      </div>

                      <div style={{marginTop:10,display:'flex',gap:8}}>
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={u.newComment || ''}
                          onChange={(e) => setUploads(prev => prev.map(up => up.id === u.id ? { ...up, newComment: e.target.value } : up))}
                          style={{
                            flex:1,
                            padding:'8px',
                            border:'1px solid var(--border-color)',
                            borderRadius:'4px',
                            background:'var(--bg-primary)',
                            color:'var(--text-primary)',
                            fontSize:'0.9rem'
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(u.id, u.newComment || '')}
                          disabled={!u.newComment || isSaving}
                          style={{
                            padding:'8px 12px',
                            background:'var(--accent-primary)',
                            color:'white',
                            border:'none',
                            borderRadius:'4px',
                            cursor: (!u.newComment || isSaving) ? 'not-allowed' : 'pointer',
                            opacity: (!u.newComment || isSaving) ? 0.5 : 1
                          }}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div style={{color:'var(--text-secondary)'}}>
              Schedule view placeholder (reuse Schedule component in future).
            </div>
          )}

          {activeTab === 'notebooks' && (
            <div style={{color:'var(--text-secondary)'}}>
              Notebooks view placeholder (reuse Notebooks component in future).
            </div>
          )}

          {activeTab === 'files' && (
            <div style={{color:'var(--text-secondary)'}}>
              Sheet Music & Files placeholder (reuse DocumentsDashboard component in future).
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
