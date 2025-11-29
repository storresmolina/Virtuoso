import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export const Register: React.FC<{ onCancel?: () => void }> = ({ onCancel }) => {
  const { registerStudent } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const r = registerStudent(username.trim(), password, name.trim(), code.trim())
    if (!r.ok) setError(r.error || 'Unable to register')
  }

  return (
    <div style={{padding:24,maxWidth:520,margin:'24px auto'}}>
      <h2>Student Registration</h2>
      <p>Enter the one-use code provided by your instructor.</p>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:8}}>
        <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Choose username" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="Choose password" value={password} onChange={e => setPassword(e.target.value)} type="password" />
        <input placeholder="One-use code" value={code} onChange={e => setCode(e.target.value)} />
        {error && <div style={{color:'red'}}>{error}</div>}
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button className="primary-btn" type="submit">Register</button>
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
