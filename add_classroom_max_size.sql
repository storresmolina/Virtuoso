-- Add max_size column to classrooms table
-- This allows each classroom to have its own size limit based on the instructor's membership tier

ALTER TABLE classrooms 
ADD COLUMN IF NOT EXISTS max_size INTEGER;

-- Add a comment explaining the column
COMMENT ON COLUMN classrooms.max_size IS 'Maximum number of students allowed in this classroom. NULL means unlimited (premium tier).';

-- Update existing classrooms to have a default max_size of 1 (for free tier users)
-- This can be adjusted manually later if needed
UPDATE classrooms 
SET max_size = 1 
WHERE max_size IS NULL;
