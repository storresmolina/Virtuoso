import React, { useState } from 'react'

interface CreateClassroomModalProps {
  onClose: () => void
  onCreate: (name: string, maxSize: number) => Promise<void>
  maxStudentsAllowed: number | null // null = unlimited
}

export const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({ 
  onClose, 
  onCreate, 
  maxStudentsAllowed 
}) => {
  const [name, setName] = useState('')
  const [maxSize, setMaxSize] = useState<number>(maxStudentsAllowed === null ? 30 : maxStudentsAllowed)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter a classroom name')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      await onCreate(name.trim(), maxSize)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create classroom')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 16,
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        padding: '32px',
        maxWidth: 500,
        width: '90%'
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontFamily: 'var(--font-title)',
          fontStyle: 'italic',
          marginBottom: 8,
          color: 'var(--text-primary)'
        }}>
          Create New Classroom
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: 24,
          fontSize: '0.95rem'
        }}>
          Set up a new classroom for your students
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: 6,
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'var(--text-primary)'
            }}>
              Classroom Name
            </label>
            <input
              type="text"
              placeholder="e.g., Advanced Piano, Beginner Violin..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: 6,
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'var(--text-primary)'
            }}>
              Maximum Students
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <input
                type="number"
                min="1"
                max={maxStudentsAllowed || 100}
                value={maxSize}
                onChange={(e) => setMaxSize(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={maxStudentsAllowed !== null}
                style={{
                  width: '100px',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: maxStudentsAllowed !== null ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
              />
              <span style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}>
                {maxStudentsAllowed !== null ? (
                  maxStudentsAllowed === 1 
                    ? '(Private instruction only on Free plan)'
                    : `(Limited to ${maxStudentsAllowed} on your plan)`
                ) : '(Unlimited on Premium plan)'}
              </span>
            </div>
          </div>

          {error && (
            <div style={{
              color: '#e53e3e',
              fontSize: '0.9rem',
              padding: 12,
              background: 'rgba(229,62,62,0.1)',
              borderRadius: 8,
              border: '1px solid rgba(229,62,62,0.3)'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
              style={{ flex: 1, padding: '12px', fontSize: '1rem', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Creating...' : 'Create Classroom'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
              style={{ flex: 1, padding: '12px', fontSize: '1rem' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
