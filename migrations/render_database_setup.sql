-- Credit Cooperative System Database Setup for Render PostgreSQL
-- Run this script after creating your PostgreSQL database on Render

-- Create main database tables

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members table for member information
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    membership_number VARCHAR(50) UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    membership_status VARCHAR(50) DEFAULT 'active',
    shares_owned INTEGER DEFAULT 0,
    date_joined DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff table for staff/admin users
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    department VARCHAR(255),
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membership applications table
CREATE TABLE IF NOT EXISTS membership_applications (
    application_id SERIAL PRIMARY KEY,
    
    -- Basic membership information
    number_of_shares INTEGER,
    amount_subscribe DECIMAL(10,2),
    application_date DATE,
    membership_type VARCHAR(100),
    applicants_membership_number VARCHAR(50),
    
    -- Personal information
    last_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    suffix VARCHAR(50),
    address TEXT,
    contact_number VARCHAR(20),
    type_of_address VARCHAR(100),
    occupied_since DATE,
    email_address VARCHAR(255),
    date_of_birth DATE,
    place_of_birth VARCHAR(255),
    religion VARCHAR(100),
    age INTEGER,
    gender VARCHAR(20),
    civil_status VARCHAR(50),
    highest_educational_attainment VARCHAR(255),
    
    -- Family information
    spouse_full_name VARCHAR(255),
    fathers_full_name VARCHAR(255),
    mothers_maiden_name VARCHAR(255),
    number_of_dependents INTEGER,
    
    -- Professional information
    occupation VARCHAR(255),
    annual_income DECIMAL(12,2),
    tax_identification_number VARCHAR(50),
    identification_type VARCHAR(100),
    identification_number VARCHAR(100),
    employment_choice VARCHAR(100),
    
    -- Self employed details
    business_type VARCHAR(255),
    business_address TEXT,
    
    -- Employment details
    employer_trade_name VARCHAR(255),
    employer_tin_number VARCHAR(50),
    employer_phone_number VARCHAR(20),
    date_hired_from DATE,
    date_hired_to DATE,
    employment_occupation VARCHAR(255),
    employment_occupation_status VARCHAR(100),
    annual_monthly_indicator VARCHAR(50),
    employment_industry VARCHAR(255),
    
    -- Social and reference information
    facebook_account VARCHAR(255),
    reference_person VARCHAR(255),
    reference_address TEXT,
    reference_contact_number VARCHAR(20),
    
    -- File uploads
    profile_image_path VARCHAR(500),
    id_document_path VARCHAR(500),
    
    -- Application status
    status VARCHAR(50) DEFAULT 'pending',
    review_notes TEXT,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES staff(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    loan_number VARCHAR(50) UNIQUE NOT NULL,
    loan_type VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    term_months INTEGER NOT NULL,
    monthly_payment DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    application_date DATE DEFAULT CURRENT_DATE,
    approval_date DATE,
    disbursement_date DATE,
    maturity_date DATE,
    purpose TEXT,
    collateral TEXT,
    guarantor_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan applications table
CREATE TABLE IF NOT EXISTS loan_applications (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    application_number VARCHAR(50) UNIQUE,
    loan_type VARCHAR(100) NOT NULL,
    requested_amount DECIMAL(12,2) NOT NULL,
    purpose TEXT NOT NULL,
    term_requested INTEGER,
    monthly_income DECIMAL(10,2),
    other_income DECIMAL(10,2),
    total_expenses DECIMAL(10,2),
    collateral_description TEXT,
    guarantor_name VARCHAR(255),
    guarantor_contact VARCHAR(20),
    status VARCHAR(50) DEFAULT 'pending',
    documents_submitted BOOLEAN DEFAULT false,
    review_notes TEXT,
    reviewed_by INTEGER REFERENCES staff(id),
    review_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    loan_id INTEGER REFERENCES loans(id) ON DELETE CASCADE,
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL, -- 'loan_payment', 'share_capital', 'fee', etc.
    payment_method VARCHAR(50) NOT NULL, -- 'cash', 'bank_transfer', 'check', etc.
    payment_date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'completed',
    notes TEXT,
    processed_by INTEGER REFERENCES staff(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment references table for tracking payment methods
CREATE TABLE IF NOT EXISTS payment_references (
    id SERIAL PRIMARY KEY,
    reference_type VARCHAR(50) NOT NULL, -- 'gcash', 'maya', 'bank_account'
    reference_name VARCHAR(255) NOT NULL,
    reference_number VARCHAR(255) NOT NULL,
    account_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_membership_number ON members(membership_number);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_loans_member_id ON loans(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_loan_id ON payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_membership_applications_status ON membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_member_id ON loan_applications(member_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Insert default payment references
INSERT INTO payment_references (reference_type, reference_name, reference_number, account_name) VALUES
('gcash', 'GCash', '09123456789', 'Credit Cooperative'),
('maya', 'Maya (PayMaya)', '09123456789', 'Credit Cooperative'),
('bank_account', 'BDO Bank Account', '1234567890', 'Credit Cooperative'),
('bank_account', 'BPI Bank Account', '0987654321', 'Credit Cooperative')
ON CONFLICT DO NOTHING;

-- Create a default admin user (password should be changed after first login)
-- Default password: 'admin123' (hashed)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@creditcoop.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdXy41TbyCa2s5qJ6t2N4J8e8eL8gK5S', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Create admin staff record
INSERT INTO staff (user_id, employee_id, first_name, last_name, position, department, is_admin)
SELECT u.id, 'ADMIN001', 'System', 'Administrator', 'System Administrator', 'IT', true
FROM users u WHERE u.username = 'admin'
ON CONFLICT (employee_id) DO NOTHING;

-- Add triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_membership_applications_updated_at BEFORE UPDATE ON membership_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON loan_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_references_updated_at BEFORE UPDATE ON payment_references FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your security requirements)
-- These commands should be run by a database admin
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- Verification queries - run these to verify the setup
SELECT 'Database setup completed successfully!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;