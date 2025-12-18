import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { CreateClassroomModal } from '../components/shared/CreateClassroomModal'

export const InstructorDashboard: React.FC = () => {
  const { user, listClassrooms, createClassroom, editClassroom, removeClassroom, getTierInfo } = useAuth()
  const navigate = useNavigate()
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [tier, setTier] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingClassroom, setEditingClassroom] = useState<any | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const [cls, t] = await Promise.all([listClassrooms(), getTierInfo()])
      setClassrooms(cls)
      setTier(t)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateClassroom(name: string, maxSize: number) {
    const r = await createClassroom(name, maxSize)
    if (r.ok) {
      await load()
    } else {
      throw new Error(r.error || 'Failed to create classroom')
    }
  }

  async function handleEditClassroom(id: string, fields: { name?: string; description?: string | null; maxSize?: number | null }) {
    const r = await editClassroom(id, fields)
    if (r.ok) {
      await load()
    } else {
      throw new Error(r.error || 'Failed to update classroom')
    }
  }

  async function handleDeleteClassroom(id: string) {
    const r = await removeClassroom(id)
    if (r.ok) {
      await load()
    } else {
      throw new Error(r.error || 'Failed to delete classroom')
    }
  }

  if (loading) return <div style={{padding:24}}>Loading...</div>

  return (
    <div style={{padding:24,maxWidth:1200,margin:'0 auto'}}>
      <div style={{marginBottom:32}}>
        <h2 style={{
          fontSize:'2rem',
          fontFamily:'var(--font-title)',
          fontStyle:'italic',
          marginBottom:8
        }}>
          Instructor Dashboard
        </h2>
        <p style={{color:'var(--text-secondary)',fontSize:'1rem'}}>
          Welcome, {user?.name || user?.username}
        </p>
      </div>

      {tier && (
        <div style={{
          marginBottom:32,
          padding:16,
          background:'var(--bg-secondary)',
          borderRadius:12,
          border:'1px solid var(--border-color)'
        }}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
            <div>
              <strong style={{fontSize:'1.1rem',color:'var(--text-primary)'}}>
                {tier.name} Plan
              </strong>
              {tier.max_students !== null && (
                <span style={{marginLeft:12,color:'var(--text-secondary)',fontSize:'0.95rem'}}>
                  • Max {tier.max_students} {tier.max_students === 1 ? 'student' : 'students'} per classroom
                </span>
              )}
              {tier.ai_analysis_enabled && (
                <span style={{marginLeft:12,color:'var(--accent-primary)',fontSize:'0.95rem'}}>
                  • AI Analysis ✨
                </span>
              )}
            </div>
            {tier.name === 'Free' && (
              <button 
                className="primary-btn"
                style={{padding:'8px 16px'}}
                onClick={() => navigate('/subscription')}
              >
                Upgrade to Premium
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{marginBottom:24,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3 style={{fontSize:'1.5rem',fontFamily:'var(--font-title)',fontStyle:'italic'}}>
          My Classrooms
        </h3>
        <button 
          className="primary-btn" 
          onClick={() => setShowCreateModal(true)}
          style={{padding:'10px 20px',fontSize:'1rem'}}
        >
          + Create Classroom
        </button>
      </div>

      {classrooms.length === 0 ? (
        <div style={{
          textAlign:'center',
          padding:'48px 24px',
          background:'var(--bg-secondary)',
          borderRadius:12,
          border:'1px solid var(--border-color)'
        }}>
          <div style={{fontSize:'3rem',marginBottom:16}}>🎓</div>
          <h4 style={{fontSize:'1.25rem',marginBottom:8,color:'var(--text-primary)'}}>
            No Classrooms Yet
          </h4>
          <p style={{color:'var(--text-secondary)',marginBottom:24,fontSize:'0.95rem'}}>
            Create your first classroom to start teaching students
          </p>
          <button 
            className="primary-btn"
            onClick={() => setShowCreateModal(true)}
            style={{padding:'10px 24px'}}
          >
            Create Your First Classroom
          </button>
        </div>
      ) : (
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))',
          gap:20
        }}>
          {classrooms.map(classroom => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              onViewDetails={() => navigate(`/classroom/${classroom.id}`)}
              onEdit={() => setEditingClassroom(classroom)}
              onDelete={() => setConfirmDeleteId(classroom.id)}
            />
          ))}
        </div>
      )}
      
      {showCreateModal && (
        <CreateClassroomModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateClassroom}
          maxStudentsAllowed={tier?.max_students ?? null}
        />
      )}

      {editingClassroom && (
        <EditClassroomModal
          classroom={editingClassroom}
          maxStudentsAllowed={tier?.max_students ?? null}
          onClose={() => setEditingClassroom(null)}
          onSave={(fields) => handleEditClassroom(editingClassroom.id, fields)}
        />
      )}

      {confirmDeleteId && (
        <ConfirmDeleteModal
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={async () => {
            await handleDeleteClassroom(confirmDeleteId)
            setConfirmDeleteId(null)
          }}
        />
      )}
    </div>
  )
}

