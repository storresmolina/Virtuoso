import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export const Login: React.FC<{ onCancel?: () => void; onForgotPassword?: () => void }> = ({ onCancel, onForgotPassword }) => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    const r = await login(email.trim(), password)
    if (!r.ok) setError(r.error || 'Invalid credentials')
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
        Welcome Back
      </h2>
      <p style={{
        textAlign:'center',
        color:'var(--text-secondary)',
        marginBottom:32,
        fontSize:'0.95rem'
      }}>
        Sign in to continue your practice
      </p>
      
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:16}}>
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

        <div>
          <label style={{
            display:'block',
            marginBottom:6,
            fontSize:'0.9rem',
            fontWeight:500,
            color:'var(--text-primary)'
          }}>
            Password
          </label>
          <div style={{position:'relative'}}>
            <input 
              placeholder="Enter your password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              type={showPassword ? "text" : "password"}
              required
              style={{
                width:'100%',
                padding:'10px 12px',
                paddingRight:40,
                borderRadius:8,
                border:'1px solid var(--border-color)',
                background:'var(--bg-primary)',
                color:'var(--text-primary)',
                fontSize:'0.95rem'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position:'absolute',
                right:8,
                top:'50%',
                transform:'translateY(-50%)',
                background:'transparent',
                border:'none',
                cursor:'pointer',
                padding:4,
                fontSize:'1.2rem',
                color:'var(--text-secondary)',
                display:'flex',
                alignItems:'center',
                justifyContent:'center'
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? '👁' : '👁‍🗨'}
            </button>
          </div>
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

        <div style={{textAlign:'right',marginTop:-8}}>
          <button 
            type="button" 
            onClick={onForgotPassword}
            style={{
              background:'none',
              border:'none',
              color:'var(--accent-primary)',
              fontSize:'0.9rem',
              cursor:'pointer',
              textDecoration:'underline',
              padding:0,
              fontWeight:500
            }}
          >
            Forgot password?
          </button>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:8}}>
          <button 
            className="primary-btn" 
            type="submit"
            style={{width:'100%',padding:'12px',fontSize:'1rem'}}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onCancel}
            style={{width:'100%',padding:'12px',fontSize:'1rem'}}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
