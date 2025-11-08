-- Add missing review columns for loan application workflow
ALTER TABLE loan_applications 
ADD COLUMN IF NOT EXISTS review_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS reviewer_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS manager_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS loan_officer_id VARCHAR(100);

-- Add constraint for review_status
ALTER TABLE loan_applications 
ADD CONSTRAINT IF NOT EXISTS chk_review_status CHECK (review_status IN ('pending', 'under_review', 'approved', 'rejected', 'returned'));

-- Create index for review status
CREATE INDEX IF NOT EXISTS idx_loan_applications_review_status ON loan_applications(review_status);

-- Show updated table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'loan_applications' 
AND column_name LIKE '%review%'
ORDER BY column_name;