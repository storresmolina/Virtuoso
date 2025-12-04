import React, { useState } from 'react'
import { updatePassword } from '../auth/supabaseAuth'

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await updatePassword(password)
      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (e: any) {
      setError(e.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{padding:24,maxWidth:420,margin:'24px auto',textAlign:'center'}}>
        <h2>Password Updated!</h2>
        <p style={{marginBottom:16,color:'var(--text-secondary)'}}>
          Your password has been successfully reset.
        </p>
        <p style={{fontSize:14,color:'var(--text-secondary)'}}>
          Redirecting to login...
        </p>
      </div>
    )
  }

  return (
    <div style={{padding:24,maxWidth:420,margin:'24px auto'}}>
      <h2>Set New Password</h2>
      <p style={{marginBottom:16,color:'var(--text-secondary)'}}>
        Enter your new password below.
      </p>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
        <input 
          placeholder="New Password" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          style={{padding:10}}
        />
        <input 
          placeholder="Confirm New Password" 
          type="password" 
          value={confirmPassword} 
          onChange={e => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          style={{padding:10}}
        />
        {error && <div style={{color:'red',fontSize:14}}>{error}</div>}
        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
