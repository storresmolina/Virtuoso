# Classroom and Student Management Updates

## Overview
This update removes hardcoded student data and implements a dynamic classroom management system with real Supabase data.

## Key Changes

### 1. **Database Schema**
- Added `max_size` column to `classrooms` table
- Each classroom now stores its own maximum student capacity
- Run `add_classroom_max_size.sql` to apply the migration

### 2. **Classroom Creation**
- New modal dialog (`CreateClassroomModal.tsx`) for creating classrooms
- Instructors specify:
  - Classroom name
  - Maximum students (restricted by membership tier)
- Free tier: Limited to 1 student per classroom (Private Instruction)
- Premium tier: Unlimited students per classroom

### 3. **Instructor Dashboard**
- Completely redesigned to show classrooms as cards
- Each card displays:
  - Classroom name (or "Private Instruction" for single-student classrooms)
  - Current student count vs. max capacity
  - Warning when classroom is full
- Empty state with call-to-action to create first classroom

### 4. **Students Tab**
- **Removed hardcoded data** from `students.ts`
- Now fetches real data from Supabase via `getInstructorStudents()`
- Shows all students across all instructor's classrooms
- Features:
  - Filter by classroom
  - Search by name or email
  - Displays classroom name (or "Private Instruction" for 1:1 classes)
  - Shows join date
  - Empty state when no students exist

### 5. **API Functions** (`supabaseApi.ts`)
- Updated `createClassroom()` to accept `maxSize` parameter
- Added `getInstructorStudents()` to fetch all students with classroom info
- Updated `joinClassroomByCode()` to check classroom-specific `max_size`
- Simplified membership tier checking

### 6. **AuthContext**
- Updated `createClassroom` to support `maxSize` parameter
- Exported `getInstructorStudents` for use in components

## User Flow

### Creating a Classroom:
1. Instructor clicks "Create Classroom" button
2. Modal opens with form fields
3. Enters classroom name
4. Sees max students (auto-filled based on tier, editable for Premium)
5. Clicks "Create Classroom"
6. New classroom card appears on dashboard

### Viewing Students:
1. Instructor navigates to "Students" tab
2. Sees table of all students across all classrooms
3. Can filter by specific classroom
4. Can search by name or email
5. Classroom shows as "Private Instruction" for 1:1 classes
6. Click "Open Classroom" to view student's documents and notebooks

## Benefits

✅ **No more hardcoded data** - Everything is dynamic from Supabase  
✅ **Flexible classroom sizes** - Each classroom has its own capacity  
✅ **Better UX** - Visual cards, clear capacity indicators  
✅ **Tier enforcement** - Free users limited to private instruction  
✅ **Scalable** - Supports multiple classrooms and students  
✅ **Private instruction** - Special handling for 1:1 teaching  

## Next Steps

To fully implement this in production:
1. Run the SQL migration: `add_classroom_max_size.sql`
2. Test classroom creation with both Free and Premium accounts
3. Add practice session tracking to student data
4. Implement classroom detail view (currently just navigates)
5. Add ability to generate and manage classroom codes from dashboard
