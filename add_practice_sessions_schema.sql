-- Add practice sessions and documents tables
-- Run this in Supabase SQL Editor

-- ========================================
-- 1. DOCUMENTS TABLE
-- Store sheet music and other files uploaded by instructors
-- ========================================
create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  classroom_id uuid references classrooms(id) on delete cascade not null,
  uploaded_by uuid references auth.users(id) on delete cascade not null,
  title text not null,
  file_name text not null,
  file_url text not null, -- Supabase Storage URL
  file_type text, -- 'sheet_music', 'reference', 'assignment'
  file_size bigint, -- in bytes
  visible boolean default true, -- instructors can hide documents from students
  created_at timestamp with time zone default now()
);

alter table documents enable row level security;

-- Instructors can manage documents in their classrooms
create policy "Instructors can manage their documents"
  on documents for all
  using (
    classroom_id in (
      select id from classrooms where instructor_id = auth.uid()
    )
  )
  with check (
    classroom_id in (
      select id from classrooms where instructor_id = auth.uid()
    )
  );

-- Students can view visible documents in their classrooms
create policy "Students can view visible documents"
  on documents for select
  using (
    visible = true and
    classroom_id in (
      select classroom_id from classroom_members where user_id = auth.uid()
    )
  );

-- ========================================
-- 2. PRACTICE_SESSIONS TABLE
-- Store student practice recordings linked to documents
-- ========================================
create table if not exists practice_sessions (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references auth.users(id) on delete cascade not null,
  classroom_id uuid references classrooms(id) on delete cascade not null,
  document_id uuid references documents(id) on delete set null,
  audio_url text not null, -- Supabase Storage URL for audio file
  notes text, -- student's notes
  feedback text, -- instructor's feedback
  ai_analysis jsonb, -- AI analysis results
  status text default 'pending_review', -- 'pending_review', 'reviewed'
  created_at timestamp with time zone default now(),
  reviewed_at timestamp with time zone
);

alter table practice_sessions enable row level security;

-- Students can manage their own practice sessions
create policy "Students can manage own sessions"
  on practice_sessions for all
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- Instructors can view and update practice sessions in their classrooms
create policy "Instructors can view classroom sessions"
  on practice_sessions for select
  using (
    classroom_id in (
      select id from classrooms where instructor_id = auth.uid()
    )
  );

create policy "Instructors can update classroom sessions"
  on practice_sessions for update
  using (
    classroom_id in (
      select id from classrooms where instructor_id = auth.uid()
    )
  );

-- ========================================
-- 3. INDEXES for performance
-- ========================================
create index if not exists idx_documents_classroom on documents(classroom_id);
create index if not exists idx_documents_visible on documents(visible);
create index if not exists idx_practice_sessions_student on practice_sessions(student_id);
create index if not exists idx_practice_sessions_classroom on practice_sessions(classroom_id);
create index if not exists idx_practice_sessions_status on practice_sessions(status);

-- ========================================
-- 4. STORAGE BUCKETS (run these separately if needed)
-- ========================================
-- You'll need to create these buckets in Supabase Dashboard → Storage
-- 1. Create bucket: 'documents' (for sheet music/PDFs)
-- 2. Create bucket: 'practice-recordings' (for audio files)
-- 
-- Storage policies (run after creating buckets):
-- 
-- For 'documents' bucket:
-- Instructors can upload:
-- insert into storage.objects (bucket_id, name, owner, metadata)
-- policy: auth.uid() in (select instructor_id from classrooms)
--
-- For 'practice-recordings' bucket:
-- Students can upload their own recordings
-- policy: auth.uid() = metadata->>'student_id'
