-- Fix profiles table recursion and allow proper registration
-- Run this in Supabase SQL Editor

-- Drop all existing profile policies
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Enable insert for authenticated users" on profiles;
drop policy if exists "Enable read access for all users" on profiles;
drop policy if exists "Enable update for users based on id" on profiles;
drop policy if exists "Instructors can view their students" on profiles;

-- SIMPLE, NON-RECURSIVE POLICIES

-- Allow users to read their own profile (direct comparison)
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- Allow users to insert their own profile (direct comparison)
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Allow users to update their own profile (direct comparison)
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Instructors can view students in their classrooms
-- Simplified to avoid recursion
create policy "Instructors can view their students"
  on profiles for select
  using (
    id in (
      select user_id 
      from classroom_members 
      where classroom_id in (
        select id from classrooms where instructor_id = auth.uid()
      )
    )
  );

-- Now clean up orphaned auth users that don't have profiles
-- This will help with the "User already registered" issue
-- You can manually delete them or run this query:

-- First, let's see which auth users don't have profiles:
-- SELECT au.id, au.email, au.created_at
-- FROM auth.users au
-- LEFT JOIN profiles p ON p.id = au.id
-- WHERE p.id IS NULL;

-- To delete orphaned auth users (BE CAREFUL - only run if you're sure):
-- DELETE FROM auth.users
-- WHERE id NOT IN (SELECT id FROM profiles);
