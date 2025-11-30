import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export const InstructorDashboard: React.FC = () => {
  const { user, listClassrooms, createClassroom, listClassroomMembers, getTierInfo } = useAuth()
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const [tier, setTier] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newClassroomName, setNewClassroomName] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const [cls, t] = await Promise.all([listClassrooms(), getTierInfo()])
      setClassrooms(cls)
      setTier(t)
      if (cls.length > 0) {
        setSelectedClassroom(cls[0].id)
        const m = await listClassroomMembers(cls[0].id)
        setMembers(m)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateClassroom() {
    if (!newClassroomName.trim()) return
    const r = await createClassroom(newClassroomName.trim())
    if (r.ok) {
      setNewClassroomName('')
      await load()
    }
  }

  async function selectClassroom(id: string) {
    setSelectedClassroom(id)
    const m = await listClassroomMembers(id)
    setMembers(m)
  }

  if (loading) return <div style={{padding:24}}>Loading...</div>

  const currentClassroom = classrooms.find(c => c.id === selectedClassroom)

  return (
    <div style={{padding:24}}>
      <h2>Instructor Dashboard</h2>
      <p>Welcome, {user?.name || user?.username}</p>
      
      {tier && (
        <div style={{marginTop:16,padding:12,background:'var(--bg-secondary)',borderRadius:8}}>
          <strong>Your Plan:</strong> {tier.name} 
          {tier.max_students !== null && <span> (max {tier.max_students} {tier.max_students === 1 ? 'student' : 'students'} per classroom)</span>}
          {tier.ai_analysis_enabled && <span> • AI Analysis Enabled ✨</span>}
        </div>
      )}

      <section style={{marginTop:24}}>
        <h3>Classrooms</h3>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <input 
            placeholder="New classroom name" 
            value={newClassroomName} 
            onChange={e => setNewClassroomName(e.target.value)}
            style={{flex:1}}
          />
          <button className="primary-btn" onClick={handleCreateClassroom}>Create Classroom</button>
        </div>
        <div style={{marginTop:12,display:'flex',gap:8,flexWrap:'wrap'}}>
          {classrooms.map(c => (
            <button 
              key={c.id}
              className={selectedClassroom === c.id ? 'primary-btn' : 'btn-secondary'}
              onClick={() => selectClassroom(c.id)}
            >
              {c.name} ({c.member_count || 0})
            </button>
          ))}
        </div>
      </section>

      {currentClassroom && (
        <section style={{marginTop:24}}>
          <h3>Members in "{currentClassroom.name}"</h3>
          {members.length === 0 ? (
            <p style={{color:'var(--text-secondary)'}}>No students yet. Share a classroom code from Settings.</p>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse',marginTop:8}}>
              <thead>
                <tr style={{textAlign:'left',borderBottom:'1px solid var(--border-color)'}}>
                  <th style={{padding:'8px'}}>Email</th>
                  <th style={{padding:'8px'}}>Name</th>
                  <th style={{padding:'8px'}}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m: any) => (
                  <tr key={m.id} style={{borderBottom:'1px solid var(--border-color)'}}>
                    <td style={{padding:'8px'}}>{m.email || '-'}</td>
                    <td style={{padding:'8px'}}>{m.name || '-'}</td>
                    <td style={{padding:'8px',fontSize:12,opacity:0.8}}>
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  )
}
