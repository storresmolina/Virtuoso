import React, { useState } from 'react';
import './StudentLayout.css';
import { getStudentById } from '../../data/students';
import { mockAuth } from '../../auth/mockAuth';
import { DocumentsDashboard } from './DocumentsDashboard';
import { Notebooks } from './Notebooks';
import { Schedule } from './Schedule';

interface StudentLayoutProps {
  studentId: string;
  onBack: () => void;
}

type SectionType = 'documents' | 'schedule' | 'notebooks';

interface DocumentFile {
  id: string;
  name: string;
  title?: string;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({ studentId, onBack }) => {
  const student = getStudentById(studentId);
  // If not found in the demo students list, try the mockAuth users (registered/in-memory students)
  const studentFromAuth = !student ? ((): any => {
    try {
      const found = mockAuth.listStudents().find((u: any) => u.id === studentId)
      if (!found) return null
      // map to StudentRecord shape expected by this layout
      return {
        id: found.id,
        name: found.name || found.username,
        className: 'Demo Class',
        classShort: 'Demo',
        enrollmentDate: (new Date()).toISOString().slice(0,10),
        status: 'active',
        completedAssignments: 0,
        totalAssignments: 0,
        lastActive: 'just now'
      }
    } catch {
      return null
    }
  })() : null

  const effectiveStudent = student || studentFromAuth
  const [activeSection, setActiveSection] = useState<SectionType>('documents');
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  if (!effectiveStudent) {
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
          <h2>{effectiveStudent.name}'s Classroom</h2>
          <p>{effectiveStudent.className} • Enrolled: {effectiveStudent.enrollmentDate}</p>
        </div>
      </div>

      <div className="student-page-layout">
        {/* Left Sidebar Navigation */}
        <div className="student-page-sidebar">
          <div className="student-card-compact">
            <div className="student-avatar-large">{effectiveStudent.name.charAt(0)}</div>
            <div className="student-info-compact">
              <h3>{effectiveStudent.name}</h3>
              <p>{effectiveStudent.classShort || effectiveStudent.className}</p>
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
              <DocumentsDashboard studentId={effectiveStudent.id} onDocumentsChange={setDocuments} />
            </div>
          )}

          {activeSection === 'schedule' && (
            <div className="section-container">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <Schedule studentId={effectiveStudent.id} availableDocuments={documents} />
            </div>
          )}

          {activeSection === 'notebooks' && (
            <div className="section-container">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <Notebooks studentId={effectiveStudent.id} availableDocuments={documents} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
