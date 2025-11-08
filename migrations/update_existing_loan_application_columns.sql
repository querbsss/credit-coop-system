-- Update existing loan_applications table columns
-- This script modifies existing columns and adds missing ones

-- First, add any completely missing columns
ALTER TABLE loan_applications 
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS date_filed DATE,
ADD COLUMN IF NOT EXISTS loan_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS membership_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS civil_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS landline VARCHAR(20),
ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS email_address VARCHAR(255),
ADD COLUMN IF NOT EXISTS current_address TEXT,
ADD COLUMN IF NOT EXISTS permanent_address TEXT,
ADD COLUMN IF NOT EXISTS home_ownership VARCHAR(50),
ADD COLUMN IF NOT EXISTS spouse_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS date_hired DATE,
ADD COLUMN IF NOT EXISTS company_business TEXT,
ADD COLUMN IF NOT EXISTS contract_period VARCHAR(100),
ADD COLUMN IF NOT EXISTS designation_position VARCHAR(100),
ADD COLUMN IF NOT EXISTS gov_id_file_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS company_id_file_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Now handle the columns that need type changes (from INTEGER to DECIMAL)
-- Add new DECIMAL columns first
ALTER TABLE loan_applications 
ADD COLUMN IF NOT EXISTS years_of_stay_current_new DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS years_of_stay_permanent_new DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS years_in_company_new DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS number_of_children_new INTEGER;

-- Copy data from old columns to new columns (if old columns exist)
DO $$
BEGIN
    -- Copy years_of_stay_current if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_applications' AND column_name = 'years_of_stay_current') THEN
        UPDATE loan_applications SET years_of_stay_current_new = years_of_stay_current::DECIMAL(5,2);
        ALTER TABLE loan_applications DROP COLUMN years_of_stay_current;
    END IF;
    
    -- Copy years_of_stay_permanent if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_applications' AND column_name = 'years_of_stay_permanent') THEN
        UPDATE loan_applications SET years_of_stay_permanent_new = years_of_stay_permanent::DECIMAL(5,2);
        ALTER TABLE loan_applications DROP COLUMN years_of_stay_permanent;
    END IF;
    
    -- Copy years_in_company if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_applications' AND column_name = 'years_in_company') THEN
        UPDATE loan_applications SET years_in_company_new = years_in_company::DECIMAL(5,2);
        ALTER TABLE loan_applications DROP COLUMN years_in_company;
    END IF;
    
    -- Copy number_of_children if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_applications' AND column_name = 'number_of_children') THEN
        UPDATE loan_applications SET number_of_children_new = number_of_children;
        ALTER TABLE loan_applications DROP COLUMN number_of_children;
    END IF;
END $$;

-- Rename the new columns to the correct names
ALTER TABLE loan_applications 
RENAME COLUMN years_of_stay_current_new TO years_of_stay_current;

ALTER TABLE loan_applications 
RENAME COLUMN years_of_stay_permanent_new TO years_of_stay_permanent;

ALTER TABLE loan_applications 
RENAME COLUMN years_in_company_new TO years_in_company;

ALTER TABLE loan_applications 
RENAME COLUMN number_of_children_new TO number_of_children;

-- Add constraints for the new columns
ALTER TABLE loan_applications 
ADD CONSTRAINT IF NOT EXISTS chk_gender_new CHECK (gender IN ('Male', 'Female', 'Other')),
ADD CONSTRAINT IF NOT EXISTS chk_civil_status_new CHECK (civil_status IN ('Single', 'Married', 'Divorced', 'Widowed', 'Separated'));

-- Create indexes for better performance on the new columns
CREATE INDEX IF NOT EXISTS idx_loan_applications_user_id_new ON loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_submitted_at_new ON loan_applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_loan_applications_last_name_new ON loan_applications(last_name);
CREATE INDEX IF NOT EXISTS idx_loan_applications_date_filed_new ON loan_applications(date_filed);

-- Update the updated_at trigger to work with the new structure
DROP TRIGGER IF EXISTS update_loan_applications_updated_at ON loan_applications;

CREATE OR REPLACE FUNCTION update_loan_applications_updated_at_new()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_loan_applications_updated_at_new
    BEFORE UPDATE ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_loan_applications_updated_at_new();

-- Verify the changes
SELECT 'Loan applications table updated successfully!' as status;

-- Show the updated table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'loan_applications' 
ORDER BY ordinal_position;