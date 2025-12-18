import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from '../../auth/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/' },
    ...(user?.role === 'instructor' ? [{ id: 'students', label: 'Students', icon: '👥', path: '/students' }] : []),
    { id: 'schedule', label: 'Schedule', icon: '📅', path: '/schedule' },
    { id: 'notebooks', label: 'Notebooks', icon: '📓', path: '/notebooks' },
    { id: 'documents', label: 'Sheet Music', icon: '📄', path: '/documents' },
    ...(user?.role === 'instructor' ? [{ id: 'subscription', label: 'Subscription', icon: '💳', path: '/subscription' }] : []),
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement | null>(null)
  const firstMenuRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (open) {
      // focus first item when opened
      firstMenuRef.current?.focus()
    }
  }, [open])

  const handleToggleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(o => !o)
    }
  }

  const handleMenuKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
      toggleRef.current?.focus()
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">🎵 Virtuoso</h1>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <NavLink
                to={tab.path}
                className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-profile">
          {user && (
            <div className="profile-inner">
              <div className="profile-avatar">{String(user.name || user.username).charAt(0).toUpperCase()}</div>
              <div className="profile-info">
                <div className="profile-name">{user.name || user.username}</div>
                <div className="profile-role">Profile</div>
              </div>
              <div>
                <button
                  ref={toggleRef}
                  className="profile-toggle action-small"
                  onClick={() => setOpen(o => !o)}
                  onKeyDown={handleToggleKey}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  aria-controls="profile-menu"
                >
                  ⋯
                </button>
              </div>
            </div>
          )}
        </div>

        {open && (
          <div id="profile-menu" className="profile-menu" role="menu" onKeyDown={handleMenuKey}>
            <button ref={firstMenuRef} role="menuitem" className="btn-secondary" onClick={() => { setOpen(false); navigate('/settings'); }}>Settings</button>
            <button role="menuitem" className="primary-btn" onClick={() => logout()}>Sign out</button>
          </div>
        )}
      </div>
    </aside>
  );
};
