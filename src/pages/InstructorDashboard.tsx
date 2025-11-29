import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useView } from '../context/ViewContext'

export const InstructorDashboard: React.FC = () => {
  const { user, listCodes, createCode, listStudents } = useAuth()
  const { openStudent } = useView()
  const [codes, setCodes] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [cRows, sRows] = await Promise.all([listCodes(), listStudents()])
        if (!cancelled) {
          setCodes(cRows)
          setStudents(sRows)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [listCodes, listStudents])

  const make = () => {
    const c = createCode()
    // better UX: copy to clipboard automatically when created
    try {
      navigator.clipboard?.writeText(c.code)
      alert('Created code: ' + c.code + ' (copied to clipboard)')
    } catch {
      alert('Created code: ' + c.code)
    }
  }

  const copyId = (id: string) => {
    try {
      navigator.clipboard?.writeText(id)
      alert('Copied id to clipboard')
    } catch {
      // fallback
      prompt('Copy the id:', id)
    }
  }

  return (
    <div style={{padding:24}}>
      <h2>Instructor Dashboard</h2>
      <p>Welcome, {user?.name || user?.username}</p>
      <div style={{marginTop:16}}>
        <button className="primary-btn" onClick={make}>Create One-Use Code</button>
      </div>
      <section style={{marginTop:18}}>
        <h3>Active Codes</h3>
        {loading && codes.length === 0 ? <div>Loading codes...</div> : (
          <ul>
            {codes.map((c: any) => (
              <li key={c.code}><code>{c.code}</code> — {c.used ? 'used' : 'available'}</li>
            ))}
          </ul>
        )}
      </section>

      <section style={{marginTop:18}}>
        <h3>Students</h3>
        <p>Seeded students and newly-registered students are listed here (unique id shows backend identifier).</p>
        <table style={{width:'100%',borderCollapse:'collapse',marginTop:8}}>
          <thead>
            <tr style={{textAlign:'left',borderBottom:'1px solid #eee'}}>
              <th style={{padding:'6px 8px'}}>Username</th>
              <th style={{padding:'6px 8px'}}>Name</th>
              <th style={{padding:'6px 8px'}}>UUID / ID</th>
              <th style={{padding:'6px 8px'}}></th>
            </tr>
          </thead>
          <tbody>
            {loading && students.length === 0 ? (
              <tr><td colSpan={4} style={{padding:12}}>Loading students...</td></tr>
            ) : students.map((s: any) => (
              <tr key={s.id} style={{borderBottom:'1px solid #f3f3f3'}}>
                <td style={{padding:'8px'}}>{s.username}</td>
                <td style={{padding:'8px'}}>{s.name || '-'}</td>
                <td style={{padding:'8px'}}><code style={{fontSize:12,opacity:0.9}}>{s.id}</code></td>
                <td style={{padding:'8px',display:'flex',gap:8}}>
                  <button className="action-small" onClick={() => copyId(s.id)}>Copy id</button>
                  <button className="action-small" onClick={() => openStudent(s.id)}>Open</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      
    </div>
  )
}
