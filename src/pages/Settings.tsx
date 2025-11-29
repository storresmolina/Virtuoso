import React, { useState } from 'react';
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

  const { createCode, listCodes, logout } = useAuth()
  const [codes, setCodes] = useState<any[]>(() => listCodes())

  const makeCode = () => {
    const c = createCode()
    try {
      navigator.clipboard?.writeText(c.code)
    } catch {}
    // refresh list
    setCodes(listCodes())
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

        <div className="settings-section">
          <h3>Security</h3>
          <button className="change-password-btn">Change Password</button>
          <button className="logout-btn" onClick={() => logout()}>Logout</button>
        </div>
        
        <div className="settings-section">
          <h3>Classroom Codes</h3>
          <p>Create one-use classroom codes that students can use to register.</p>
          <div style={{display:'flex',gap:8,alignItems:'center',marginTop:8}}>
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
