const membersPool = require('./db_members');

async function resetMemberUsersTable() {
    try {
        // Drop existing table if it exists
        await membersPool.query(`
            DROP TABLE IF EXISTS member_users CASCADE
        `);

        console.log('Creating member_users table...');
        // Create the table with explicit column names
        await membersPool.query(`
            CREATE TABLE IF NOT EXISTS member_users (
                user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_name VARCHAR(255) NOT NULL,
                user_email VARCHAR(255) NOT NULL UNIQUE,
                user_password VARCHAR(255) NOT NULL,
                member_number VARCHAR(50) UNIQUE,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            )
        `);
        
        // Create indexes
        await membersPool.query(`CREATE INDEX idx_member_users_email ON member_users(user_email)`);
        await membersPool.query(`CREATE INDEX idx_member_users_member_number ON member_users(member_number)`);
        await membersPool.query(`CREATE INDEX idx_member_users_active ON member_users(is_active)`);
        
        console.log('Table reset successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error resetting table:', err);
        process.exit(1);
    }
}

resetMemberUsersTable();