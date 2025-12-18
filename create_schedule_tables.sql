-- Create schedule_entries table (shared between instructor and students in same classroom)
CREATE TABLE IF NOT EXISTS schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  topic VARCHAR(255) NOT NULL,
  notes TEXT,
  bullets JSONB, -- array of strings
  attached_documents JSONB, -- array of document IDs (not visible to students)
  attached_notebooks JSONB, -- array of notebook IDs (not visible to students)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create notebooks table (instructor-only, can be attached to schedule entries or standalone)
CREATE TABLE IF NOT EXISTS notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  class_name VARCHAR(255), -- optional: "Piano Basics", "Advanced Arpeggios", etc
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create documents table (classroom-level, shared with students)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- filename
  title VARCHAR(255), -- editable display title
  type VARCHAR(50), -- 'sheet_music', 'reference', 'assignment', etc
  file_url TEXT NOT NULL, -- supabase storage path
  file_size_mb DECIMAL(10, 2),
  upload_date TIMESTAMP DEFAULT NOW(),
  comments TEXT,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create practice_sessions table (private: instructor + uploading student only)
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES classrooms(instructor_id) ON DELETE CASCADE,
  file_url TEXT NOT NULL, -- supabase storage path
  file_size_mb DECIMAL(10, 2),
  file_name VARCHAR(255),
  ai_breakdown TEXT, -- placeholder for AI analysis
  ai_processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'ready', 'failed'
  upload_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create practice_comments table (instructor + student can comment)
CREATE TABLE IF NOT EXISTS practice_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies for schedule_entries
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can manage their own classroom schedules"
  ON schedule_entries
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Students can view their classroom schedules"
  ON schedule_entries
  USING (
    classroom_id IN (
      SELECT classroom_id FROM classroom_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for notebooks (instructor-only)
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can manage their own notebooks"
  ON notebooks
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

-- RLS Policies for documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can manage their classroom documents"
  ON documents
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Students can view documents in their classrooms"
  ON documents
  USING (
    classroom_id IN (
      SELECT classroom_id FROM classroom_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for practice_sessions
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can view practice sessions in their classrooms"
  ON practice_sessions
  USING (instructor_id = auth.uid());

CREATE POLICY "Students can view and upload their own practice sessions"
  ON practice_sessions
  USING (
    student_id = auth.uid() OR
    (
      classroom_id IN (
        SELECT classroom_id FROM classroom_members
        WHERE user_id = auth.uid()
      ) AND student_id = auth.uid()
    )
  )
  WITH CHECK (student_id = auth.uid());

-- RLS Policies for practice_comments
ALTER TABLE practice_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors and session student can view and add comments"
  ON practice_comments
  USING (
    author_id = auth.uid() OR
    practice_session_id IN (
      SELECT id FROM practice_sessions
      WHERE instructor_id = auth.uid() OR student_id = auth.uid()
    )
  )
  WITH CHECK (
    author_id = auth.uid() AND (
      practice_session_id IN (
        SELECT id FROM practice_sessions
        WHERE instructor_id = auth.uid() OR student_id = auth.uid()
      )
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_schedule_classroom ON schedule_entries(classroom_id);
CREATE INDEX idx_schedule_instructor ON schedule_entries(instructor_id);
CREATE INDEX idx_notebooks_instructor ON notebooks(instructor_id);
CREATE INDEX idx_documents_classroom ON documents(classroom_id);
CREATE INDEX idx_documents_instructor ON documents(instructor_id);
CREATE INDEX idx_practice_classroom ON practice_sessions(classroom_id);
CREATE INDEX idx_practice_student ON practice_sessions(student_id);
CREATE INDEX idx_practice_instructor ON practice_sessions(instructor_id);
CREATE INDEX idx_comments_session ON practice_comments(practice_session_id);
CREATE INDEX idx_comments_author ON practice_comments(author_id);

-- Add comments to tables
COMMENT ON TABLE schedule_entries IS 'Schedule entries visible to instructor and all students in the classroom';
COMMENT ON TABLE notebooks IS 'Instructor-only notebooks, can be attached to schedule entries (attachment hidden from students)';
COMMENT ON TABLE documents IS 'Classroom-level documents visible to all students in the classroom';
COMMENT ON TABLE practice_sessions IS 'Student practice session uploads, visible only to instructor and uploading student';
COMMENT ON TABLE practice_comments IS 'Comments on practice sessions from instructor and student, triggers email notifications';
