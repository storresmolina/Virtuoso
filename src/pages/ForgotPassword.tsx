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
      <div style={{
        padding:'48px 32px',
        maxWidth:480,
        margin:'60px auto',
        background:'var(--bg-secondary)',
        borderRadius:16,
        border:'1px solid var(--border-color)',
        boxShadow:'0 4px 12px rgba(0,0,0,0.08)',
        textAlign:'center'
      }}>
        <div style={{
          fontSize:'3rem',
          marginBottom:16
        }}>
          📧
        </div>
        <h2 style={{
          fontSize:'2rem',
          fontFamily:'var(--font-title)',
          fontStyle:'italic',
          marginBottom:16,
          color:'var(--text-primary)'
        }}>
          Check Your Email
        </h2>
        <p style={{
          marginBottom:12,
          color:'var(--text-primary)',
          fontSize:'1rem'
        }}>
          We've sent a password reset link to
        </p>
        <p style={{
          marginBottom:24,
          color:'var(--accent-primary)',
          fontWeight:600,
          fontSize:'1.05rem'
        }}>
          {email}
        </p>
        <p style={{
          marginBottom:32,
          fontSize:'0.9rem',
          color:'var(--text-secondary)',
          lineHeight:1.6,
          padding:'16px',
          background:'var(--bg-primary)',
          borderRadius:8,
          border:'1px solid var(--border-color)'
        }}>
          Click the link in the email to reset your password. The link will expire in 1 hour.
        </p>
        <button 
          className="primary-btn" 
          onClick={onBack}
          style={{width:'100%',padding:'12px',fontSize:'1rem'}}
        >
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div style={{
      padding:'48px 32px',
      maxWidth:460,
      margin:'60px auto',
      background:'var(--bg-secondary)',
      borderRadius:16,
      border:'1px solid var(--border-color)',
      boxShadow:'0 4px 12px rgba(0,0,0,0.08)'
    }}>
      <h2 style={{
        fontSize:'2rem',
        fontFamily:'var(--font-title)',
        fontStyle:'italic',
        marginBottom:8,
        textAlign:'center',
        color:'var(--text-primary)'
      }}>
        Reset Password
      </h2>
      <p style={{
        textAlign:'center',
        marginBottom:32,
        color:'var(--text-secondary)',
        fontSize:'0.95rem',
        lineHeight:1.6
      }}>
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
        <div>
          <label style={{
            display:'block',
            marginBottom:6,
            fontSize:'0.9rem',
            fontWeight:500,
            color:'var(--text-primary)'
          }}>
            Email
          </label>
          <input 
            placeholder="Enter your email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width:'100%',
              padding:'10px 12px',
              borderRadius:8,
              border:'1px solid var(--border-color)',
              background:'var(--bg-primary)',
              color:'var(--text-primary)',
              fontSize:'0.95rem'
            }}
          />
        </div>

        {error && (
          <div style={{
            color:'#e53e3e',
            fontSize:'0.9rem',
            padding:12,
            background:'rgba(229,62,62,0.1)',
            borderRadius:8,
            border:'1px solid rgba(229,62,62,0.3)'
          }}>
            {error}
          </div>
        )}

        <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:8}}>
          <button 
            className="primary-btn" 
            type="submit" 
            disabled={loading}
            style={{width:'100%',padding:'12px',fontSize:'1rem',opacity:loading?0.6:1}}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onBack}
            style={{width:'100%',padding:'12px',fontSize:'1rem'}}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
