const database = require('../database');
const { hashPassword } = require('../middleware/auth');

// Test script to create an admin user with username admin1234
async function testAdminCreation() {
    console.log('🧪 Testing Admin Creation with username: admin1234');
    console.log('================================================');
    
    try {
        // Wait for database connection
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if user already exists
        console.log('🔍 Checking if admin1234 already exists...');
        const existingUser = await database.get('SELECT * FROM users WHERE email = ?', ['admin1234@venuespot.com']);
        
        if (existingUser) {
            console.log('⚠️  User admin1234@venuespot.com already exists:');
            console.log('   ID:', existingUser.id);
            console.log('   Name:', existingUser.first_name, existingUser.last_name);
            console.log('   Type:', existingUser.user_type);
            console.log('   Created:', existingUser.created_at);
            return existingUser;
        }
        
        // Hash the password
        console.log('🔐 Hashing password...');
        const passwordHash = await hashPassword('admin123');
        
        // Create the admin user
        console.log('👤 Creating admin user...');
        const result = await database.run(`
            INSERT INTO users (email, password_hash, first_name, last_name, user_type, created_at, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            'admin1234@venuespot.com',
            passwordHash,
            'Admin',
            'User1234',
            'admin',
            new Date().toISOString(),
            1
        ]);
        
        console.log('✅ Admin user created successfully!');
        console.log('   ID:', result.lastID);
        console.log('   Email: admin1234@venuespot.com');
        console.log('   Password: admin123');
        console.log('   Name: Admin User1234');
        console.log('   Type: admin');
        
        // Verify the user was created
        console.log('🔍 Verifying user creation...');
        const createdUser = await database.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
        
        if (createdUser) {
            console.log('✅ Verification successful! User details:');
            console.log('   ID:', createdUser.id);
            console.log('   Email:', createdUser.email);
            console.log('   Name:', createdUser.first_name, createdUser.last_name);
            console.log('   Type:', createdUser.user_type);
            console.log('   Active:', createdUser.is_active ? 'Yes' : 'No');
            console.log('   Created:', createdUser.created_at);
        } else {
            console.error('❌ Verification failed! User not found after creation.');
            return null;
        }
        
        // Test login functionality
        console.log('🔐 Testing login functionality...');
        const bcrypt = require('bcrypt');
        const passwordValid = await bcrypt.compare('admin123', createdUser.password_hash);
        
        if (passwordValid) {
            console.log('✅ Password verification successful!');
        } else {
            console.error('❌ Password verification failed!');
        }
        
        // Show database stats
        console.log('📊 Current database statistics:');
        const stats = await database.getStats();
        console.log('   Total Users:', stats.users.count);
        console.log('   Total Venues:', stats.venues.count);
        console.log('   Active Sessions:', stats.sessions.count);
        
        return createdUser;
        
    } catch (error) {
        console.error('❌ Error during admin creation test:', error.message);
        console.error('Stack trace:', error.stack);
        return null;
    }
}

// Test API registration endpoint
async function testAPIRegistration() {
    console.log('\n🌐 Testing API Registration Endpoint');
    console.log('=====================================');
    
    try {
        const fetch = require('node-fetch');
        
        const response = await fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin5678@venuespot.com',
                password: 'admin123',
                firstName: 'API',
                lastName: 'Admin',
                userType: 'admin'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ API registration successful!');
            console.log('   Email: admin5678@venuespot.com');
            console.log('   Password: admin123');
            console.log('   User:', result.user);
        } else {
            console.log('⚠️  API registration response:', result);
            
            if (result.error && result.error.includes('already exists')) {
                console.log('ℹ️  User already exists via API');
            }
        }
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
        console.log('💡 Make sure the backend server is running on port 3001');
        console.log('   Start with: cd backend && npm run dev');
    }
}

// Main test function
async function runTests() {
    console.log('🎯 VenueSpot Admin Creation Test');
    console.log('================================\n');
    
    // Test 1: Direct database creation
    const dbResult = await testAdminCreation();
    
    // Test 2: API endpoint
    await testAPIRegistration();
    
    console.log('\n🏁 Test Complete!');
    console.log('=================');
    
    if (dbResult) {
        console.log('✅ Database admin creation: SUCCESS');
        console.log('📧 Login credentials for testing:');
        console.log('   Email: admin1234@venuespot.com');
        console.log('   Password: admin123');
    } else {
        console.log('❌ Database admin creation: FAILED');
    }
    
    console.log('\n💡 Next steps:');
    console.log('1. Start the backend: cd backend && npm run dev');
    console.log('2. Start the frontend on port 3000');
    console.log('3. Login with the admin credentials');
    console.log('4. Look for the "🛡️ Admin" link in navigation');
}

// Run if called directly
if (require.main === module) {
    runTests()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { testAdminCreation, testAPIRegistration };