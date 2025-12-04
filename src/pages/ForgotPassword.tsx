import React, { useState } from 'react'
import { resetPassword } from '../auth/supabaseAuth'

export const ForgotPassword: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await resetPassword(email.trim())
      setSent(true)
    } catch (e: any) {
      setError(e.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={{padding:24,maxWidth:420,margin:'24px auto',textAlign:'center'}}>
        <h2>Check Your Email</h2>
        <p style={{marginBottom:16,color:'var(--text-secondary)'}}>
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <p style={{marginBottom:24,fontSize:14,color:'var(--text-secondary)'}}>
          Click the link in the email to reset your password. The link will expire in 1 hour.
        </p>
        <button className="primary-btn" onClick={onBack}>Back to Login</button>
      </div>
    )
  }

  return (
    <div style={{padding:24,maxWidth:420,margin:'24px auto'}}>
      <h2>Reset Password</h2>
      <p style={{marginBottom:16,color:'var(--text-secondary)'}}>
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
        <input 
          placeholder="Email" 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)}
          required
          style={{padding:10}}
        />
        {error && <div style={{color:'red',fontSize:14}}>{error}</div>}
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <button type="button" className="btn-secondary" onClick={onBack}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
