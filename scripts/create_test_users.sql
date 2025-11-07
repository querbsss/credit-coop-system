-- Create test users for member portal login
-- Run this script in your PostgreSQL database

-- Create the member_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS member_users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    member_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_member_users_email ON member_users(user_email);
CREATE INDEX IF NOT EXISTS idx_member_users_member_number ON member_users(member_number);
CREATE INDEX IF NOT EXISTS idx_member_users_active ON member_users(is_active);

-- Insert test users
-- Password for all users: testpass123 (hashed with bcrypt)
INSERT INTO member_users (user_name, user_email, user_password, member_number, is_active) 
VALUES 
    ('Test User MEM001', 'mem001@example.com', '$2b$10$rLP.7EE/.JRbfwuuMbdteeFoBKCLfWQbgj9Y4Tnq.OItSGZRVQeE.', 'MEM001', true),
    ('Test User TEST123', 'test123@example.com', '$2b$10$rLP.7EE/.JRbfwuuMbdteeFoBKCLfWQbgj9Y4Tnq.OItSGZRVQeE.', 'TEST123', true)
ON CONFLICT (user_email) DO NOTHING;

-- Alternative: Update existing users if they exist
UPDATE member_users 
SET user_password = '$2b$10$rLP.7EE/.JRbfwuuMbdteeFoBKCLfWQbgj9Y4Tnq.OItSGZRVQeE.', is_active = true
WHERE member_number IN ('MEM001', 'TEST123');

-- Verify the users were created
SELECT 
    user_name, 
    user_email, 
    member_number, 
    is_active,
    created_at
FROM member_users 
WHERE member_number IN ('MEM001', 'TEST123')
ORDER BY member_number;

-- Show all active users (for debugging)
SELECT COUNT(*) as total_active_users FROM member_users WHERE is_active = true;