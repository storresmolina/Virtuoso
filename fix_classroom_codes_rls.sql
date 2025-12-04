-- Fix classroom_codes RLS policies for student joining
-- Run this in Supabase SQL Editor

-- Drop existing policies
drop policy if exists "Instructor can manage codes" on classroom_codes;
drop policy if exists "Students can view codes" on classroom_codes;
drop policy if exists "Anyone can view unused codes" on classroom_codes;

-- Instructors can manage codes for their classrooms
create policy "Instructors can manage codes"
  on classroom_codes for all
  using (
    exists (
      select 1 from classrooms c
      where c.id = classroom_codes.classroom_id and c.instructor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from classrooms c
      where c.id = classroom_codes.classroom_id and c.instructor_id = auth.uid()
    )
  );

-- CRITICAL: Allow any authenticated user to read codes (needed for joining)
-- They need to query by code to find the classroom_id and check if it's used
create policy "Authenticated users can view codes"
  on classroom_codes for select
  using (auth.role() = 'authenticated');

-- Allow the join process to mark codes as used
-- This should only happen through the API, but we need to allow updates
create policy "Users can mark codes as used when joining"
  on classroom_codes for update
  using (
    auth.role() = 'authenticated' and used = false
  )
  with check (
    used = true
  );
