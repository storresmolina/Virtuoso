import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export const Register: React.FC<{ onCancel?: () => void }> = ({ onCancel }) => {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<'student' | 'instructor'>('student')
  const [error, setError] = useState<string | null>(null)

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    const r = await register(email.trim(), password, username.trim(), role)
    if (!r.ok) setError(r.error || 'Unable to register')
  }

  return (
    <div style={{padding:24,maxWidth:520,margin:'24px auto'}}>
      <h2>Create Account</h2>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:12}}>
        
        <div style={{display:'flex',gap:16,marginBottom:8}}>
          <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}>
            <input 
              type="radio" 
              name="role" 
              value="student" 
              checked={role === 'student'} 
              onChange={() => setRole('student')}
            />
            <span>Student</span>
          </label>
          <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}>
            <input 
              type="radio" 
              name="role" 
              value="instructor" 
              checked={role === 'instructor'} 
              onChange={() => setRole('instructor')}
            />
            <span>Instructor</span>
          </label>
        </div>

        <input placeholder="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        
        {role === 'student' && (
          <p style={{fontSize:14,color:'var(--text-secondary)',margin:0}}>
            You'll be able to join a classroom after registration using a code from your instructor.
          </p>
        )}
        
        {error && <div style={{color:'red',fontSize:14}}>{error}</div>}
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button className="primary-btn" type="submit">Create Account</button>
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
