CREATE DATABASE staff_portal;

CREATE TABLE users(
    user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL
);

--INSERT TEST USER

INSERT INTO users (user_name, user_email, user_password) VALUES ('Test User', 'testuser@example.com', 'password123');