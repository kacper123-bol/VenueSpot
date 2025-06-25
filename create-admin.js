// Script to create a default admin user for testing
// Run this in the browser console after loading the page

(function createDefaultAdmin() {
    console.log('Creating default admin user...');
    
    try {
        // Initialize the database if needed
        if (!localStorage.getItem('venuespot_users')) {
            DatabaseManager.init();
        }
        
        // Create admin user
        const adminUser = DatabaseManager.users.create({
            email: 'admin@venuespot.com',
            password: 'admin123',
            firstName: 'System',
            lastName: 'Administrator',
            userType: 'admin'
        });
        
        console.log('✅ Default admin user created successfully!');
        console.log('📧 Email: admin@venuespot.com');
        console.log('🔑 Password: admin123');
        console.log('');
        console.log('To access the admin dashboard:');
        console.log('1. Log in with the above credentials');
        console.log('2. Click the "🛡️ Admin" link in the navigation');
        console.log('');
        console.log('Admin user details:', adminUser);
        
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('ℹ️ Admin user already exists!');
            console.log('📧 Email: admin@venuespot.com');
            console.log('🔑 Password: admin123');
        } else {
            console.error('❌ Error creating admin user:', error);
        }
    }
})();