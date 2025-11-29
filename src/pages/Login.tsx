import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export const Login: React.FC<{ onCancel?: () => void }> = ({ onCancel }) => {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const r = login(username.trim(), password)
    if (!r.ok) setError(r.error || 'Invalid credentials')
  }

  return (
    <div style={{padding:24,maxWidth:420,margin:'24px auto'}}>
      <h2>Login</h2>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:8}}>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" />
        {error && <div style={{color:'red'}}>{error}</div>}
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button className="primary-btn" type="submit">Sign In</button>
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
