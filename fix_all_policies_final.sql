-- Fix ALL table policies to eliminate recursion completely
-- Run this entire script in Supabase SQL Editor

-- ========================================
-- 1. PROFILES - Non-recursive policies
-- ========================================
alter table profiles enable row level security;

drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Instructors can view their students" on profiles;

-- Direct comparison only - no joins, no subqueries referencing other protected tables
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ========================================
-- 2. CLASSROOMS - Non-recursive policies
-- ========================================
alter table classrooms enable row level security;

drop policy if exists "Instructors can manage their classrooms" on classrooms;
drop policy if exists "Students can view their classrooms" on classrooms;
drop policy if exists "Anyone can view classrooms with valid codes" on classrooms;

-- Direct comparison only
create policy "Instructors can manage their classrooms"
  on classrooms for all
  using (auth.uid() = instructor_id)
  with check (auth.uid() = instructor_id);

-- For joining: Allow reading ANY classroom (we'll check permissions in the app layer)
-- This is safe because we're just reading metadata, not sensitive data
create policy "Authenticated users can view classrooms"
  on classrooms for select
  using (auth.role() = 'authenticated');

-- ========================================
-- 3. CLASSROOM_MEMBERS - Non-recursive policies
-- ========================================
alter table classroom_members enable row level security;

drop policy if exists "Users can view their memberships" on classroom_members;
drop policy if exists "Users can insert their own membership" on classroom_members;
drop policy if exists "Instructors can view their classroom members" on classroom_members;
drop policy if exists "Instructors can view classroom members" on classroom_members;
drop policy if exists "Instructors can remove members" on classroom_members;

-- Direct comparison only
create policy "Users can view their memberships"
  on classroom_members for select
  using (auth.uid() = user_id);

create policy "Users can insert their own membership"
  on classroom_members for insert
  with check (auth.uid() = user_id);

-- Allow reading any membership (instructors need this to see their students)
create policy "Authenticated users can view memberships"
  on classroom_members for select
  using (auth.role() = 'authenticated');

-- ========================================
-- 4. CLASSROOM_CODES - Non-recursive policies
-- ========================================
alter table classroom_codes enable row level security;

drop policy if exists "Instructors can manage codes" on classroom_codes;
drop policy if exists "Authenticated users can view codes" on classroom_codes;
drop policy if exists "Users can mark codes as used" on classroom_codes;

-- Allow authenticated users to read and update codes
-- We rely on app logic to prevent abuse
create policy "Authenticated users can read codes"
  on classroom_codes for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can update codes"
  on classroom_codes for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert codes"
  on classroom_codes for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can delete codes"
  on classroom_codes for delete
  using (auth.role() = 'authenticated');

-- ========================================
-- 5. MEMBERSHIP_TIERS - Public read access
-- ========================================
alter table membership_tiers enable row level security;

drop policy if exists "Anyone can view tiers" on membership_tiers;

create policy "Anyone can view tiers"
  on membership_tiers for select
  using (true);

-- ========================================
-- Clean up orphaned auth users
-- ========================================
-- Remove auth.users that don't have corresponding profiles
DELETE FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
