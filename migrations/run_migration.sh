#!/bin/bash
# Run the database migration to add missing loan application columns

# Set your database connection details
DB_HOST="your-postgres-host.render.com"
DB_NAME="your_database_name"
DB_USER="your_username"
DB_PASSWORD="your_password"

# You can get these from your Render PostgreSQL dashboard
# External Database URL format: postgresql://username:password@host:port/database

echo "Running loan application table migration..."

# If you have the full DATABASE_URL, use this format:
# psql "$DATABASE_URL" -f /path/to/add_missing_loan_application_columns.sql

echo "Please run this SQL script in your PostgreSQL database:"
echo "File location: /home/soma/Documents/credit-coop-system/migrations/add_missing_loan_application_columns.sql"
echo ""
echo "To run via psql command line:"
echo "psql \$DATABASE_URL -f migrations/add_missing_loan_application_columns.sql"
echo ""
echo "Or copy and paste the SQL commands directly into your database management tool."