import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export const Register: React.FC<{ onCancel?: () => void }> = ({ onCancel }) => {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<'student' | 'instructor'>('student')
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    const r = await register(email.trim(), password, username.trim(), role)
    if (!r.ok) setError(r.error || 'Unable to register')
  }

  return (
    <div style={{
      padding:'48px 32px',
      maxWidth:480,
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
        Create Account
      </h2>
      <p style={{
        textAlign:'center',
        color:'var(--text-secondary)',
        marginBottom:32,
        fontSize:'0.95rem'
      }}>
        Join Virtuoso to start your musical journey
      </p>
      
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:16}}>
        
        <div>
          <label style={{
            display:'block',
            marginBottom:8,
            fontSize:'0.9rem',
            fontWeight:500,
            color:'var(--text-primary)'
          }}>
            I am a:
          </label>
          <div style={{
            display:'flex',
            gap:12,
            padding:12,
            background:'var(--bg-primary)',
            borderRadius:8,
            border:'1px solid var(--border-color)'
          }}>
            <label style={{
              flex:1,
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              gap:8,
              cursor:'pointer',
              padding:'8px 16px',
              borderRadius:6,
              background: role === 'student' ? 'var(--accent-primary)' : 'transparent',
              color: role === 'student' ? 'var(--lacquer)' : 'var(--text-primary)',
              transition:'all 0.3s ease',
              fontWeight: role === 'student' ? 600 : 400
            }}>
              <input 
                type="radio" 
                name="role" 
                value="student" 
                checked={role === 'student'} 
                onChange={() => setRole('student')}
                style={{display:'none'}}
              />
              <span>🎓 Student</span>
            </label>
            <label style={{
              flex:1,
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              gap:8,
              cursor:'pointer',
              padding:'8px 16px',
              borderRadius:6,
              background: role === 'instructor' ? 'var(--accent-primary)' : 'transparent',
              color: role === 'instructor' ? 'var(--lacquer)' : 'var(--text-primary)',
              transition:'all 0.3s ease',
              fontWeight: role === 'instructor' ? 600 : 400
            }}>
              <input 
                type="radio" 
                name="role" 
                value="instructor" 
                checked={role === 'instructor'} 
                onChange={() => setRole('instructor')}
                style={{display:'none'}}
              />
              <span>🎻 Instructor</span>
            </label>
          </div>
        </div>

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
            Username
          </label>
          <input 
            placeholder="Choose a username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
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
              placeholder="At least 6 characters" 
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

        <div>
          <label style={{
            display:'block',
            marginBottom:6,
            fontSize:'0.9rem',
            fontWeight:500,
            color:'var(--text-primary)'
          }}>
            Confirm Password
          </label>
          <div style={{position:'relative'}}>
            <input 
              placeholder="Re-enter your password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              type={showConfirmPassword ? "text" : "password"}
              required
              style={{
                width:'100%',
                padding:'10px 12px',
                paddingRight:40,
                borderRadius:8,
                border:`1px solid ${confirmPassword && password !== confirmPassword ? '#e53e3e' : 'var(--border-color)'}`,
                background:'var(--bg-primary)',
                color:'var(--text-primary)',
                fontSize:'0.95rem'
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? '👁' : '👁‍🗨'}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p style={{fontSize:'0.85rem',color:'#e53e3e',marginTop:4}}>
              Passwords do not match
            </p>
          )}
        </div>
        
        {role === 'student' && (
          <p style={{
            fontSize:'0.85rem',
            color:'var(--text-secondary)',
            margin:0,
            padding:12,
            background:'var(--bg-primary)',
            borderRadius:8,
            border:'1px solid var(--border-color)'
          }}>
            💡 You'll be able to join a classroom after registration using a code from your instructor.
          </p>
        )}
        
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
            style={{width:'100%',padding:'12px',fontSize:'1rem'}}
          >
            Create Account
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