interface ClassroomCardProps {
  classroom: any
  onViewDetails: () => void
  onEdit: () => void
  onDelete: () => void
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({ classroom, onViewDetails, onEdit, onDelete }) => {
  const memberCount = classroom.member_count || 0
  const maxSize = classroom.max_size
  const isPrivate = maxSize === 1
  const [menuOpen, setMenuOpen] = React.useState(false)
  
  return (
    <div style={{
      background:'var(--bg-secondary)',
      borderRadius:12,
      border:'1px solid var(--border-color)',
      padding:20,
      transition:'all 0.3s ease',
      cursor:'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)'
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'none'
    }}
    onClick={onViewDetails}
    >
      <div style={{display:'flex',alignItems:'start',justifyContent:'space-between',marginBottom:16, position:'relative'}}>
        <div style={{flex:1}}>
          <h4 style={{
            fontSize:'1.25rem',
            fontFamily:'var(--font-title)',
            fontStyle:'italic',
            marginBottom:4,
            color:'var(--text-primary)'
          }}>
            {isPrivate ? '🎵 Private Instruction' : classroom.name}
          </h4>
          {!isPrivate && (
            <p style={{
              fontSize:'0.85rem',
              color:'var(--text-secondary)',
              margin:0
            }}>
              Created {new Date(classroom.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
        <div style={{position:'relative'}} onClick={(e) => e.stopPropagation()}>
          <button
            className="btn-secondary"
            style={{padding:'6px 10px', fontSize:'1rem'}}
            onClick={() => setMenuOpen(o => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            ⋯
          </button>
          {menuOpen && (
            <div
              role="menu"
              style={{
                position:'absolute',
                top:'110%',
                right:0,
                background:'var(--bg-primary)',
                border:'1px solid var(--border-color)',
                borderRadius:8,
                boxShadow:'0 8px 16px rgba(0,0,0,0.15)',
                minWidth:160,
                zIndex:5,
                padding:6
              }}
            >
              <button
                role="menuitem"
                className="nav-button"
                style={{width:'100%', textAlign:'left', padding:'8px 10px'}}
                onClick={() => { setMenuOpen(false); onEdit(); }}
              >
                ✏️ Edit classroom
              </button>
              <button
                role="menuitem"
                className="nav-button"
                style={{width:'100%', textAlign:'left', padding:'8px 10px'}}
                onClick={() => { setMenuOpen(false); onDelete(); }}
              >
                🗑️ Delete classroom
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{
        display:'flex',
        alignItems:'center',
        gap:8,
        padding:'12px 16px',
        background:'var(--bg-primary)',
        borderRadius:8,
        marginBottom:12
      }}>
        <span style={{fontSize:'1.5rem'}}>👥</span>
        <div style={{flex:1}}>
          <div style={{fontSize:'0.85rem',color:'var(--text-secondary)'}}>Students</div>
          <div style={{fontSize:'1.25rem',fontWeight:600,color:'var(--text-primary)'}}>
            {memberCount}
            {maxSize && <span style={{fontSize:'0.9rem',fontWeight:400,color:'var(--text-secondary)'}}> / {maxSize}</span>}
          </div>
        </div>
      </div>

      {maxSize && memberCount >= maxSize && (
        <div style={{
          fontSize:'0.85rem',
          color:'#e53e3e',
          padding:8,
          background:'rgba(229,62,62,0.1)',
          borderRadius:6,
          marginBottom:12,
          textAlign:'center'
        }}>
          ⚠️ Classroom Full
        </div>
      )}

      <button 
        className="btn-secondary"
        style={{width:'100%',padding:'10px',fontSize:'0.95rem'}}
        onClick={(e) => {
          e.stopPropagation()
          onViewDetails()
        }}
      >
        Open Classroom
      </button>
    </div>
  )
}

interface EditClassroomModalProps {
  classroom: any
  maxStudentsAllowed: number | null
  onClose: () => void
  onSave: (fields: { name?: string; description?: string | null; maxSize?: number | null }) => Promise<void>
}

const EditClassroomModal: React.FC<EditClassroomModalProps> = ({ classroom, maxStudentsAllowed, onClose, onSave }) => {
  const [name, setName] = useState(classroom.name || '')
  const [description, setDescription] = useState(classroom.description || '')
  const [maxSize, setMaxSize] = useState<number | null>(classroom.max_size ?? maxStudentsAllowed ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await onSave({ name: name.trim(), description: description.trim() || null, maxSize })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update classroom')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position:'fixed',top:0,left:0,right:0,bottom:0,
      background:'rgba(0,0,0,0.5)',
      display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000
    }}>
      <div style={{
        background:'var(--bg-secondary)',
        borderRadius:16,
        border:'1px solid var(--border-color)',
        boxShadow:'0 8px 24px rgba(0,0,0,0.15)',
        padding:32,
        width:'90%',
        maxWidth:520
      }}>
        <h3 style={{
          fontSize:'1.5rem',
          fontFamily:'var(--font-title)',
          fontStyle:'italic',
          marginBottom:8
        }}>Edit Classroom</h3>
        <p style={{color:'var(--text-secondary)',marginBottom:24}}>
          Update classroom details
        </p>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div>
            <label style={{display:'block',marginBottom:6,fontWeight:500}}>Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid var(--border-color)',background:'var(--bg-primary)',color:'var(--text-primary)'}}
            />
          </div>
          <div>
            <label style={{display:'block',marginBottom:6,fontWeight:500}}>Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid var(--border-color)',background:'var(--bg-primary)',color:'var(--text-primary)',resize:'vertical'}}
            />
          </div>
          <div>
            <label style={{display:'block',marginBottom:6,fontWeight:500}}>Maximum students</label>
            <input
              type="number"
              min={1}
              max={maxStudentsAllowed || undefined}
              value={maxSize ?? ''}
              onChange={e => setMaxSize(e.target.value === '' ? null : Math.max(1, parseInt(e.target.value) || 1))}
              style={{width:'120px',padding:'10px 12px',borderRadius:8,border:'1px solid var(--border-color)',background:'var(--bg-primary)',color:'var(--text-primary)'}}
            />
            {maxStudentsAllowed !== null && (
              <p style={{fontSize:'0.85rem',color:'var(--text-secondary)',marginTop:6}}>
                Plan limit: {maxStudentsAllowed} per classroom
              </p>
            )}
          </div>

          {error && (
            <div style={{color:'#e53e3e',background:'rgba(229,62,62,0.1)',border:'1px solid rgba(229,62,62,0.3)',padding:12,borderRadius:8}}>
              {error}
            </div>
          )}

          <div style={{display:'flex',gap:12}}>
            <button className="primary-btn" type="submit" disabled={loading} style={{flex:1,padding:'12px',fontSize:'1rem'}}>
              {loading ? 'Saving...' : 'Save changes'}
            </button>
            <button className="btn-secondary" type="button" onClick={onClose} style={{flex:1,padding:'12px',fontSize:'1rem'}}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface ConfirmDeleteModalProps {
  onCancel: () => void
  onConfirm: () => Promise<void>
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onCancel, onConfirm }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      await onConfirm()
    } catch (e: any) {
      setError(e.message || 'Failed to delete classroom')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position:'fixed',top:0,left:0,right:0,bottom:0,
      background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000
    }}>
      <div style={{
        background:'var(--bg-secondary)',
        borderRadius:16,
        border:'1px solid var(--border-color)',
        boxShadow:'0 8px 24px rgba(0,0,0,0.15)',
        padding:24,
        width:'90%',
        maxWidth:420
      }}>
        <h3 style={{fontSize:'1.3rem',fontFamily:'var(--font-title)',fontStyle:'italic',marginBottom:8}}>Delete classroom?</h3>
        <p style={{color:'var(--text-secondary)',marginBottom:16}}>
          This will remove the classroom and its membership links. Documents and student data remain in their accounts.
        </p>
        {error && (
          <div style={{color:'#e53e3e',background:'rgba(229,62,62,0.1)',border:'1px solid rgba(229,62,62,0.3)',padding:12,borderRadius:8,marginBottom:12}}>
            {error}
          </div>
        )}
        <div style={{display:'flex',gap:12}}>
          <button className="btn-secondary" onClick={onCancel} style={{flex:1,padding:'10px'}}>Cancel</button>
          <button className="primary-btn" onClick={handleConfirm} disabled={loading} style={{flex:1,padding:'10px',background:'#e53e3e',color:'#fff'}}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

