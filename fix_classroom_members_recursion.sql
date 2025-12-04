-- Fix infinite recursion in classroom_members policies
-- Run this in Supabase SQL Editor

-- Drop all existing policies on classroom_members
drop policy if exists "Users can view their memberships" on classroom_members;
drop policy if exists "Instructors can view classroom members" on classroom_members;
drop policy if exists "Instructors can add members" on classroom_members;
drop policy if exists "Users can insert their own membership" on classroom_members;

-- SIMPLE, NON-RECURSIVE POLICIES

-- Users can view their own memberships (direct comparison, no recursion)
create policy "Users can view their memberships"
  on classroom_members for select
  using (auth.uid() = user_id);

-- Users can insert themselves as members (direct comparison, no recursion)
create policy "Users can insert their own membership"
  on classroom_members for insert
  with check (auth.uid() = user_id);

-- Instructors can view ALL classroom_members records for their classrooms
-- This uses a subquery but doesn't recurse back to classroom_members
create policy "Instructors can view their classroom members"
  on classroom_members for select
  using (
    classroom_id in (
      select id from classrooms where instructor_id = auth.uid()
    )
  );

-- Optional: Allow instructors to delete members from their classrooms
create policy "Instructors can remove members"
  on classroom_members for delete
  using (
    classroom_id in (
      select id from classrooms where instructor_id = auth.uid()
    )
  );
