import React from 'react';
import './Students.css';
import { DocumentsDashboard } from '../components/classroom/DocumentsDashboard';
import { Notebooks } from '../components/classroom/Notebooks';
import { getStudentById } from '../data/students';

interface StudentPageProps {
  studentId: string;
  onBack: () => void;
}

export const StudentPage: React.FC<StudentPageProps> = ({ studentId, onBack }) => {
  const student = getStudentById(studentId);

  if (!student) {
    return (
      <div className="student-page">
        <button className="action-link" onClick={onBack}>← Back</button>
        <h2>Student not found</h2>
      </div>
    );
  }

  return (
    <div className="student-page">
      <div className="classroom-header">
        <button className="action-link" onClick={onBack}>← Back</button>
        <h2>{student.name}'s Classroom</h2>
        <p>Class: {student.className} • Enrolled: {student.enrollmentDate}</p>
      </div>

      <div className="classroom-grid">
        <div className="classroom-section">
          <h3>Documents</h3>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <DocumentsDashboard studentId={student.id} />
        </div>

        <div className="classroom-section">
          <h3>Notebooks</h3>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <Notebooks studentId={student.id} />
        </div>
      </div>
    </div>
  );
};
