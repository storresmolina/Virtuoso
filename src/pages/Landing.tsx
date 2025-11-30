import React from 'react'

export const Landing: React.FC<{ onStart: (mode: 'login' | 'register') => void }> = ({ onStart }) => {
  return (
    <div style={{
      minHeight:'100vh',
      display:'flex',
      flexDirection:'column',
      background:'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)'
    }}>
      {/* Hero Section */}
      <section style={{
        flex:1,
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        padding:'40px 24px',
        textAlign:'center'
      }}>
        <h1 style={{
          fontSize:'3.5rem',
          fontFamily:'var(--font-title)',
          fontWeight:700,
          fontStyle:'italic',
          marginBottom:16,
          color:'var(--text-primary)'
        }}>
          Virtuoso
        </h1>
        <p style={{
          fontSize:'1.25rem',
          maxWidth:600,
          color:'var(--text-secondary)',
          marginBottom:32,
          lineHeight:1.6
        }}>
          Empower your music students with intelligent practice tracking, real-time feedback, 
          and AI-powered performance analysis.
        </p>
        <div style={{display:'flex',gap:16,marginBottom:48}}>
          <button 
            className="primary-btn" 
            onClick={() => onStart('register')}
            style={{padding:'14px 32px',fontSize:'1.1rem'}}
          >
            Get Started
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => onStart('login')}
            style={{padding:'14px 32px',fontSize:'1.1rem'}}
          >
            Sign In
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding:'60px 24px',
        background:'var(--bg-primary)',
        borderTop:'1px solid var(--border-color)'
      }}>
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          <h2 style={{
            fontSize:'2rem',
            textAlign:'center',
            marginBottom:48,
            fontFamily:'var(--font-title)',
            color:'var(--text-primary)'
          }}>
            Everything You Need to Teach Music
          </h2>
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',
            gap:32
          }}>
            <FeatureCard 
              title="Practice Tracking"
              description="Students record and log practice sessions. Track progress over time with detailed analytics."
              icon="📊"
            />
            <FeatureCard 
              title="AI Analysis"
              description="Premium feature: Get intelligent breakdowns of student recordings with actionable feedback."
              icon="✨"
            />
            <FeatureCard 
              title="Classroom Management"
              description="Create classrooms, invite students with codes, and manage multiple ensembles effortlessly."
              icon="🎓"
            />
            <FeatureCard 
              title="Digital Notebooks"
              description="Students maintain practice journals, lesson notes, and repertoire lists in one place."
              icon="📓"
            />
            <FeatureCard 
              title="Document Library"
              description="Share sheet music, method books, and resources directly with your students."
              icon="📚"
            />
            <FeatureCard 
              title="Progress Reports"
              description="Generate insights on student improvement, attendance, and engagement patterns."
              icon="📈"
            />
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section style={{
        padding:'60px 24px',
        textAlign:'center',
        background:'var(--bg-secondary)'
      }}>
        <h2 style={{
          fontSize:'2rem',
          marginBottom:24,
          fontFamily:'var(--font-title)',
          color:'var(--text-primary)'
        }}>
          Start Free, Upgrade When Ready
        </h2>
        <p style={{
          fontSize:'1.1rem',
          color:'var(--text-secondary)',
          maxWidth:600,
          margin:'0 auto 32px'
        }}>
          Free plan includes 1 student per classroom. Upgrade to Premium for unlimited students 
          and AI-powered practice analysis at $29.99/month.
        </p>
        <button 
          className="primary-btn" 
          onClick={() => onStart('register')}
          style={{padding:'14px 32px',fontSize:'1.1rem'}}
        >
          Create Your Account
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        padding:'24px',
        textAlign:'center',
        fontSize:'0.9rem',
        color:'var(--text-secondary)',
        borderTop:'1px solid var(--border-color)'
      }}>
        <p>© 2025 Virtuoso. Built for music educators.</p>
      </footer>
    </div>
  )
}

// Feature Card Component
const FeatureCard: React.FC<{ title: string; description: string; icon: string }> = ({ title, description, icon }) => (
  <div style={{
    padding:24,
    background:'var(--bg-secondary)',
    borderRadius:12,
    border:'1px solid var(--border-color)',
    textAlign:'center'
  }}>
    <div style={{fontSize:'2.5rem',marginBottom:12}}>{icon}</div>
    <h3 style={{
      fontSize:'1.25rem',
      marginBottom:8,
      fontFamily:'var(--font-title)',
      color:'var(--text-primary)'
    }}>
      {title}
    </h3>
    <p style={{
      fontSize:'0.95rem',
      color:'var(--text-secondary)',
      lineHeight:1.5
    }}>
      {description}
    </p>
  </div>
)
