// Form Templates for Modals
const FormTemplates = {
    ownerForm: `
        <form id="venueRegistrationForm">
            <!-- Basic Information Section -->
            <h3 style="color: #333; margin-bottom: 1rem; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem;">
                🏪 Basic Information
            </h3>
            
            <div class="form-group">
                <label>Venue Name *</label>
                <input type="text" name="name" placeholder="e.g. Restaurant Roma" required>
            </div>
            
            <div class="form-row" style="display: flex; gap: 1rem;">
                <div class="form-group" style="flex: 1;">
                    <label>Cuisine Type *</label>
                    <select name="cuisineType" required>
                        <option value="">Select cuisine type</option>
                        <option value="Italian">Italian</option>
                        <option value="Mexican">Mexican</option>
                        <option value="Asian">Asian</option>
                        <option value="American">American</option>
                        <option value="Mediterranean">Mediterranean</option>
                        <option value="Indian">Indian</option>
                        <option value="French">French</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Thai">Thai</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                <div class="form-group" style="flex: 1;">
                    <label>Restaurant Type *</label>
                    <select name="restaurantType" required>
                        <option value="">Select type</option>
                        <option value="Fine Dining">Fine Dining</option>
                        <option value="Casual Dining">Casual Dining</option>
                        <option value="Fast Casual">Fast Casual</option>
                        <option value="Café">Café</option>
                        <option value="Bar & Grill">Bar & Grill</option>
                        <option value="Bistro">Bistro</option>
                        <option value="Pub">Pub</option>
                        <option value="Event Hall">Event Hall</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label>Full Address *</label>
                <input type="text" name="address" placeholder="e.g. 123 Main Street, Mokotów, Warsaw, Poland" required>
            </div>

            <div class="form-row" style="display: flex; gap: 1rem;">
                <div class="form-group" style="flex: 1;">
                    <label>Phone Number *</label>
                    <input type="tel" name="phone" placeholder="+48 123 456 789" required>
                </div>
                <div class="form-group" style="flex: 1;">
                    <label>Email *</label>
                    <input type="email" name="email" placeholder="info@restaurant.com" required>
                </div>
            </div>

            <div class="form-group">
                <label>Website (optional)</label>
                <input type="url" name="website" placeholder="https://www.restaurant.com">
            </div>

            <!-- Operational Details Section -->
            <h3 style="color: #333; margin: 2rem 0 1rem 0; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem;">
                ⏰ Operational Details
            </h3>

            <div class="form-group">
                <label>Operating Hours *</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
                    <div>
                        <label style="font-size: 0.9rem; font-weight: normal;">Monday - Friday</label>
                        <input type="text" name="weekdayHours" placeholder="e.g. 11:00 AM - 10:00 PM" required>
                    </div>
                    <div>
                        <label style="font-size: 0.9rem; font-weight: normal;">Saturday - Sunday</label>
                        <input type="text" name="weekendHours" placeholder="e.g. 10:00 AM - 11:00 PM" required>
                    </div>
                </div>
            </div>

            <div class="form-row" style="display: flex; gap: 1rem;">
                <div class="form-group" style="flex: 1;">
                    <label>Indoor Seating *</label>
                    <input type="number" name="indoorCapacity" placeholder="40" min="1" required>
                </div>
                <div class="form-group" style="flex: 1;">
                    <label>Outdoor Seating</label>
                    <input type="number" name="outdoorCapacity" placeholder="20" min="0">
                </div>
            </div>

            <div class="form-row" style="display: flex; gap: 1rem;">
                <div class="form-group" style="flex: 1;">
                    <label>Total Seats *</label>
                    <input type="number" name="totalSeats" placeholder="60" min="1" required>
                </div>
                <div class="form-group" style="flex: 1;">
                    <label>Private Rooms</label>
                    <input type="number" name="privateRooms" placeholder="2" min="0">
                </div>
            </div>

            <!-- Pricing Section -->
            <h3 style="color: #333; margin: 2rem 0 1rem 0; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem;">
                💰 Pricing
            </h3>

            <div class="form-row" style="display: flex; gap: 1rem;">
                <div class="form-group" style="flex: 1;">
                    <label>Average Price per Person *</label>
                    <input type="number" name="averagePricePerPerson" placeholder="25" min="1" required>
                </div>
                <div class="form-group" style="flex: 1;">
                    <label>Promotional Price per Person *</label>
                    <input type="number" name="promotionalPrice" placeholder="18" min="1" required>
                </div>
            </div>

            <!-- Features Section -->
            <h3 style="color: #333; margin: 2rem 0 1rem 0; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem;">
                ✨ Features & Amenities
            </h3>

            <div class="form-group">
                <label>Amenities (select all that apply)</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
                    <label style="font-weight: normal;"><input type="checkbox" name="amenities" value="WiFi"> Free WiFi</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="amenities" value="Parking"> Parking Available</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="amenities" value="Wheelchair"> Wheelchair Accessible</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="amenities" value="AirConditioning"> Air Conditioning</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="amenities" value="Outdoor"> Outdoor Seating</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="amenities" value="LiveMusic"> Live Music</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="amenities" value="PrivateDining"> Private Dining</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="amenities" value="Catering"> Catering Services</label>
                </div>
            </div>

            <div class="form-group">
                <label>Atmosphere *</label>
                <select name="atmosphere" required>
                    <option value="">Select atmosphere</option>
                    <option value="Casual">Casual</option>
                    <option value="Romantic">Romantic</option>
                    <option value="Business">Business-friendly</option>
                    <option value="Family">Family-friendly</option>
                    <option value="Trendy">Trendy</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Upscale">Upscale</option>
                </select>
            </div>

            <div class="form-group">
                <label>Special Services (select all that apply)</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
                    <label style="font-weight: normal;"><input type="checkbox" name="specialServices" value="Reservations"> Reservations</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="specialServices" value="Delivery"> Delivery</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="specialServices" value="Takeout"> Takeout</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="specialServices" value="Events"> Private Events</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="specialServices" value="BusinessMeetings"> Business Meetings</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="specialServices" value="DateNight"> Date Night</label>
                </div>
            </div>

            <div class="form-group">
                <label>Dietary Accommodations</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
                    <label style="font-weight: normal;"><input type="checkbox" name="dietaryAccommodations" value="Vegetarian"> Vegetarian Options</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="dietaryAccommodations" value="Vegan"> Vegan Options</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="dietaryAccommodations" value="GlutenFree"> Gluten-Free Options</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="dietaryAccommodations" value="Halal"> Halal</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="dietaryAccommodations" value="Kosher"> Kosher</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="dietaryAccommodations" value="LowCarb"> Low-Carb Options</label>
                </div>
            </div>

            <!-- Description Section -->
            <h3 style="color: #333; margin: 2rem 0 1rem 0; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem;">
                📝 Description & Media
            </h3>

            <div class="form-group">
                <label>Venue Description *</label>
                <textarea name="description" rows="4" placeholder="Describe your venue's atmosphere, unique features, and what makes it special..." required></textarea>
            </div>

            <div class="form-group">
                <label>Menu Highlights</label>
                <textarea name="menuHighlights" rows="3" placeholder="Describe your signature dishes, popular items, or specialties..."></textarea>
            </div>

            <!-- Availability Section -->
            <h3 style="color: #333; margin: 2rem 0 1rem 0; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem;">
                📅 Availability
            </h3>

            <div class="form-group">
                <label>Available Time Slots (select all that apply)</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
                    <label style="font-weight: normal;"><input type="checkbox" name="timeSlots" value="Morning"> Morning (8-12 PM)</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="timeSlots" value="Lunch"> Lunch (12-3 PM)</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="timeSlots" value="Afternoon"> Afternoon (3-6 PM)</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="timeSlots" value="Dinner"> Dinner (6-9 PM)</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="timeSlots" value="Evening"> Evening (9-12 AM)</label>
                    <label style="font-weight: normal;"><input type="checkbox" name="timeSlots" value="LateNight"> Late Night (12+ AM)</label>
                </div>
            </div>

            <div class="form-group">
                <label>Advance Booking (days)</label>
                <select name="advanceBooking">
                    <option value="1">Same day</option>
                    <option value="3">3 days</option>
                    <option value="7" selected>1 week</option>
                    <option value="14">2 weeks</option>
                    <option value="30">1 month</option>
                </select>
            </div>

            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 2rem 0;">
                <p style="color: #666; margin: 0; font-size: 0.9rem;">
                    <strong>📋 What happens next?</strong><br>
                    After submitting your venue application, our team will review it within 2-3 business days.
                    You'll receive an email notification once your venue is approved and listed on our marketplace.
                </p>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem;">
                Submit Venue Application
            </button>
        </form>
    `,

    customerForm: `
        <form id="customerSearchForm">
            <div class="form-group">
                <label>Type of event</label>
                <select name="eventType" required>
                    <option value="">Select event type</option>
                    <option value="Business dinner">Business dinner</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Social meeting">Social meeting</option>
                    <option value="Presentation">Presentation</option>
                    <option value="Workshop">Workshop</option>
                </select>
            </div>
            <div class="form-group">
                <label>Number of people</label>
                <input type="number" name="people" placeholder="10" min="1" max="1000">
            </div>
            <div class="form-group">
                <label>Preferred district</label>
                <select name="district" id="districtSelect">
                    <option value="all">All districts</option>
                    <!-- Districts will be populated by JavaScript -->
                </select>
            </div>
            <div class="form-group">
                <label>Date and time</label>
                <input type="datetime-local" name="datetime">
            </div>
            <div class="form-group">
                <label>Budget ($/hour)</label>
                <input type="number" name="budget" placeholder="150" min="1" max="1000">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Search Venues</button>
        </form>
    `,

    loginForm: `
        <form id="loginForm">
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" placeholder="your@email.com" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="••••••••" required>
            </div>
            <div class="error-message" id="loginError" style="display: none; color: #e74c3c; margin-bottom: 1rem; text-align: center;"></div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;">Log in</button>
            <p style="text-align: center; color: #666;">
                Don't have an account? <a href="#" onclick="AuthManager.showRegisterForm()" style="color: #667eea;">Sign up</a>
            </p>
        </form>
    `,

    registerForm: `
        <form id="registerForm">
            <div class="form-group">
                <label>First Name</label>
                <input type="text" name="firstName" placeholder="John" required>
            </div>
            <div class="form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" placeholder="Doe" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" placeholder="your@email.com" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="••••••••" minlength="6" required>
            </div>
            <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" placeholder="••••••••" minlength="6" required>
            </div>
            <div class="form-group">
                <label>I am a</label>
                <select name="userType" required>
                    <option value="">Select user type</option>
                    <option value="customer">Customer (Looking for venues)</option>
                    <option value="owner">Venue Owner</option>
                    <option value="admin">System Administrator</option>
                </select>
            </div>
            <div class="error-message" id="registerError" style="display: none; color: #e74c3c; margin-bottom: 1rem; text-align: center;"></div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;">Sign up</button>
            <p style="text-align: center; color: #666;">
                Already have an account? <a href="#" onclick="AuthManager.showLoginForm()" style="color: #667eea;">Log in</a>
            </p>
        </form>
    `,

    profileForm: `
        <form id="profileForm">
            <div class="form-group">
                <label>First Name</label>
                <input type="text" name="firstName" id="profileFirstName" required>
            </div>
            <div class="form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" id="profileLastName" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" id="profileEmail" readonly style="background-color: #f5f5f5;">
            </div>
            <div class="form-group">
                <label>Account Type</label>
                <input type="text" id="profileUserType" readonly style="background-color: #f5f5f5;">
            </div>
            <div class="form-group">
                <label>Member Since</label>
                <input type="text" id="profileCreatedAt" readonly style="background-color: #f5f5f5;">
            </div>
            <div class="error-message" id="profileError" style="display: none; color: #e74c3c; margin-bottom: 1rem; text-align: center;"></div>
            <div class="success-message" id="profileSuccess" style="display: none; color: #27ae60; margin-bottom: 1rem; text-align: center;"></div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;">Update Profile</button>
            <button type="button" class="btn btn-secondary" onclick="AuthManager.showChangePasswordForm()" style="width: 100%;">Change Password</button>
        </form>
    `
};

// Export for use in other modules
window.FormTemplates = FormTemplates;