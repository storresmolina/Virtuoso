export interface StudentRecord {
  id: string;
  name: string;
  className: string;
  classShort?: string;
  enrollmentDate?: string;
  status?: 'active' | 'inactive';
  completedAssignments?: number;
  totalAssignments?: number;
  lastActive?: string;
}

export const students: StudentRecord[] = [
  { id: '1', name: 'Emma Johnson', className: 'Piano Basics 101', classShort: 'Piano', enrollmentDate: '2024-09-01', status: 'active', completedAssignments: 8, totalAssignments: 10, lastActive: '2 hours ago' },
  { id: '2', name: 'Liam Smith', className: 'Advanced Techniques', classShort: 'Advanced', enrollmentDate: '2024-09-15', status: 'active', completedAssignments: 7, totalAssignments: 10, lastActive: '1 day ago' },
  { id: '3', name: 'Sophie Chen', className: 'Music Theory', classShort: 'Theory', enrollmentDate: '2024-08-20', status: 'inactive', completedAssignments: 5, totalAssignments: 10, lastActive: '3 days ago' },
];

export const getStudentById = (id: string) => students.find(s => s.id === id) || null;
