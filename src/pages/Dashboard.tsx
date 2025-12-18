import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { students as STUDENTS } from '../data/students';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const students = STUDENTS;
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Welcome back! Manage your private student classrooms below.</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <p className="stat-number">{students.length}</p>
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
        <h3>Your Students (Classrooms)</h3>
        <div className="students-grid">
          {students.map(student => (
            <div key={student.id} className={`student-card`} onClick={() => navigate(`/student/${student.id}`)}>
              <div className="student-avatar">{student.name.charAt(0)}</div>
              <div className="student-info">
                <h4>{student.name}</h4>
                <p>{student.className} • Last active {student.lastActive}</p>
              </div>
              <div className="student-actions">
                <button className="class-action-btn" onClick={(e) => { e.stopPropagation(); navigate(`/student/${student.id}`); }}>Open</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};
