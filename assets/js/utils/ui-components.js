// UI Component Creation Utilities
const UIComponents = {
    createFeatureCard: (feature) => {
        return `
            <div class="feature-card">
                <div class="feature-icon">${feature.icon}</div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
            </div>
        `;
    },

    createVenueCard: (venue) => {
        const discountClass = venue.discount ? 'discount' : '';
        const discountText = venue.discount ? `${venue.discount} | ` : '';
        const imageUrl = venue.image || `https://via.placeholder.com/300x200/cccccc/333333?text=${encodeURIComponent(venue.type)}`;
        
        return `
            <div class="venue-card">
                <div class="venue-image" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center; height: 200px; position: relative; border-radius: 8px 8px 0 0;">
                    <div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.9rem;">
                        ${venue.icon} ${venue.type}
                    </div>
                </div>
                <div class="venue-info">
                    <h3 class="venue-name">${venue.name}</h3>
                    <p class="venue-location">📍 ${venue.location}</p>
                    <div class="price-tag ${discountClass}">${discountText}${venue.price}</div>
                    <p><strong>Available:</strong> ${venue.availability}</p>
                    <p>${venue.description}</p>
                    <button class="btn btn-primary" style="margin-top: 1rem;" onclick="VenueManager.openVenueDetails('${venue.name}')">Book Now</button>
                </div>
            </div>
        `;
    },

    createModal: (id, title, content, isLarge = false) => {
        const modalClass = isLarge ? 'modal-content large' : 'modal-content';
        return `
            <div id="${id}" class="modal">
                <div class="${modalClass}">
                    <span class="close" onclick="ModalManager.close('${id}')">&times;</span>
                    <h2 style="margin-bottom: 1.5rem; color: #333;">${title}</h2>
                    ${content}
                </div>
            </div>
        `;
    },

    createVenueDetailsModal: () => {
        return `
            <div id="venueDetailsModal" class="modal">
                <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                    <span class="close" onclick="ModalManager.close('venueDetailsModal')">&times;</span>
                    
                    <!-- Venue Image -->
                    <div class="venue-details-image" style="
                        width: 100%;
                        height: 300px;
                        background-size: cover;
                        background-position: center;
                        border-radius: 8px;
                        margin-bottom: 1.5rem;
                        position: relative;
                    ">
                        <div class="venue-details-type" style="
                            position: absolute;
                            top: 15px;
                            left: 15px;
                            background: rgba(0,0,0,0.7);
                            color: white;
                            padding: 8px 15px;
                            border-radius: 20px;
                            font-size: 1rem;
                            font-weight: 500;
                        "></div>
                    </div>

                    <!-- Venue Info -->
                    <div class="venue-details-info">
                        <h2 class="venue-details-name" style="margin-bottom: 0.5rem; color: #333; font-size: 2rem;"></h2>
                        <p class="venue-details-location" style="color: #666; font-size: 1.1rem; margin-bottom: 1rem;">📍 </p>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                            <div class="venue-details-price" style="font-size: 1.5rem; font-weight: bold;"></div>
                            <div class="venue-details-availability" style="color: #28a745; font-weight: 500;">Available: </div>
                        </div>

                        <!-- Description -->
                        <div style="margin-bottom: 2rem;">
                            <h3 style="color: #333; margin-bottom: 1rem;">About this venue</h3>
                            <p class="venue-details-description" style="line-height: 1.6; color: #555; font-size: 1rem;"></p>
                        </div>

                        <!-- Contact Information -->
                        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                            <h3 style="color: #333; margin-bottom: 1rem;">Contact Information</h3>
                            <div style="display: grid; gap: 0.8rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="font-size: 1.2rem;">📞</span>
                                    <span class="venue-contact-phone" style="color: #333;"></span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="font-size: 1.2rem;">✉️</span>
                                    <span class="venue-contact-email" style="color: #333;"></span>
                                </div>
                                <div style="display: flex; align-items: flex-start; gap: 0.5rem;">
                                    <span style="font-size: 1.2rem;">📍</span>
                                    <span class="venue-contact-address" style="color: #333;"></span>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                            <button class="btn btn-primary" style="font-size: 1.1rem; padding: 12px 30px;" onclick="VenueManager.bookVenue(document.querySelector('.venue-details-name').textContent)">
                                🎫 Book Now
                            </button>
                            <button class="btn btn-secondary" style="font-size: 1.1rem; padding: 12px 30px;" onclick="ModalManager.close('venueDetailsModal')">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// Export for use in other modules
window.UIComponents = UIComponents;