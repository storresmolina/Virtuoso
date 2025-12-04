-- Fix infinite recursion in profiles table RLS policies
-- Run this in Supabase SQL Editor

-- Enable RLS on profiles if not already
alter table profiles enable row level security;

-- Drop all existing policies to start fresh
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Enable insert for authenticated users" on profiles;
drop policy if exists "Enable read access for all users" on profiles;
drop policy if exists "Enable update for users based on id" on profiles;

-- Create simple, non-recursive policies
-- Allow users to read their own profile
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- Allow users to insert their own profile (needed during registration)
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Instructors can view student profiles in their classrooms
create policy "Instructors can view their students"
  on profiles for select
  using (
    exists (
      select 1 
      from classroom_members cm
      join classrooms c on c.id = cm.classroom_id
      where cm.user_id = profiles.id 
        and c.instructor_id = auth.uid()
    )
  );
