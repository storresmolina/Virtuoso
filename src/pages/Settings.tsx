import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../auth/AuthContext'
import './Settings.css';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(true);

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as 'light' | 'dark');
  };

  const { createCode, listCodes, listClassrooms, getTierInfo } = useAuth()
  const [codes, setCodes] = useState<any[]>([])
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null)
  const [tier, setTier] = useState<any>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const [cls, t] = await Promise.all([listClassrooms(), getTierInfo()])
    setClassrooms(cls)
    setTier(t)
    if (cls.length > 0) {
      setSelectedClassroom(cls[0].id)
      const c = await listCodes(cls[0].id)
      setCodes(c)
    }
  }

  async function changeClassroom(id: string) {
    setSelectedClassroom(id)
    const c = await listCodes(id)
    setCodes(c)
  }

  async function makeCode() {
    if (!selectedClassroom) {
      alert('Create a classroom first from the Dashboard')
      return
    }
    const c = await createCode(selectedClassroom)
    if (c.error) {
      alert('Error: ' + c.error)
      return
    }
    try {
      navigator.clipboard?.writeText(c.code)
    } catch {}
    await load()
    if (selectedClassroom) await changeClassroom(selectedClassroom)
    alert('Created code: ' + c.code + ' (copied to clipboard)')
  }

  return (
    <div className="settings">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage your account and preferences</p>
      </div>

      <div className="settings-container">
        <div className="settings-section">
          <h3>Account Settings</h3>
          <div className="setting-item">
            <label>Full Name</label>
            <input type="text" placeholder="Your name" />
          </div>
          <div className="setting-item">
            <label>Email</label>
            <input type="email" placeholder="your@email.com" />
          </div>
          <div className="setting-item">
            <label>Bio</label>
            <textarea placeholder="Tell us about yourself..."></textarea>
          </div>
          <button className="save-btn">Save Changes</button>
        </div>

        <div className="settings-section">
          <h3>Preferences</h3>
          <div className="setting-item">
            <label>
              <input 
                type="checkbox" 
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              /> 
              Email notifications
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input 
                type="checkbox" 
                checked={weeklyDigestEnabled}
                onChange={(e) => setWeeklyDigestEnabled(e.target.checked)}
              /> 
              Weekly digest
            </label>
          </div>
          <div className="setting-item">
            <label htmlFor="theme-select">Color Palette</label>
            <select 
              id="theme-select"
              value={theme}
              onChange={handleThemeChange}
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>
          <button className="save-btn">Save Preferences</button>
        </div>

        {tier && (
          <div className="settings-section">
            <h3>Membership</h3>
            <div style={{padding:12,background:'var(--bg-secondary)',borderRadius:8,marginBottom:12}}>
              <strong>Current Plan:</strong> {tier.name}
              {tier.max_students !== null && (
                <div style={{marginTop:4,fontSize:14,color:'var(--text-secondary)'}}>
                  {tier.max_students} {tier.max_students === 1 ? 'student' : 'students'} per classroom
                </div>
              )}
              {tier.ai_analysis_enabled ? (
                <div style={{marginTop:4,fontSize:14}}>✨ AI Practice Analysis Enabled</div>
              ) : (
                <div style={{marginTop:4,fontSize:14,color:'var(--text-secondary)'}}>
                  AI analysis not available on free plan
                </div>
              )}
            </div>
            {tier.id === 'free' && (
              <button className="primary-btn">
                Upgrade to Premium ($29.99/month)
              </button>
            )}
          </div>
        )}

        <div className="settings-section">
          <h3>Security</h3>
          <button className="change-password-btn">Change Password</button>
        </div>
        
        <div className="settings-section">
          <h3>Classroom Codes</h3>
          <p>Create one-use classroom codes that students can use to join a classroom.</p>
          
          {classrooms.length > 0 && (
            <div style={{marginTop:12}}>
              <label>Select Classroom:</label>
              <select 
                value={selectedClassroom || ''} 
                onChange={e => changeClassroom(e.target.value)}
                style={{marginLeft:8,padding:'4px 8px'}}
              >
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div style={{display:'flex',gap:8,alignItems:'center',marginTop:12}}>
            <button className="primary-btn" onClick={makeCode}>Create Code</button>
            <small style={{color:'#666'}}>New codes are copied to clipboard automatically.</small>
          </div>
          <ul style={{marginTop:12}}>
            {codes.map((c: any) => (
              <li key={c.code} style={{marginBottom:6}}>
                <code style={{marginRight:8}}>{c.code}</code>
                <span style={{color:'#666'}}>{c.used ? 'used' : 'available'}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
