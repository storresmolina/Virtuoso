-- Add optional description to classrooms
ALTER TABLE classrooms
ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN classrooms.description IS 'Optional description for the classroom shown to instructors/students.';
