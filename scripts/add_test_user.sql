-- Add a test user with known credentials
-- Password will be: testpass123

INSERT INTO member_users (user_name, user_email, user_password, member_number, is_active) 
VALUES (
    'Test User Account',
    'testuser@example.com', 
    '$2b$10$rLP.7EE/.JRbfwuuMbdteeFoBKCLfWQbgj9Y4Tnq.OItSGZRVQeE.',  -- hashed 'testpass123'
    'TEST123',
    true
);

-- Verify the user was created
SELECT member_number, user_email, user_name, is_active FROM member_users WHERE member_number = 'TEST123';