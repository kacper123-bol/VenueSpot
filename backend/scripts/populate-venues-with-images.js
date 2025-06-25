const database = require('../database');

// Sample venues with appropriate images based on categories
const venuesWithImages = [
    // Conference & Meeting Venues
    {
        name: "Downtown Conference Center",
        type: "Conference Hall",
        location: "Downtown Business District",
        price: "$150/hr",
        discount: "10% for full day bookings",
        availability: "Mon-Fri 8AM-10PM",
        description: "Modern conference facility with state-of-the-art AV equipment",
        detailed_description: "Professional conference center featuring multiple meeting rooms, high-speed internet, video conferencing capabilities, and catering services. Perfect for corporate meetings, seminars, and business presentations.",
        image_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        contact_phone: "+1-555-0101",
        contact_email: "info@downtownconference.com",
        contact_address: "123 Business Ave, Downtown",
        owner_id: 1
    },
    {
        name: "Executive Meeting Hub",
        type: "Meeting Room",
        location: "Financial District",
        price: "$200/hr",
        discount: null,
        availability: "24/7",
        description: "Premium meeting space for executive gatherings",
        detailed_description: "Elegant executive meeting rooms with panoramic city views, premium furniture, and advanced presentation technology. Ideal for board meetings, client presentations, and high-level discussions.",
        image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        contact_phone: "+1-555-0102",
        contact_email: "bookings@executivehub.com",
        contact_address: "456 Finance St, Financial District",
        owner_id: 1
    },

    // Wedding & Banquet Halls
    {
        name: "Grand Ballroom Palace",
        type: "Wedding Hall",
        location: "Uptown",
        price: "$500/hr",
        discount: "15% for weekend packages",
        availability: "Fri-Sun 10AM-12AM",
        description: "Elegant ballroom perfect for weddings and special celebrations",
        detailed_description: "Stunning grand ballroom with crystal chandeliers, marble floors, and capacity for 300 guests. Features bridal suite, full catering kitchen, and professional lighting. Perfect for weddings, galas, and milestone celebrations.",
        image_url: "https://images.unsplash.com/photo-1519167758481-83f29c55eaaf?w=800&h=600&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        contact_phone: "+1-555-0103",
        contact_email: "events@grandballroom.com",
        contact_address: "789 Celebration Blvd, Uptown",
        owner_id: 1
    },
    {
        name: "Romantic Garden Venue",
        type: "Banquet Hall",
        location: "Garden District",
        price: "$350/hr",
        discount: "20% for off-season bookings",
        availability: "Daily 9AM-11PM",
        description: "Beautiful garden setting for intimate celebrations",
        detailed_description: "Charming banquet hall surrounded by lush gardens and water features. Indoor-outdoor flow with retractable roof, accommodates 150 guests. Perfect for romantic weddings, anniversary parties, and garden parties.",
        image_url: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        contact_phone: "+1-555-0104",
        contact_email: "info@romancegarden.com",
        contact_address: "321 Garden Way, Garden District",
        owner_id: 1
    },

    // Restaurant & Dining
    {
        name: "The Metropolitan Dining Hall",
        type: "Restaurant",
        location: "City Center",
        price: "$75/hr",
        discount: "Free appetizers for 4+ hour bookings",
        availability: "Daily 11AM-11PM",
        description: "Upscale dining venue with private event spaces",
        detailed_description: "Sophisticated restaurant offering private dining rooms and full venue buyouts. Award-winning cuisine, extensive wine cellar, and professional service staff. Perfect for corporate dinners, rehearsal dinners, and celebration meals.",
        image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        contact_phone: "+1-555-0105",
        contact_email: "reservations@metropolitan.com",
        contact_address: "654 Culinary St, City Center",
        owner_id: 1
    },
    {
        name: "Cozy Corner Bistro",
        type: "Private Dining",
        location: "Arts Quarter",
        price: "$45/hr",
        discount: "10% for local artists",
        availability: "Tue-Sun 5PM-10PM",
        description: "Intimate dining space perfect for small gatherings",
        detailed_description: "Charming bistro with exposed brick walls, warm lighting, and artisanal cuisine. Private dining room accommodates 25 guests. Specializes in farm-to-table dining with local ingredients and craft cocktails.",
        image_url: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        contact_phone: "+1-555-0106",
        contact_email: "hello@cozycorner.com",
        contact_address: "987 Artist Ave, Arts Quarter",
        owner_id: 1
    },

    // Event Spaces & Party Halls
    {
        name: "Celebration Central",
        type: "Event Space",
        location: "Entertainment District",
        price: "$300/hr",
        discount: "Package deals available",
        availability: "Daily 2PM-2AM",
        description: "Dynamic event space for parties and celebrations",
        detailed_description: "Modern event venue with customizable lighting, sound system, dance floor, and multiple bars. Features DJ booth, photo booth area, and VIP section. Perfect for birthday parties, corporate events, and social gatherings.",
        image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        contact_phone: "+1-555-0107",
        contact_email: "party@celebrationcentral.com",
        contact_address: "147 Party Plaza, Entertainment District",
        owner_id: 1
    },
    {
        name: "The Loft Event Space",
        type: "Party Hall",
        location: "Warehouse District",
        price: "$250/hr",
        discount: "Early bird 15% off",
        availability: "Fri-Sun 6PM-2AM",
        description: "Industrial-chic loft space for trendy events",
        detailed_description: "Converted warehouse loft with exposed beams, brick walls, and floor-to-ceiling windows. Open floor plan accommodates 200 guests, full bar service, and professional lighting. Ideal for trendy parties, product launches, and creative events.",
        image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        contact_phone: "+1-555-0108",
        contact_email: "events@theloftspace.com",
        contact_address: "258 Industrial Way, Warehouse District",
        owner_id: 1
    },

    // Outdoor Venues & Gardens
    {
        name: "Sunset Garden Pavilion",
        type: "Outdoor Venue",
        location: "Riverside Park",
        price: "$200/hr",
        discount: "Weather guarantee included",
        availability: "Apr-Oct, Daily 8AM-10PM",
        description: "Beautiful outdoor pavilion with garden views",
        detailed_description: "Elegant outdoor pavilion surrounded by manicured gardens and water features. Covered seating area with optional tent rental, accommodates 100 guests. Perfect for outdoor weddings, garden parties, and nature-inspired celebrations.",
        image_url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        contact_phone: "+1-555-0109",
        contact_email: "info@sunsetgarden.com",
        contact_address: "369 Riverside Dr, Riverside Park",
        owner_id: 1
    },
    {
        name: "Historic Manor Gardens",
        type: "Garden Venue",
        location: "Historic District",
        price: "$400/hr",
        discount: "Historic society member discount",
        availability: "Seasonal, Thu-Sun 10AM-8PM",
        description: "Historic estate with pristine formal gardens",
        detailed_description: "19th-century manor house with award-winning formal gardens, rose arbor, and fountain courtyard. Indoor-outdoor event options, capacity for 150 guests. Rich in history and perfect for elegant weddings and sophisticated gatherings.",
        image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        contact_phone: "+1-555-0110",
        contact_email: "bookings@historicmanor.com",
        contact_address: "741 Heritage Lane, Historic District",
        owner_id: 1
    },

    // Sports & Recreation Facilities
    {
        name: "Champion Sports Complex",
        type: "Sports Facility",
        location: "Athletic District",
        price: "$100/hr",
        discount: "Team packages available",
        availability: "Daily 6AM-11PM",
        description: "Multi-sport facility for tournaments and events",
        detailed_description: "State-of-the-art sports complex with basketball courts, volleyball courts, and event space. Professional lighting, sound system, and seating for 300 spectators. Perfect for sports tournaments, team building events, and athletic celebrations.",
        image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        contact_phone: "+1-555-0111",
        contact_email: "info@championsports.com",
        contact_address: "852 Athletic Blvd, Athletic District",
        owner_id: 1
    },
    {
        name: "Fitness & Wellness Center",
        type: "Recreation Center",
        location: "Health District",
        price: "$80/hr",
        discount: "Health professional rates",
        availability: "Daily 5AM-10PM",
        description: "Modern wellness facility for health-focused events",
        detailed_description: "Comprehensive wellness center with gym facilities, yoga studios, and seminar rooms. Features healthy catering options, equipment rental, and wellness programming. Ideal for health seminars, fitness challenges, and wellness retreats.",
        image_url: "https://images.unsplash.com/photo-1544737151560-6fda7badf29f?w=800&h=600&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        contact_phone: "+1-555-0112",
        contact_email: "wellness@fitnessevents.com",
        contact_address: "963 Wellness Way, Health District",
        owner_id: 1
    },

    // Corporate & Business Centers
    {
        name: "Innovation Hub",
        type: "Corporate Center",
        location: "Tech District",
        price: "$300/hr",
        discount: "Startup friendly rates",
        availability: "Mon-Fri 7AM-9PM",
        description: "Modern co-working space for corporate events",
        detailed_description: "Cutting-edge corporate event space with flexible layouts, high-tech presentation equipment, and collaborative workspaces. Features innovation labs, networking areas, and catering facilities. Perfect for product launches, corporate training, and tech meetups.",
        image_url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        contact_phone: "+1-555-0113",
        contact_email: "events@innovationhub.com",
        contact_address: "159 Innovation Dr, Tech District",
        owner_id: 1
    },
    {
        name: "Executive Business Lounge",
        type: "Business Center",
        location: "Corporate Plaza",
        price: "$250/hr",
        discount: "Corporate membership benefits",
        availability: "Mon-Fri 8AM-8PM",
        description: "Premium business lounge for professional gatherings",
        detailed_description: "Sophisticated business center with private offices, boardrooms, and networking lounges. Concierge services, business amenities, and premium catering options. Ideal for executive meetings, client entertainment, and professional networking events.",
        image_url: "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        contact_phone: "+1-555-0114",
        contact_email: "concierge@executivelounge.com",
        contact_address: "357 Corporate Plaza, Corporate Plaza",
        owner_id: 1
    }
];

