-- COMPREHENSIVE RLS POLICY FIX
-- Run this entire script in Supabase SQL Editor to fix all policy issues

-- ========================================
-- 1. PROFILES TABLE
-- ========================================
alter table profiles enable row level security;

-- Drop all existing profile policies
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Enable insert for authenticated users" on profiles;
drop policy if exists "Enable read access for all users" on profiles;
drop policy if exists "Enable update for users based on id" on profiles;
drop policy if exists "Instructors can view their students" on profiles;

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

-- Instructors can view profiles of students in their classrooms
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

-- ========================================
-- 2. CLASSROOMS TABLE
-- ========================================
alter table classrooms enable row level security;

drop policy if exists "Instructors can manage their classrooms" on classrooms;
drop policy if exists "Students can view their classrooms" on classrooms;
drop policy if exists "Students can view classrooms via valid codes" on classrooms;
drop policy if exists "Anyone can view classrooms with valid codes" on classrooms;

-- Instructors can manage their own classrooms
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

-- Allow authenticated users to view classrooms with valid unused codes (needed for joining)
create policy "Anyone can view classrooms with valid codes"
  on classrooms for select
  using (
    exists (
      select 1 from classroom_codes cc
      where cc.classroom_id = classrooms.id 
        and cc.used = false
    )
  );

-- ========================================
-- 3. CLASSROOM_MEMBERS TABLE
-- ========================================
alter table classroom_members enable row level security;

drop policy if exists "Users can view their memberships" on classroom_members;
drop policy if exists "Instructors can view classroom members" on classroom_members;
drop policy if exists "Instructors can add members" on classroom_members;
drop policy if exists "Users can insert their own membership" on classroom_members;

-- Users can view their own memberships
create policy "Users can view their memberships"
  on classroom_members for select
  using (auth.uid() = user_id);

-- Instructors can view members of their classrooms
create policy "Instructors can view classroom members"
  on classroom_members for select
  using (
    exists (
      select 1 from classrooms c
      where c.id = classroom_members.classroom_id and c.instructor_id = auth.uid()
    )
  );

-- Allow users to insert themselves as members (needed during join process)
create policy "Users can insert their own membership"
  on classroom_members for insert
  with check (auth.uid() = user_id);

-- ========================================
-- 4. CLASSROOM_CODES TABLE
-- ========================================
alter table classroom_codes enable row level security;

drop policy if exists "Instructor can manage codes" on classroom_codes;
drop policy if exists "Instructors can manage codes" on classroom_codes;
drop policy if exists "Students can view codes" on classroom_codes;
drop policy if exists "Anyone can view unused codes" on classroom_codes;
drop policy if exists "Authenticated users can view codes" on classroom_codes;
drop policy if exists "Users can mark codes as used when joining" on classroom_codes;

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

-- Allow any authenticated user to read codes (needed for joining)
create policy "Authenticated users can view codes"
  on classroom_codes for select
  using (auth.role() = 'authenticated');

-- Allow users to mark codes as used when joining
create policy "Users can mark codes as used"
  on classroom_codes for update
  using (auth.role() = 'authenticated' and used = false)
  with check (used = true);

-- ========================================
-- 5. MEMBERSHIP_TIERS TABLE
-- ========================================
alter table membership_tiers enable row level security;

drop policy if exists "Anyone can view tiers" on membership_tiers;

-- Everyone can read membership tiers (public information)
create policy "Anyone can view tiers"
  on membership_tiers for select
  using (true);
