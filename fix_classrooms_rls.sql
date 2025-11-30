-- Fix RLS policies for classrooms table
-- Run this in Supabase SQL Editor if you're getting 400 errors when creating classrooms

-- Ensure RLS is enabled
alter table classrooms enable row level security;

-- Drop existing policy if any
drop policy if exists "Instructors can manage their classrooms" on classrooms;

-- Recreate the policy for instructors to manage their classrooms
create policy "Instructors can manage their classrooms"
  on classrooms for all
  using (auth.uid() = instructor_id)
  with check (auth.uid() = instructor_id);

-- Also ensure students can view classrooms they're members of (for future use)
drop policy if exists "Students can view their classrooms" on classrooms;
create policy "Students can view their classrooms"
  on classrooms for select
  using (
    exists (
      select 1 from classroom_members cm
      where cm.classroom_id = classrooms.id and cm.user_id = auth.uid()
    )
  );
