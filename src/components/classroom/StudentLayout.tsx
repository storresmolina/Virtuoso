import React from 'react';
import './StudentLayout.css';
import { getStudentById } from '../../data/students';
import { DocumentsDashboard } from './DocumentsDashboard';
import { Notebooks } from './Notebooks';
import { Schedule } from './Schedule';

interface StudentLayoutProps {
  studentId: string;
  onBack: () => void;
}

type SectionType = 'documents' | 'schedule' | 'notebooks';

export const StudentLayout: React.FC<StudentLayoutProps> = ({ studentId, onBack }) => {
  const student = getStudentById(studentId);
  const [activeSection, setActiveSection] = React.useState<SectionType>('documents');

  if (!student) {
    return (
      <div className="student-page-container">
        <button className="action-link" onClick={onBack}>← Back</button>
        <h2>Student not found</h2>
      </div>
    );
  }

  const sections: { id: SectionType; label: string; icon: string }[] = [
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'schedule', label: 'Schedule', icon: '📅' },
    { id: 'notebooks', label: 'Notebooks', icon: '📓' },
  ];

  return (
    <div className="student-page-container">
      <div className="student-page-header">
        <button className="action-link" onClick={onBack}>← Back</button>
        <div className="student-page-info">
          <h2>{student.name}'s Classroom</h2>
          <p>{student.className} • Enrolled: {student.enrollmentDate}</p>
        </div>
      </div>

      <div className="student-page-layout">
        {/* Left Sidebar Navigation */}
        <div className="student-page-sidebar">
          <div className="student-card-compact">
            <div className="student-avatar-large">{student.name.charAt(0)}</div>
            <div className="student-info-compact">
              <h3>{student.name}</h3>
              <p>{student.classShort || student.className}</p>
            </div>
          </div>

          <nav className="student-section-nav">
            {sections.map(section => (
              <button
                key={section.id}
                className={`section-btn ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="section-icon">{section.icon}</span>
                <span className="section-label">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="student-page-content">
          {activeSection === 'documents' && (
            <div className="section-container">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <DocumentsDashboard studentId={student.id} />
            </div>
          )}

          {activeSection === 'schedule' && (
            <div className="section-container">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <Schedule studentId={student.id} />
            </div>
          )}

          {activeSection === 'notebooks' && (
            <div className="section-container">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <Notebooks studentId={student.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
