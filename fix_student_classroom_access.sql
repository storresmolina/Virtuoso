-- Allow students to view classrooms when joining via code
-- Run this in Supabase SQL Editor

-- Drop existing policies to recreate them properly
drop policy if exists "Instructors can manage their classrooms" on classrooms;
drop policy if exists "Students can view their classrooms" on classrooms;
drop policy if exists "Students can view classrooms via valid codes" on classrooms;

-- Instructors can manage their own classrooms (all operations)
create policy "Instructors can manage their classrooms"
  on classrooms for all
  using (auth.uid() = instructor_id)
  with check (auth.uid() = instructor_id);

-- Students can view classrooms they're members of
create policy "Students can view their classrooms"
  on classrooms for select
  using (
    exists (
      select 1 from classroom_members cm
      where cm.classroom_id = classrooms.id and cm.user_id = auth.uid()
    )
  );

-- CRITICAL: Allow anyone (authenticated) to read classroom info when they have a valid unused code
-- This is needed during the join process before they become a member
create policy "Anyone can view classrooms with valid codes"
  on classrooms for select
  using (
    exists (
      select 1 from classroom_codes cc
      where cc.classroom_id = classrooms.id 
        and cc.used = false
    )
  );
