// Venue Management Component
const VenueManager = {
    // Current search results
    currentSearchResults: null,
    isSearchMode: false,

    // Find venue by name
    findVenueByName: (venueName) => {
        if (!window.AppConfig || !window.AppConfig.venues) return null;
        return window.AppConfig.venues.find(venue => venue.name === venueName);
    },

    // Open venue details modal
    openVenueDetails: (venueName) => {
        const venue = VenueManager.findVenueByName(venueName);
        if (!venue) {
            alert('Venue not found');
            return;
        }

        // Create venue details modal if it doesn't exist
        if (!document.getElementById('venueDetailsModal')) {
            const modalHTML = window.UIComponents.createVenueDetailsModal();
            document.getElementById('modalsContainer').insertAdjacentHTML('beforeend', modalHTML);
        }

        // Populate modal with venue data
        VenueManager.populateVenueDetailsModal(venue);
        
        // Open the modal
        window.ModalManager.open('venueDetailsModal');
    },

    // Populate venue details modal with venue data
    populateVenueDetailsModal: (venue) => {
        const modal = document.getElementById('venueDetailsModal');
        if (!modal) return;

        const imageUrl = venue.image || `https://via.placeholder.com/600x300/cccccc/333333?text=${encodeURIComponent(venue.type)}`;
        const discountClass = venue.discount ? 'discount' : '';
        const discountText = venue.discount ? `${venue.discount} | ` : '';

        modal.querySelector('.venue-details-image').style.backgroundImage = `url('${imageUrl}')`;
        modal.querySelector('.venue-details-name').textContent = venue.name;
        modal.querySelector('.venue-details-type').innerHTML = `${venue.icon} ${venue.type}`;
        modal.querySelector('.venue-details-location').textContent = venue.location;
        modal.querySelector('.venue-details-price').innerHTML = `${discountText}${venue.price}`;
        modal.querySelector('.venue-details-price').className = `price-tag ${discountClass}`;
        modal.querySelector('.venue-details-availability').textContent = venue.availability;
        modal.querySelector('.venue-details-description').textContent = venue.detailedDescription || venue.description;
        
        // Populate contact information
        if (venue.contact) {
            modal.querySelector('.venue-contact-phone').textContent = venue.contact.phone;
            modal.querySelector('.venue-contact-email').textContent = venue.contact.email;
            modal.querySelector('.venue-contact-address').textContent = venue.contact.address;
        }
    },

    // Handle booking (placeholder functionality)
    bookVenue: (venueName) => {
        alert(`Booking request submitted for ${venueName}!\n\nIn the full version, this would redirect to a booking form or payment system.`);
        window.ModalManager.close('venueDetailsModal');
    },

    renderVenues: async (venues = null) => {
        const container = document.getElementById('venuesContainer');
        if (container) {
            let venuesToRender = venues;
            
            if (!venuesToRender) {
                // Get venues from API database and config venues
                let apiVenues = [];
                try {
                    if (DatabaseManager && DatabaseManager.venues) {
                        apiVenues = await DatabaseManager.venues.getAll();
                        // Transform API venues to match UI format
                        apiVenues = apiVenues.map(venue => ({
                            name: venue.name,
                            type: venue.type,
                            icon: VenueManager.getVenueIcon(venue.type),
                            location: venue.location,
                            price: venue.price,
                            discount: venue.discount,
                            availability: venue.availability,
                            description: venue.description,
                            detailedDescription: venue.detailed_description || venue.description,
                            image: venue.image_url,
                            contact: {
                                phone: venue.contact_phone,
                                email: venue.contact_email,
                                address: venue.contact_address
                            },
                            isActive: venue.is_active
                        })).filter(venue => venue.isActive !== false);
                    }
                } catch (error) {
                    console.warn('Error loading API venues:', error);
                    apiVenues = [];
                }
                
                const configVenues = window.AppConfig ? window.AppConfig.venues : [];
                venuesToRender = [...apiVenues, ...configVenues];
            }
            
            if (venuesToRender.length === 0) {
                const isOwner = AuthManager.isAuthenticated() && AuthManager.getCurrentUser() && AuthManager.getCurrentUser().userType === 'owner';
                container.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: #666;">
                        <h3>No venues available yet</h3>
                        <p>Be the first to add your venue to our marketplace!</p>
                        ${isOwner ?
                            '<button class="btn btn-primary" onclick="ModalManager.open(\'ownerModal\')">Add Your Venue</button>' :
                            ''
                        }
                    </div>
                `;
            } else {
                container.innerHTML = venuesToRender
                    .map(venue => window.UIComponents.createVenueCard(venue))
                    .join('');
            }
        }
    },

    // Helper function to get venue icon based on type
    getVenueIcon: (venueType) => {
        const iconMap = {
            'Conference Hall': '🏢',
            'Meeting Room': '🏛️',
            'Wedding Hall': '💒',
            'Banquet Hall': '🏛️',
            'Restaurant': '🍴',
            'Private Dining': '👨‍🍳',
            'Event Space': '🎉',
            'Party Hall': '🎉',
            'Outdoor Venue': '🌳',
            'Garden Venue': '🌸',
            'Sports Facility': '⚽',
            'Recreation Center': '💪',
            'Corporate Center': '🏢',
            'Business Center': '💼'
        };
        return iconMap[venueType] || '🏪';
    },

    // Get all unique districts with venue counts
    getDistrictsWithCounts: async () => {
        // Get all venues from both sources
        let allVenues = [];
        
        try {
            if (DatabaseManager && DatabaseManager.venues) {
                const apiVenues = await DatabaseManager.venues.getAll();
                allVenues = [...allVenues, ...apiVenues];
            }
        } catch (error) {
            console.warn('Error loading API venues for districts:', error);
        }
        
        const configVenues = window.AppConfig ? window.AppConfig.venues : [];
        allVenues = [...allVenues, ...configVenues];
        
        if (allVenues.length === 0) return [];
        
        const districtCounts = {};
        allVenues.forEach(venue => {
            // Extract district from location (format: "District, Warsaw" or "District")
            let district = venue.location.split(',')[0].trim();
            // Handle special cases
            if (district.includes('Downtown')) district = 'Śródmieście';
            if (district.includes('City Center')) district = 'Śródmieście';
            
            districtCounts[district] = (districtCounts[district] || 0) + 1;
        });
        
        // Convert to array and sort by venue count (descending)
        return Object.entries(districtCounts)
            .map(([district, count]) => ({ district, count }))
            .sort((a, b) => b.count - a.count);
    },

    // Search venues based on criteria
    searchVenues: async (criteria) => {
        // Get all venues from both sources
        let allVenues = [];
        
        try {
            if (DatabaseManager && DatabaseManager.venues) {
                const apiVenues = await DatabaseManager.venues.getAll();
                // Transform API venues to match UI format
                const transformedVenues = apiVenues.map(venue => ({
                    name: venue.name,
                    type: venue.type,
                    icon: VenueManager.getVenueIcon(venue.type),
                    location: venue.location,
                    price: venue.price,
                    discount: venue.discount,
                    availability: venue.availability,
                    description: venue.description,
                    detailedDescription: venue.detailed_description || venue.description,
                    image: venue.image_url,
                    contact: {
                        phone: venue.contact_phone,
                        email: venue.contact_email,
                        address: venue.contact_address
                    },
                    isActive: venue.is_active
                })).filter(venue => venue.isActive !== false);
                allVenues = [...allVenues, ...transformedVenues];
            }
        } catch (error) {
            console.warn('Error loading API venues for search:', error);
        }
        
        const configVenues = window.AppConfig ? window.AppConfig.venues : [];
        allVenues = [...allVenues, ...configVenues];
        
        if (allVenues.length === 0) return [];

        let filteredVenues = allVenues;

        // Filter by district
        if (criteria.district && criteria.district !== 'all') {
            filteredVenues = filteredVenues.filter(venue => {
                let venueDistrict = venue.location.split(',')[0].trim();
                if (venueDistrict.includes('Downtown')) venueDistrict = 'Śródmieście';
                if (venueDistrict.includes('City Center')) venueDistrict = 'Śródmieście';
                return venueDistrict === criteria.district;
            });
        }

        // Filter by budget (extract price number and compare)
        if (criteria.budget) {
            filteredVenues = filteredVenues.filter(venue => {
                const priceMatch = venue.price.match(/\$(\d+)/);
                if (priceMatch) {
                    const venuePrice = parseInt(priceMatch[1]);
                    return venuePrice <= criteria.budget;
                }
                return true;
            });
        }

        // Filter by number of people (basic capacity check)
        if (criteria.people) {
            // For simplicity, assume higher-priced venues have higher capacity
            filteredVenues = filteredVenues.filter(venue => {
                const priceMatch = venue.price.match(/\$(\d+)/);
                if (priceMatch) {
                    const venuePrice = parseInt(priceMatch[1]);
                    // Rough capacity estimation: $20/hr = ~10 people, $40/hr = ~20 people, etc.
                    const estimatedCapacity = venuePrice * 0.5;
                    return estimatedCapacity >= criteria.people;
                }
                return true;
            });
        }

        // Filter by event type (match with venue types)
        if (criteria.eventType) {
            const eventToVenueTypeMap = {
                'Business dinner': ['Restaurant', 'Fine Dining', 'Premium Restaurant', 'Private Dining'],
                'Birthday': ['Restaurant', 'Bar', 'Club', 'Event Hall', 'Party Hall', 'Event Space'],
                'Social meeting': ['Café', 'Co-working', 'Restaurant', 'Bar', 'Meeting Room'],
                'Presentation': ['Conference Hall', 'Meeting Room', 'Co-working', 'Corporate Center', 'Business Center'],
                'Workshop': ['Training Facility', 'Workshop Space', 'Co-working', 'Meeting Room']
            };
            
            const relevantTypes = eventToVenueTypeMap[criteria.eventType] || [];
            if (relevantTypes.length > 0) {
                filteredVenues = filteredVenues.filter(venue => {
                    return relevantTypes.some(type =>
                        venue.type.toLowerCase().includes(type.toLowerCase()) ||
                        venue.name.toLowerCase().includes(type.toLowerCase())
                    );
                });
            }
        }

        return filteredVenues;
    },

    // Display search results
    displaySearchResults: async (searchCriteria) => {
        const results = await VenueManager.searchVenues(searchCriteria);
        VenueManager.currentSearchResults = results;
        VenueManager.isSearchMode = true;

        // Add search results header
        const container = document.getElementById('venuesContainer');
        const parentSection = container.closest('section');
        
        // Update section header
        const sectionTitle = parentSection.querySelector('h2');
        const sectionSubtitle = parentSection.querySelector('p');
        
        if (sectionTitle && sectionSubtitle) {
            sectionTitle.textContent = 'Search Results';
            
            let subtitle = `Found ${results.length} venue${results.length !== 1 ? 's' : ''}`;
            if (searchCriteria.district && searchCriteria.district !== 'all') {
                subtitle += ` in ${searchCriteria.district}`;
            }
            if (searchCriteria.budget) {
                subtitle += ` within $${searchCriteria.budget}/hr budget`;
            }
            
            sectionSubtitle.innerHTML = `
                ${subtitle}
                <br>
                <button class="btn btn-secondary" onclick="VenueManager.showAllVenues()" style="margin-top: 0.5rem; font-size: 0.9rem;">
                    ← Back to All Venues
                </button>
            `;
        }

        // Render filtered venues
        await VenueManager.renderVenues(results);

        // Scroll to results
        parentSection.scrollIntoView({ behavior: 'smooth' });
    },

    // Show all venues (reset search)
    showAllVenues: async () => {
        VenueManager.currentSearchResults = null;
        VenueManager.isSearchMode = false;

        // Reset section header
        const container = document.getElementById('venuesContainer');
        const parentSection = container.closest('section');
        
        const sectionTitle = parentSection.querySelector('h2');
        const sectionSubtitle = parentSection.querySelector('p');
        
        if (sectionTitle && sectionSubtitle) {
            sectionTitle.textContent = 'Current Offers';
            sectionSubtitle.textContent = 'Find the perfect venue for your event';
        }

        // Render all venues
        await VenueManager.renderVenues();
    },

    filterVenues: (criteria) => {
        // Legacy method - now redirects to searchVenues
        return VenueManager.searchVenues(criteria);
    },

    sortVenues: (sortBy) => {
        // Future implementation for sorting venues
        // Could sort by price, availability, rating, etc.
        console.log('Sorting venues by:', sortBy);
    }
};

// Export for use in other modules
window.VenueManager = VenueManager;