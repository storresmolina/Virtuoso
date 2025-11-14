import React from 'react';
import './Students.css';
import { DocumentsDashboard } from '../components/classroom/DocumentsDashboard';
import { Notebooks } from '../components/classroom/Notebooks';
import { students } from '../data/students';
import type { StudentRecord } from '../data/students';

interface StudentsProps {
  onOpenStudent?: (id: string) => void;
}

export const Students: React.FC<StudentsProps> = ({ onOpenStudent }) => {
  const [selectedStudent, setSelectedStudent] = React.useState<StudentRecord | null>(null);

  const openClassroom = (student: StudentRecord) => {
    if (onOpenStudent) {
      onOpenStudent(student.id);
      return;
    }
    setSelectedStudent(student);
  };

  const closeClassroom = () => {
    setSelectedStudent(null);
  };

  return (
    <div className="students">
      <div className="students-header">
        <h2>Student Dashboard</h2>
        <p>Monitor student progress and engagement</p>
      </div>

      {!selectedStudent ? (
        <>
          <div className="students-filters">
            <select className="filter-select">
              <option>All Classes</option>
              <option>Piano Basics 101</option>
              <option>Advanced Techniques</option>
              <option>Music Theory</option>
            </select>
            <select className="filter-select">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <input type="text" placeholder="Search students..." className="search-input" />
          </div>

          <div className="students-table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Enrollment Date</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-name">
                        <div className="student-avatar">{student.name.charAt(0)}</div>
                        {student.name}
                      </div>
                    </td>
                          <td>{student.className}</td>
                    <td>{student.enrollmentDate}</td>
                    <td>
                      <span className={`status-badge ${student.status ?? 'inactive'}`}>
                        {(student.status ?? 'inactive').charAt(0).toUpperCase() + (student.status ?? 'inactive').slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${((student.completedAssignments ?? 0) / (student.totalAssignments ?? 1)) * 100}%`
                        }}></div>
                      </div>
                      <span className="progress-text">
                        {student.completedAssignments ?? 0}/{student.totalAssignments ?? 0}
                      </span>
                    </td>
                    <td>
                      <button className="action-link" onClick={() => openClassroom(student)}>Open Classroom</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="student-classroom">
          <div className="classroom-header">
            <button className="action-link" onClick={closeClassroom}>← Back</button>
            <h2>{selectedStudent.name}'s Classroom</h2>
            <p>Class: {selectedStudent.className} • Enrolled: {selectedStudent.enrollmentDate}</p>
          </div>

          <div className="classroom-grid">
            <div className="classroom-section">
              <h3>Documents</h3>
              {/* Reuse DocumentsDashboard and scope to this student via studentId prop */}
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <DocumentsDashboard studentId={selectedStudent.id} />
            </div>

            <div className="classroom-section">
              <h3>Notebooks</h3>
              {/* Reuse Notebooks and scope to this student via studentId prop */}
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <Notebooks studentId={selectedStudent.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
