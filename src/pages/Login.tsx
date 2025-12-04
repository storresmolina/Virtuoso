import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export const Login: React.FC<{ onCancel?: () => void; onForgotPassword?: () => void }> = ({ onCancel, onForgotPassword }) => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    const r = await login(email.trim(), password)
    if (!r.ok) setError(r.error || 'Invalid credentials')
  }

  return (
    <div style={{padding:24,maxWidth:420,margin:'24px auto'}}>
      <h2>Login</h2>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:8}}>
        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" />
        {error && <div style={{color:'red'}}>{error}</div>}
        <div style={{textAlign:'right',marginTop:4}}>
          <button 
            type="button" 
            onClick={onForgotPassword}
            style={{
              background:'none',
              border:'none',
              color:'var(--primary-color)',
              fontSize:13,
              cursor:'pointer',
              textDecoration:'underline'
            }}
          >
            Forgot password?
          </button>
        </div>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button className="primary-btn" type="submit">Sign In</button>
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
