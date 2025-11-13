import React from 'react';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Welcome back! Here's an overview of your classes.</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <p className="stat-number">24</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎼</div>
          <div className="stat-content">
            <h3>Active Classes</h3>
            <p className="stat-number">3</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>Documents</h3>
            <p className="stat-number">12</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Notebooks</h3>
            <p className="stat-number">5</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Recent Classes</h3>
        <div className="class-list">
          <div className="class-item">
            <div className="class-info">
              <h4>Piano Basics 101</h4>
              <p>25 students • Last updated 2 hours ago</p>
            </div>
            <button className="class-action-btn">View</button>
          </div>

          <div className="class-item">
            <div className="class-info">
              <h4>Advanced Techniques</h4>
              <p>18 students • Last updated 1 day ago</p>
            </div>
            <button className="class-action-btn">View</button>
          </div>

          <div className="class-item">
            <div className="class-info">
              <h4>Music Theory Intermediate</h4>
              <p>22 students • Last updated 3 days ago</p>
            </div>
            <button className="class-action-btn">View</button>
          </div>
        </div>
      </div>
    </div>
  );
};
