const bcrypt = require('bcrypt');

// Password hashes from your database
const mem001Hash = '$2b$10$yN8dbSMQGmfm2QlweJSZuGSuuaRUmAFrEb8vdX4j8F2kvzXKj5Vy';
const test123Hash = '$2b$10$hypMRU1Zl8V83RIlYtgZoONQgptHRWM.c1zOToBifs6C8TjoFbINy';

// Common passwords to test
const commonPasswords = [
    'password',
    'password123',
    'testpass123',
    'admin',
    'admin123',
    'test123',
    'MEM001',
    'TEST123',
    'valencia',
    'querby',
    '123456',
    'welcome'
];

async function testPasswords() {
    console.log('🔍 Testing passwords for MEM001...');
    for (const password of commonPasswords) {
        const isValid = await bcrypt.compare(password, mem001Hash);
        if (isValid) {
            console.log(`✅ MEM001 password found: "${password}"`);
        }
    }
    
    console.log('\n🔍 Testing passwords for TEST123...');
    for (const password of commonPasswords) {
        const isValid = await bcrypt.compare(password, test123Hash);
        if (isValid) {
            console.log(`✅ TEST123 password found: "${password}"`);
        }
    }
    
    // Test the specific password we know for TEST123
    console.log('\n🔍 Verifying known TEST123 password...');
    const test123Valid = await bcrypt.compare('testpass123', test123Hash);
    console.log(`testpass123 for TEST123: ${test123Valid ? '✅ VALID' : '❌ INVALID'}`);
}

testPasswords().catch(console.error);