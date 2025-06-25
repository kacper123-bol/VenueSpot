// Main Application Entry Point
const App = {
    init: async () => {
        // Wait for all dependencies to be loaded
        if (!window.AppConfig || !window.UIComponents || !window.ModalManager ||
            !window.VenueManager || !window.FeatureManager || !window.AnimationManager ||
            !window.FormTemplates || !window.DatabaseManager || !window.AuthManager ||
            !window.AdminManager) {
            console.error('Dependencies not loaded. Make sure all script files are included.');
            return;
        }

        // Initialize database and authentication system
        await DatabaseManager.init();
        AuthManager.init();
        AdminManager.init();

        // Render components
        FeatureManager.render();
        await VenueManager.renderVenues();
        
        // Create modals
        App.createModals();

        // Initialize managers
        ModalManager.init();
        AnimationManager.initSmoothScrolling();
        AnimationManager.initScrollAnimations();

        console.log('VenueSpot application initialized successfully!');
    },

    // Handle modal opened events
    handleModalOpened: (modalId) => {
        switch(modalId) {
            case 'profileModal':
                // Populate profile form when modal opens
                setTimeout(() => {
                    AuthManager.populateProfileForm();
                }, 100); // Small delay to ensure DOM is ready
                break;
            case 'customerModal':
                // Populate district dropdown when customer modal opens
                setTimeout(() => {
                    App.populateDistrictDropdown();
                }, 100);
                break;
        }
    },

    // Populate district dropdown with venue counts
    populateDistrictDropdown: async () => {
        const districtSelect = document.getElementById('districtSelect');
        if (districtSelect && VenueManager.getDistrictsWithCounts) {
            const districts = await VenueManager.getDistrictsWithCounts();
            
            // Clear existing options except "All districts"
            districtSelect.innerHTML = '<option value="all">All districts</option>';
            
            // Add districts with venue counts
            districts.forEach(({ district, count }) => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = `${district} (${count} venues)`;
                districtSelect.appendChild(option);
            });
        }
    },

    createModals: () => {
        const modalsContainer = document.getElementById('modalsContainer');
        if (modalsContainer) {
            const modals = [
                UIComponents.createModal('ownerModal', 'Venue Registration', FormTemplates.ownerForm, true), // Large modal for venue registration
                UIComponents.createModal('customerModal', 'Find the perfect venue for you', FormTemplates.customerForm),
                UIComponents.createModal('loginModal', 'Log in', FormTemplates.loginForm),
                UIComponents.createModal('registerModal', 'Create your account', FormTemplates.registerForm),
                UIComponents.createModal('profileModal', 'My Profile', FormTemplates.profileForm)
            ];
            modalsContainer.innerHTML = modals.join('');
        }
    },

    handleFormSubmissions: () => {
        // Add form submission handlers
        document.addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            const modalId = form.closest('.modal').id;
            
            switch(modalId) {
                case 'ownerModal':
                    App.handleOwnerFormSubmit(form);
                    break;
                case 'customerModal':
                    App.handleCustomerFormSubmit(form);
                    break;
                case 'loginModal':
                    App.handleLoginFormSubmit(form);
                    break;
                case 'registerModal':
                    App.handleRegisterFormSubmit(form);
                    break;
                case 'profileModal':
                    App.handleProfileFormSubmit(form);
                    break;
            }
        });
    },

    handleOwnerFormSubmit: (form) => {
        const formData = new FormData(form);
        
        // Check if user is authenticated
        if (!AuthManager.isAuthenticated()) {
            alert('Please log in first to submit a venue.');
            ModalManager.close('ownerModal');
            ModalManager.open('loginModal');
            return;
        }

        const currentUser = AuthManager.getCurrentUser();
        if (currentUser.userType !== 'owner') {
            alert('Only venue owners can submit venues.');
            return;
        }

        try {
            // Extract form data and prepare venue for approval
            const venueData = App.extractVenueData(formData);
            venueData.ownerUserId = currentUser.id;
            venueData.contact = {
                phone: venueData.phone,
                email: venueData.email,
                address: venueData.address
            };

            // Store in pending venues for admin approval
            const pendingVenues = JSON.parse(localStorage.getItem('venuespot_pending_venues') || '[]');
            const settings = DatabaseManager.getSettings();

            const pendingVenue = {
                id: settings.nextVenueId || Date.now(),
                ...venueData,
                status: 'pending',
                submittedAt: new Date().toISOString(),
                ownerUserId: currentUser.id
            };

            pendingVenues.push(pendingVenue);
            localStorage.setItem('venuespot_pending_venues', JSON.stringify(pendingVenues));

            // Update settings to increment venue ID counter
            settings.nextVenueId = (settings.nextVenueId || Date.now()) + 1;
            localStorage.setItem('venuespot_settings', JSON.stringify(settings));

            // Show success message with proper formatting
            alert(`Thank you for registering your venue. Please wait for the venue to be validated.\n\nYour venue "${venueData.name}" has been submitted for review and will be live once approved by our team.`);
            
            // Close modal (don't refresh venues since venue won't be displayed yet)
            ModalManager.close('ownerModal');

            console.log('Venue submitted for approval:', pendingVenue);
        } catch (error) {
            console.error('Error submitting venue:', error);
            alert('There was an error submitting your venue. Please try again.');
        }
    },

    // Extract and structure venue data from form
    extractVenueData: (formData) => {
        // Helper function to get checked checkbox values
        const getCheckboxValues = (name) => {
            const values = [];
            const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
            checkboxes.forEach(cb => values.push(cb.value));
            return values;
        };

        // Get form data
        const name = formData.get('name');
        const cuisineType = formData.get('cuisineType');
        const restaurantType = formData.get('restaurantType');
        const averagePrice = parseInt(formData.get('averagePricePerPerson')) || 0;
        const promotionalPrice = parseInt(formData.get('promotionalPrice')) || 0;
        const atmosphere = formData.get('atmosphere');
        const address = formData.get('address');
        const timeSlots = getCheckboxValues('timeSlots');

        // Determine venue type and icon based on restaurant type
        let type = restaurantType;
        let icon = '🍽️'; // Default icon
        
        switch (restaurantType.toLowerCase()) {
            case 'fine dining':
                icon = '🥂';
                break;
            case 'casual dining':
                icon = '🍽️';
                break;
            case 'café':
                icon = '☕';
                break;
            case 'bar & grill':
                icon = '🍻';
                break;
            case 'bistro':
                icon = '🍷';
                break;
            case 'pub':
                icon = '🍺';
                break;
            case 'event hall':
                icon = '🏛️';
                break;
            default:
                icon = '🍽️';
        }

        // Extract location from address (just district)
        let location = address.split(',')[0] || address;

        // Create availability string from time slots
        const availability = timeSlots.length > 0 ?
            `Available: ${timeSlots.join(', ')}` :
            'Available by appointment';

        // Create price string with discount if promotional price is lower
        let price = `$${averagePrice}/person`;
        let discount = null;
        
        if (promotionalPrice && promotionalPrice < averagePrice) {
            const discountPercent = Math.round(((averagePrice - promotionalPrice) / averagePrice) * 100);
            discount = `${discountPercent}% OFF`;
            price = `$${promotionalPrice}/person`;
        }

        return {
            name: name,
            type: type,
            icon: icon,
            location: location,
            price: price,
            discount: discount,
            availability: availability,
            description: formData.get('description'),
            detailedDescription: formData.get('description'),
            
            // Additional data for contact and features
            phone: formData.get('phone'),
            email: formData.get('email'),
            address: address,
            website: formData.get('website') || '',
            
            // Operational details
            operatingHours: {
                weekdays: formData.get('weekdayHours'),
                weekends: formData.get('weekendHours')
            },
            capacity: {
                totalSeats: parseInt(formData.get('totalSeats')) || 0,
                indoor: parseInt(formData.get('indoorCapacity')) || 0,
                outdoor: parseInt(formData.get('outdoorCapacity')) || 0,
                privateRooms: parseInt(formData.get('privateRooms')) || 0
            },
            pricing: {
                averagePricePerPerson: averagePrice,
                promotionalPrice: promotionalPrice
            },
            features: {
                atmosphere: atmosphere,
                amenities: getCheckboxValues('amenities'),
                specialServices: getCheckboxValues('specialServices'),
                dietaryAccommodations: getCheckboxValues('dietaryAccommodations')
            },
            media: {
                description: formData.get('description'),
                menuHighlights: formData.get('menuHighlights') || ''
            },
            timeSlots: timeSlots,
            advanceBooking: parseInt(formData.get('advanceBooking')) || 7
        };
    },

    handleCustomerFormSubmit: (form) => {
        const formData = new FormData(form);
        
        // Extract search criteria
        const searchCriteria = {
            eventType: formData.get('eventType'),
            people: formData.get('people') ? parseInt(formData.get('people')) : null,
            district: formData.get('district'),
            datetime: formData.get('datetime'),
            budget: formData.get('budget') ? parseInt(formData.get('budget')) : null
        };
        
        console.log('Customer search criteria:', searchCriteria);
        
        // Validate required fields
        if (!searchCriteria.eventType) {
            alert('Please select an event type.');
            return;
        }
        
        // Close modal and perform search
        ModalManager.close('customerModal');
        
        // Show loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            text-align: center;
        `;
        loadingMessage.innerHTML = '<div>🔍 Searching for venues...</div>';
        document.body.appendChild(loadingMessage);
        
        // Simulate search delay for better UX
        setTimeout(async () => {
            document.body.removeChild(loadingMessage);
            await VenueManager.displaySearchResults(searchCriteria);
        }, 800);
    },

    handleLoginFormSubmit: async (form) => {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        
        // Hide any previous error messages
        AuthManager.hideError('login');
        
        // Attempt login
        const result = await AuthManager.login(email, password);
        
        if (result.success) {
            ModalManager.close('loginModal');
            alert(result.message);
        } else {
            AuthManager.showError('login', result.error);
        }
    },

    handleRegisterFormSubmit: async (form) => {
        const formData = new FormData(form);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            userType: formData.get('userType')
        };
        
        // Hide any previous error messages
        AuthManager.hideError('register');
        
        // Check password confirmation
        const confirmPassword = formData.get('confirmPassword');
        if (userData.password !== confirmPassword) {
            AuthManager.showError('register', 'Passwords do not match');
            return;
        }
        
        // Attempt registration
        const result = await AuthManager.register(userData);
        
        if (result.success) {
            ModalManager.close('registerModal');
            alert(result.message);
        } else {
            AuthManager.showError('register', result.error);
        }
    },

    handleProfileFormSubmit: (form) => {
        const formData = new FormData(form);
        const updateData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName')
        };
        
        // Hide any previous messages
        AuthManager.hideError('profile');
        AuthManager.hideSuccess('profile');
        
        // Attempt profile update
        const result = AuthManager.updateProfile(updateData);
        
        if (result.success) {
            AuthManager.showSuccess('profile', result.message);
        } else {
            AuthManager.showError('profile', result.error);
        }
    }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await App.init();
    App.handleFormSubmissions();
});

// Export for debugging purposes
window.App = App;