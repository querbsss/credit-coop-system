-- Fix the jpg_file_path column constraint issue

-- Option 1: Make jpg_file_path nullable (if it exists)
ALTER TABLE loan_applications 
ALTER COLUMN jpg_file_path DROP NOT NULL;

-- Option 2: If jpg_file_path should be the same as gov_id_file_path, rename it
-- ALTER TABLE loan_applications 
-- RENAME COLUMN jpg_file_path TO gov_id_file_path;

-- Option 3: Add a default value to jpg_file_path
-- ALTER TABLE loan_applications 
-- ALTER COLUMN jpg_file_path SET DEFAULT '';

-- Check what columns actually exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'loan_applications' 
AND column_name LIKE '%file%'
ORDER BY column_name;