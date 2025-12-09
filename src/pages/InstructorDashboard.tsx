import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { CreateClassroomModal } from '../components/shared/CreateClassroomModal'

export const InstructorDashboard: React.FC = () => {
  const { user, listClassrooms, createClassroom, getTierInfo } = useAuth()
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [tier, setTier] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

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
                onClick={() => {/* TODO: Navigate to upgrade page */}}
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
              onViewDetails={() => {/* TODO: Navigate to classroom details */}}
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
    </div>
  )
}

interface ClassroomCardProps {
  classroom: any
  onViewDetails: () => void
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({ classroom, onViewDetails }) => {
  const memberCount = classroom.member_count || 0
  const maxSize = classroom.max_size
  const isPrivate = maxSize === 1
  
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
      <div style={{display:'flex',alignItems:'start',justifyContent:'space-between',marginBottom:16}}>
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
        View Details
      </button>
    </div>
  )
}

