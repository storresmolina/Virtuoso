import React from 'react';
import './Students.css';

interface StudentRecord {
  id: string;
  name: string;
  class: string;
  enrollmentDate: string;
  status: 'active' | 'inactive';
  completedAssignments: number;
  totalAssignments: number;
}

export const Students: React.FC = () => {
  const [students] = React.useState<StudentRecord[]>([
    {
      id: '1',
      name: 'Emma Johnson',
      class: 'Piano Basics 101',
      enrollmentDate: '2024-09-01',
      status: 'active',
      completedAssignments: 8,
      totalAssignments: 10
    },
    {
      id: '2',
      name: 'Liam Smith',
      class: 'Advanced Techniques',
      enrollmentDate: '2024-09-15',
      status: 'active',
      completedAssignments: 7,
      totalAssignments: 10
    },
    {
      id: '3',
      name: 'Sophie Chen',
      class: 'Music Theory',
      enrollmentDate: '2024-08-20',
      status: 'inactive',
      completedAssignments: 5,
      totalAssignments: 10
    },
  ]);

  return (
    <div className="students">
      <div className="students-header">
        <h2>Student Dashboard</h2>
        <p>Monitor student progress and engagement</p>
      </div>

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
                <td>{student.class}</td>
                <td>{student.enrollmentDate}</td>
                <td>
                  <span className={`status-badge ${student.status}`}>
                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </span>
                </td>
                <td>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${(student.completedAssignments / student.totalAssignments) * 100}%`
                    }}></div>
                  </div>
                  <span className="progress-text">
                    {student.completedAssignments}/{student.totalAssignments}
                  </span>
                </td>
                <td>
                  <button className="action-link">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
