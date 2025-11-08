-- Simple schema to add/update specific columns with correct data types

-- Add the columns with correct data types
ALTER TABLE loan_applications 
ADD COLUMN IF NOT EXISTS years_of_stay_current DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS years_of_stay_permanent DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS years_in_company DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS number_of_children INTEGER;

-- If columns already exist with wrong type, you'll need to drop and recreate them
-- Uncomment these lines if you need to replace existing columns:

-- DROP COLUMN IF EXISTS years_of_stay_current CASCADE;
-- DROP COLUMN IF EXISTS years_of_stay_permanent CASCADE;  
-- DROP COLUMN IF EXISTS years_in_company CASCADE;
-- DROP COLUMN IF EXISTS number_of_children CASCADE;

-- Then add them back with correct types:
-- ADD COLUMN years_of_stay_current DECIMAL(5,2),
-- ADD COLUMN years_of_stay_permanent DECIMAL(5,2),
-- ADD COLUMN years_in_company DECIMAL(5,2),
-- ADD COLUMN number_of_children INTEGER;