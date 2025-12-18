import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Students.css';
import { DocumentsDashboard } from '../components/classroom/DocumentsDashboard';
import { Notebooks } from '../components/classroom/Notebooks';
import { getInstructorStudents } from '../data/supabaseApi';
import { useAuth } from '../auth/AuthContext';

interface StudentData {
  id: string;
  name: string | null;
  email: string | null;
  classroom_id: string;
  classroom_name: string;
  classroom_max_size: number | null;
  joined_at: string;
}

export const Students: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStudents();
  }, [user]);

  async function loadStudents() {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getInstructorStudents(user.id);
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  }

  const openClassroom = (student: StudentData) => {
    navigate(`/student/${student.id}`);
  };

  const closeClassroom = () => {
    setSelectedStudent(null);
  };

  // Get unique classrooms for filter
  const classrooms = Array.from(new Set(students.map(s => s.classroom_name)));

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesClassroom = selectedClassroom === 'all' || student.classroom_name === selectedClassroom;
    const matchesSearch = !searchQuery || 
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClassroom && matchesSearch;
  });

  if (loading) {
    return <div style={{padding:24}}>Loading students...</div>;
  }

  return (
    <div className="students">
      <div className="students-header">
        <h2>Student Dashboard</h2>
        <p>Monitor student progress and engagement</p>
      </div>

      {!selectedStudent ? (
        <>
          {students.length === 0 ? (
            <div style={{
              textAlign:'center',
              padding:'48px 24px',
              background:'var(--bg-secondary)',
              borderRadius:12,
              border:'1px solid var(--border-color)',
              margin:'24px 0'
            }}>
              <div style={{fontSize:'3rem',marginBottom:16}}>📚</div>
              <h4 style={{fontSize:'1.25rem',marginBottom:8,color:'var(--text-primary)'}}>
                No Students Yet
              </h4>
              <p style={{color:'var(--text-secondary)',fontSize:'0.95rem'}}>
                Students will appear here once they join your classrooms
              </p>
            </div>
          ) : (
            <>
              <div className="students-filters">
                <select 
                  className="filter-select"
                  value={selectedClassroom}
                  onChange={(e) => setSelectedClassroom(e.target.value)}
                >
                  <option value="all">All Classrooms</option>
                  {classrooms.map(classroom => (
                    <option key={classroom} value={classroom}>{classroom}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="students-table-container">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Classroom</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => {
                      const isPrivate = student.classroom_max_size === 1;
                      return (
                        <tr key={`${student.id}-${student.classroom_id}`}>
                          <td>
                            <div className="student-name">
                              <div className="student-avatar">
                                {(student.name || student.email || '?').charAt(0).toUpperCase()}
                              </div>
                              {student.name || 'No name'}
                            </div>
                          </td>
                          <td>{student.email || '-'}</td>
                          <td>
                            {isPrivate ? (
                              <span style={{fontStyle:'italic',color:'var(--text-secondary)'}}>
                                🎵 Private Instruction
                              </span>
                            ) : (
                              student.classroom_name
                            )}
                          </td>
                          <td>{new Date(student.joined_at).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="action-link" 
                              onClick={() => openClassroom(student)}
                            >
                              Open Classroom
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="student-classroom">
          <div className="classroom-header">
            <button className="action-link" onClick={closeClassroom}>← Back</button>
            <h2>{selectedStudent.name || selectedStudent.email}'s Classroom</h2>
            <p>
              Classroom: {selectedStudent.classroom_max_size === 1 ? 'Private Instruction' : selectedStudent.classroom_name} 
              {' • '}
              Joined: {new Date(selectedStudent.joined_at).toLocaleDateString()}
            </p>
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
