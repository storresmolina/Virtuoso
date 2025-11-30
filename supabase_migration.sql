-- SCHEMA MIGRATION: Classrooms + Membership Tiers
-- Run this in Supabase SQL Editor

-- 1. Create membership_tiers table (defines free vs premium)
create table if not exists membership_tiers (
  id text primary key,
  name text not null,
  max_students int, -- null = unlimited
  ai_analysis_enabled boolean default false,
  price_monthly decimal(10,2) default 0,
  created_at timestamp with time zone default now()
);

-- Seed tiers
insert into membership_tiers (id, name, max_students, ai_analysis_enabled, price_monthly) values
  ('free', 'Free', 1, false, 0),
  ('premium', 'Premium', null, true, 29.99)
on conflict (id) do nothing;

-- 2. Add tier to profiles (instructors only)
alter table profiles add column if not exists membership_tier text default 'free' references membership_tiers(id);

-- 3. Create classrooms table
create table if not exists classrooms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  instructor_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

alter table classrooms enable row level security;

-- Instructors can manage their own classrooms
create policy "Instructors can manage their classrooms"
  on classrooms for all
  using (auth.uid() = instructor_id);

-- 4. Create classroom_members junction table
create table if not exists classroom_members (
  id uuid default gen_random_uuid() primary key,
  classroom_id uuid references classrooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamp with time zone default now(),
  unique(classroom_id, user_id)
);

alter table classroom_members enable row level security;

-- Members can view their own memberships
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

-- Instructors can add members to their classrooms
create policy "Instructors can add members"
  on classroom_members for insert
  with check (
    exists (
      select 1 from classrooms c
      where c.id = classroom_members.classroom_id and c.instructor_id = auth.uid()
    )
  );

-- 5. Update classroom_codes to reference classrooms
alter table classroom_codes add column if not exists classroom_id uuid references classrooms(id) on delete cascade;

-- Update policies for codes (only instructors of that classroom can manage)
drop policy if exists "Instructor can manage codes" on classroom_codes;
create policy "Instructor can manage codes"
  on classroom_codes for all
  using (
    exists (
      select 1 from classrooms c
      where c.id = classroom_codes.classroom_id and c.instructor_id = auth.uid()
    )
  );

-- 6. Migrate existing data (if any students have classroom_code in profiles)
-- Create a default classroom for each instructor who has codes
do $$
declare
  rec record;
begin
  for rec in 
    select distinct p.id as instructor_id, p.name as instructor_name
    from profiles p
    where p.role = 'instructor'
  loop
    insert into classrooms (name, instructor_id)
    values (rec.instructor_name || '''s Classroom', rec.instructor_id)
    on conflict do nothing;
  end loop;
end $$;

-- Link existing codes to newly created classrooms
update classroom_codes cc
set classroom_id = (
  select c.id from classrooms c
  where c.instructor_id = (
    select p.id from profiles p where p.role = 'instructor' limit 1
  )
  limit 1
)
where cc.classroom_id is null;

-- Migrate students who have classroom_code to classroom_members
do $$
declare
  rec record;
  target_classroom uuid;
begin
  for rec in 
    select p.id as student_id, p.classroom_code
    from profiles p
    where p.role = 'student' and p.classroom_code is not null
  loop
    -- Find classroom by code
    select cc.classroom_id into target_classroom
    from classroom_codes cc
    where cc.code = rec.classroom_code
    limit 1;
    
    if target_classroom is not null then
      insert into classroom_members (classroom_id, user_id)
      values (target_classroom, rec.student_id)
      on conflict do nothing;
    end if;
  end loop;
end $$;

-- 7. Optional: Remove classroom_code from profiles (keep for now for backwards compat)
-- alter table profiles drop column if exists classroom_code;
