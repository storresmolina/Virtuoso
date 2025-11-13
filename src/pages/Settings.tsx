import React from 'react';
import './Settings.css';

export const Settings: React.FC = () => {
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
              <input type="checkbox" defaultChecked /> Email notifications
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked /> Weekly digest
            </label>
          </div>
          <div className="setting-item">
            <label>Dark mode</label>
            <select>
              <option>Light</option>
              <option>Dark</option>
              <option>Auto</option>
            </select>
          </div>
          <button className="save-btn">Save Preferences</button>
        </div>

        <div className="settings-section">
          <h3>Security</h3>
          <button className="change-password-btn">Change Password</button>
          <button className="logout-btn">Logout</button>
        </div>
      </div>
    </div>
  );
};
