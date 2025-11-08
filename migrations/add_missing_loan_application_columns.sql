-- Add missing columns to loan_applications table
-- This script adds all the required columns that the backend expects

-- First, let's add the missing columns
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
ADD COLUMN IF NOT EXISTS years_of_stay_current DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS permanent_address TEXT,
ADD COLUMN IF NOT EXISTS years_of_stay_permanent DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS home_ownership VARCHAR(50),
ADD COLUMN IF NOT EXISTS spouse_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS number_of_children INTEGER,
ADD COLUMN IF NOT EXISTS date_hired DATE,
ADD COLUMN IF NOT EXISTS company_business TEXT,
ADD COLUMN IF NOT EXISTS contract_period VARCHAR(100),
ADD COLUMN IF NOT EXISTS designation_position VARCHAR(100),
ADD COLUMN IF NOT EXISTS years_in_company DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS gov_id_file_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS company_id_file_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

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