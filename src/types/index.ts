// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'instructor' | 'student';
  profilePicture?: string;
}

export interface Instructor extends User {
  role: 'instructor';
  subject: string;
  bio?: string;
}

export interface Student extends User {
  role: 'student';
  enrolledClasses: string[];
}

// Class types
export interface Class {
  id: string;
  name: string;
  code: string;
  instructorId: string;
  description?: string;
  schedule?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Classroom: each student has their own classroom containing documents and notebooks
export interface Classroom {
  id: string;
  studentId: string;
  title?: string; // e.g., "Emma Johnson - Private Lessons"
  documentIds?: string[];
  notebookIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Document types
export interface Document {
  id: string;
  classId: string;
  title: string;
  fileUrl: string;
  fileType: 'sheet_music' | 'assignment' | 'reference' | 'other';
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
  // Optional: link document to a specific student/classroom when instructor creates private materials
  studentId?: string;
}

// Notebook types
export interface Notebook {
  id: string;
  classId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  // Optional: notebook scoped to a particular student
  studentId?: string;
}

// Student progress types
export interface StudentProgress {
  studentId: string;
  classId: string;
  completedAssignments: string[];
  notes?: string;
  lastActive: Date;
}

// Navigation menu item
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  subItems?: NavItem[];
}