async function populateVenuesWithImages() {
    try {
        console.log('🏢 Populating venues with category-appropriate images...');
        console.log('==================================================');

        // First, ensure we have at least one user to be the owner
        let owner = await database.get('SELECT id FROM users WHERE user_type = ? LIMIT 1', ['admin']);
        
        if (!owner) {
            // Create a default admin user if none exists
            console.log('Creating default admin user...');
            const result = await database.run(`
                INSERT INTO users (email, password_hash, first_name, last_name, user_type)
                VALUES (?, ?, ?, ?, ?)
            `, ['admin@venuespot.com', '$2b$10$dummy.hash.for.demo', 'Admin', 'User', 'admin']);
            owner = { id: result.lastID };
        }

        // Clear existing venues if any
        await database.run('DELETE FROM venues');
        console.log('Cleared existing venues.');

        let successCount = 0;
        let errorCount = 0;

        for (const venue of venuesWithImages) {
            try {
                // Set the owner_id to the admin user
                venue.owner_id = owner.id;

                const result = await database.run(`
                    INSERT INTO venues (
                        name, type, location, price, discount, availability, 
                        description, detailed_description, image_url, 
                        contact_phone, contact_email, contact_address, owner_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    venue.name, venue.type, venue.location, venue.price, 
                    venue.discount, venue.availability, venue.description, 
                    venue.detailed_description, venue.image_url,
                    venue.contact_phone, venue.contact_email, venue.contact_address, 
                    venue.owner_id
                ]);

                console.log(`✅ Added: ${venue.name} (${venue.type}) - ID: ${result.lastID}`);
                successCount++;

            } catch (error) {
                console.error(`❌ Failed to add ${venue.name}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n📊 Summary:');
        console.log(`✅ Successfully added: ${successCount} venues`);
        console.log(`❌ Failed to add: ${errorCount} venues`);
        
        if (successCount > 0) {
            console.log('\n🎉 All venues have been populated with appropriate images!');
            console.log('\nVenue Categories Added:');
            const categories = [...new Set(venuesWithImages.map(v => v.type))];
            categories.forEach(cat => console.log(`  • ${cat}`));
        }

    } catch (error) {
        console.error('❌ Error populating venues:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    populateVenuesWithImages()
        .then(() => {
            console.log('\n✨ Venue population complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { populateVenuesWithImages, venuesWithImages };