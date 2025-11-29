import React from 'react'

export const Landing: React.FC<{ onStart: (mode: 'login' | 'register') => void }> = ({ onStart }) => {
  return (
    <div style={{padding:40,maxWidth:720,margin:'40px auto'}}>
      <h1>Welcome to Virtuoso (Demo)</h1>
      <p>This demo includes an instructor and student flows. Please sign in or register as a student using a one-use code.</p>
      <div style={{display:'flex',gap:12,marginTop:20}}>
        <button className="primary-btn" onClick={() => onStart('login')}>Login</button>
        <button className="btn-secondary" onClick={() => onStart('register')}>Register (Student)</button>
      </div>
      <section style={{marginTop:24}}>
        <h3>Test accounts</h3>
        <ul>
          <li><strong>Instructor</strong>: username <code>instructor</code> / password <code>instrpass</code></li>
          <li><strong>Student</strong>: username <code>student1</code> / password <code>student1pass</code></li>
          <li>To register a new student use one of the pre-made codes: <code>CODE-ALPHA-1</code>, <code>CODE-BETA-1</code>, <code>CODE-GAMMA-1</code></li>
        </ul>
      </section>
    </div>
  )
}
