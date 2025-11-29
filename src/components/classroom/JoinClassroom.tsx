import React, { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'

export const JoinClassroom: React.FC = () => {
  const { joinClassroom } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const r = await joinClassroom(code.trim())
      if (!r.ok) setError(r.error || 'Unable to join classroom')
      // On success, parent component will re-render with classroom access
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      justifyContent:'center',
      minHeight:'60vh',
      padding:24
    }}>
      <div style={{maxWidth:420,width:'100%',textAlign:'center'}}>
        <h2>Join a Classroom</h2>
        <p style={{marginTop:8,color:'var(--text-secondary)'}}>
          Enter the classroom code provided by your instructor to get started.
        </p>
        <form onSubmit={submit} style={{marginTop:24,display:'flex',flexDirection:'column',gap:12}}>
          <input 
            placeholder="Enter classroom code" 
            value={code} 
            onChange={e => setCode(e.target.value)}
            style={{padding:12,fontSize:16,textAlign:'center',textTransform:'uppercase'}}
            required
            disabled={loading}
          />
          {error && <div style={{color:'red',fontSize:14}}>{error}</div>}
          <button 
            className="primary-btn" 
            type="submit" 
            disabled={loading || !code.trim()}
            style={{padding:12,fontSize:16}}
          >
            {loading ? 'Joining...' : 'Join Classroom'}
          </button>
        </form>
      </div>
    </div>
  )
}
