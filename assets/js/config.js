// Application Configuration and Data
const AppConfig = {
    features: [
        {
            icon: '💰',
            title: 'Increase Revenue',
            description: 'Instead of empty seats, generate additional profits by selling spaces at promotional prices'
        },
        {
            icon: '📱',
            title: 'Easy Management',
            description: 'Intuitive dashboard for managing offers, reservations and customer communication'
        },
        {
            icon: '🎯',
            title: 'Targeted Marketing',
            description: 'Reach customers looking for exactly what you offer at the right moment'
        }
    ],
    venues: [
        {
            name: 'Villa Italiana',
            type: 'Premium Restaurant',
            icon: '🍴',
            location: 'Downtown Warsaw',
            price: '$40/hr',
            discount: '-40%',
            availability: 'Today 6:00PM-10:00PM',
            description: 'Elegant restaurant with atmosphere, perfect for romantic dinners',
            detailedDescription: 'Villa Italiana stands as one of Warsaw\'s most distinguished dining establishments, offering an authentic Italian culinary experience in the heart of downtown. Our restaurant features elegant décor with warm lighting, creating an intimate atmosphere perfect for romantic evenings, business dinners, or special celebrations. The menu showcases traditional Italian recipes prepared with the finest imported ingredients, complemented by an extensive wine selection from renowned Italian vineyards. Our experienced chefs bring generations of culinary tradition to every dish, ensuring an unforgettable dining experience.',
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
            contact: {
                phone: '+48 22 123 4567',
                email: 'reservations@villaitaliana.pl',
                address: 'Nowy Świat 25, 00-029 Warsaw, Poland'
            }
        },
        {
            name: 'SoundWave Club',
            type: 'Music Club',
            icon: '🎵',
            location: 'Mokotów, Warsaw',
            price: '$80/hr',
            discount: null,
            availability: 'Tomorrow 8:00PM-12:00AM',
            description: 'Modern club with professional sound system',
            detailedDescription: 'SoundWave Club represents the pinnacle of Warsaw\'s nightlife scene, featuring state-of-the-art sound technology and immersive lighting systems. Our venue hosts internationally acclaimed DJs and live performances across multiple genres, from electronic dance music to alternative rock. The club\'s modern industrial design creates an energetic atmosphere with multiple bars, VIP sections, and a spacious dance floor. Premium bottle service and expertly crafted cocktails complement the audio-visual experience, making SoundWave the perfect destination for memorable nights out with friends or exclusive private events.',
            image: 'https://images.unsplash.com/photo-1571266028243-d220bc5dba72?w=600&h=400&fit=crop',
            contact: {
                phone: '+48 22 234 5678',
                email: 'bookings@soundwaveclub.pl',
                address: 'Puławska 156, 02-670 Warsaw, Poland'
            }
        },
        {
            name: 'Brew & Work',
            type: 'Café & Co-working',
            icon: '☕',
            location: 'City Center, Warsaw',
            price: '$20/hr',
            discount: '-25%',
            availability: 'Today 2:00PM-6:00PM',
            description: 'Perfect space for business meetings and workshops',
            detailedDescription: 'Brew & Work seamlessly combines the comfort of a specialty coffee shop with the functionality of a modern co-working space. Located in Warsaw\'s bustling city center, our venue offers premium coffee sourced from sustainable farms, light meals, and healthy snacks. The space features comfortable seating areas, private meeting rooms, high-speed WiFi, and professional presentation equipment. Whether you\'re conducting business meetings, hosting workshops, or simply seeking a productive work environment, our friendly atmosphere and excellent service create the perfect setting for professional success and creative collaboration.',
            image: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600&h=400&fit=crop',
            contact: {
                phone: '+48 22 345 6789',
                email: 'hello@brewandwork.pl',
                address: 'Marszałkowska 84, 00-514 Warsaw, Poland'
            }
        },
        // Premium Restaurants
        {
            name: 'Golden Palace',
            type: 'Fine Dining',
            icon: '🏰',
            location: 'Śródmieście, Warsaw',
            price: '$60/hr',
            discount: '-30%',
            availability: 'Today 7:00PM-11:00PM',
            description: 'Luxurious fine dining experience with world-class cuisine'
        },
        {
            name: 'Sushi Zen',
            type: 'Japanese Restaurant',
            icon: '🍣',
            location: 'Wola, Warsaw',
            price: '$45/hr',
            discount: null,
            availability: 'Tomorrow 6:00PM-10:00PM',
            description: 'Authentic Japanese sushi bar with fresh ingredients'
        },
        {
            name: 'Steakhouse Prime',
            type: 'Steakhouse',
            icon: '🥩',
            location: 'Żoliborz, Warsaw',
            price: '$55/hr',
            discount: '-20%',
            availability: 'Today 5:00PM-9:00PM',
            description: 'Premium steakhouse with aged beef and wine selection'
        },
        {
            name: 'Bistro Français',
            type: 'French Bistro',
            icon: '🇫🇷',
            location: 'Praga-Południe, Warsaw',
            price: '$35/hr',
            discount: '-35%',
            availability: 'Tomorrow 7:00PM-11:00PM',
            description: 'Cozy French bistro with traditional recipes',
            detailedDescription: 'Bistro Français captures the essence of Parisian dining culture in the heart of Warsaw, offering authentic French cuisine prepared with traditional techniques passed down through generations. Our intimate bistro features rustic décor with vintage French posters, checkered floors, and warm candlelit ambiance that transports guests to the streets of Montmartre. The menu showcases classic dishes like coq au vin, bouillabaisse, and duck confit, complemented by an extensive selection of French wines from Bordeaux, Burgundy, and Champagne regions. Perfect for romantic dinners, intimate celebrations, or experiencing genuine French hospitality.',
            image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
            contact: {
                phone: '+48 22 789 0123',
                email: 'bonjour@bistrofrancais.pl',
                address: 'Francuska 11, 03-906 Warsaw, Poland'
            }
        },
        {
            name: 'Trattoria Roma',
            type: 'Italian Restaurant',
            icon: '🇮🇹',
            location: 'Mokotów, Warsaw',
            price: '$38/hr',
            discount: null,
            availability: 'Today 6:30PM-10:30PM',
            description: 'Authentic Italian trattoria with homemade pasta',
            detailedDescription: 'Trattoria Roma brings the warmth and authenticity of Roman family dining to Warsaw, featuring recipes treasured by Italian families for centuries. Our kitchen specializes in handmade pasta prepared fresh daily, using imported Italian ingredients including San Marzano tomatoes, Parmigiano-Reggiano, and extra virgin olive oil from Tuscany. The trattoria\'s welcoming atmosphere features exposed brick walls, wooden tables, and soft Italian music creating the perfect setting for shared meals and conversation. Our wine selection includes carefully chosen bottles from renowned Italian regions, perfectly paired with traditional dishes that celebrate Italy\'s rich culinary heritage.',
            image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
            contact: {
                phone: '+48 22 890 1234',
                email: 'ciao@trattoriaroma.pl',
                address: 'Puławska 234, 02-670 Warsaw, Poland'
            }
        },
        {
            name: 'Tapas Barcelona',
            type: 'Spanish Restaurant',
            icon: '🇪🇸',
            location: 'Wilanów, Warsaw',
            price: '$32/hr',
            discount: '-25%',
            availability: 'Tomorrow 8:00PM-12:00AM',
            description: 'Vibrant Spanish tapas bar with live flamenco shows',
            detailedDescription: 'Tapas Barcelona recreates the vibrant energy of Spanish tapas culture, offering an extensive selection of traditional small plates perfect for sharing and socializing. Our menu features authentic dishes from across Spain, including patatas bravas, jamón ibérico, paella valenciana, and fresh seafood from Spanish coastlines. The restaurant\'s lively atmosphere includes colorful Spanish tiles, warm lighting, and regular live flamenco performances that transport guests to the heart of Andalusia. Our carefully curated selection of Spanish wines, including Tempranillo, Albariño, and Cava, complements the bold flavors and creates an unforgettable Spanish dining experience.',
            image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&h=400&fit=crop',
            contact: {
                phone: '+48 22 901 2345',
                email: 'hola@tapasbarcelona.pl',
                address: 'Wilanowska 15A, 02-765 Warsaw, Poland'
            }
        },
        {
            name: 'Dragon Garden',
            type: 'Chinese Restaurant',
            icon: '🐉',
            location: 'Ursynów, Warsaw',
            price: '$28/hr',
            discount: '-15%',
            availability: 'Today 12:00PM-9:00PM',
            description: 'Traditional Chinese cuisine with dim sum specialties'
        },
        {
            name: 'Curry House',
            type: 'Indian Restaurant',
            icon: '🍛',
            location: 'Targówek, Warsaw',
            price: '$25/hr',
            discount: '-30%',
            availability: 'Tomorrow 5:00PM-10:00PM',
            description: 'Authentic Indian cuisine with aromatic spices'
        },
        {
            name: 'Mezze Mediterranean',
            type: 'Mediterranean',
            icon: '🫒',
            location: 'Ochota, Warsaw',
            price: '$30/hr',
            discount: null,
            availability: 'Today 6:00PM-10:00PM',
            description: 'Fresh Mediterranean dishes with olive oil and herbs'
        },
        {
            name: 'Seoul Kitchen',
            type: 'Korean Restaurant',
            icon: '🇰🇷',
            location: 'Bemowo, Warsaw',
            price: '$33/hr',
            discount: '-20%',
            availability: 'Tomorrow 7:00PM-11:00PM',
            description: 'Korean BBQ and traditional dishes'
        },
        // Cafés & Coffee Shops
        {
            name: 'Coffee Culture',
            type: 'Specialty Coffee',
            icon: '☕',
            location: 'Śródmieście, Warsaw',
            price: '$15/hr',
            discount: '-10%',
            availability: 'Today 8:00AM-6:00PM',
            description: 'Third-wave coffee shop with single-origin beans'
        },
        {
            name: 'Book & Bean',
            type: 'Book Café',
            icon: '📚',
            location: 'Praga-Północ, Warsaw',
            price: '$12/hr',
            discount: '-25%',
            availability: 'Tomorrow 9:00AM-8:00PM',
            description: 'Cozy bookstore café perfect for reading and studying'
        },
        {
            name: 'Artisan Roasters',
            type: 'Coffee Roastery',
            icon: '☕',
            location: 'Wola, Warsaw',
            price: '$18/hr',
            discount: null,
            availability: 'Today 7:00AM-5:00PM',
            description: 'On-site coffee roasting with barista workshops'
        },
        {
            name: 'Garden Café',
            type: 'Garden Café',
            icon: '🌺',
            location: 'Żoliborz, Warsaw',
            price: '$14/hr',
            discount: '-15%',
            availability: 'Tomorrow 10:00AM-7:00PM',
            description: 'Outdoor café surrounded by beautiful gardens'
        },
        {
            name: 'Vintage Brew',
            type: 'Vintage Café',
            icon: '☕',
            location: 'Mokotów, Warsaw',
            price: '$16/hr',
            discount: '-20%',
            availability: 'Today 8:30AM-6:30PM',
            description: 'Retro-style café with vintage furniture and music'
        },
        // Bars & Pubs
        {
            name: 'Whiskey Library',
            type: 'Whiskey Bar',
            icon: '🥃',
            location: 'Śródmieście, Warsaw',
            price: '$45/hr',
            discount: null,
            availability: 'Today 6:00PM-2:00AM',
            description: 'Premium whiskey bar with extensive collection'
        },
        {
            name: 'Craft Beer Hub',
            type: 'Craft Brewery',
            icon: '🍺',
            location: 'Praga-Południe, Warsaw',
            price: '$35/hr',
            discount: '-30%',
            availability: 'Tomorrow 4:00PM-12:00AM',
            description: 'Local craft brewery with rotating beer selection'
        },
        {
            name: 'Wine & Dine',
            type: 'Wine Bar',
            icon: '🍷',
            location: 'Wilanów, Warsaw',
            price: '$40/hr',
            discount: '-25%',
            availability: 'Today 5:00PM-11:00PM',
            description: 'Sophisticated wine bar with cheese pairings'
        },
        {
            name: 'Sports Pub Central',
            type: 'Sports Bar',
            icon: '⚽',
            location: 'Wola, Warsaw',
            price: '$25/hr',
            discount: '-15%',
            availability: 'Tomorrow 3:00PM-1:00AM',
            description: 'Sports bar with multiple screens and game day specials'
        },
        {
            name: 'Jazz Lounge',
            type: 'Jazz Bar',
            icon: '🎷',
            location: 'Mokotów, Warsaw',
            price: '$50/hr',
            discount: null,
            availability: 'Today 8:00PM-2:00AM',
            description: 'Intimate jazz bar with live performances'
        },
        // Clubs & Nightlife
        {
            name: 'Neon Nights',
            type: 'Dance Club',
            icon: '💃',
            location: 'Śródmieście, Warsaw',
            price: '$100/hr',
            discount: '-40%',
            availability: 'Tomorrow 10:00PM-4:00AM',
            description: 'High-energy dance club with top DJs'
        },
        {
            name: 'Electronic Pulse',
            type: 'Electronic Club',
            icon: '🎧',
            location: 'Praga-Północ, Warsaw',
            price: '$85/hr',
            discount: '-20%',
            availability: 'Today 9:00PM-3:00AM',
            description: 'Underground electronic music venue'
        },
        {
            name: 'Rooftop Sky',
            type: 'Rooftop Bar',
            icon: '🌃',
            location: 'Wola, Warsaw',
            price: '$65/hr',
            discount: null,
            availability: 'Tomorrow 6:00PM-1:00AM',
            description: 'Panoramic city views from rooftop bar'
        },
        {
            name: 'Karaoke Palace',
            type: 'Karaoke Bar',
            icon: '🎤',
            location: 'Ursynów, Warsaw',
            price: '$30/hr',
            discount: '-35%',
            availability: 'Today 7:00PM-2:00AM',
            description: 'Private karaoke rooms with extensive song library'
        },
        // Event Halls & Venues
        {
            name: 'Crystal Ballroom',
            type: 'Wedding Venue',
            icon: '💒',
            location: 'Wilanów, Warsaw',
            price: '$200/hr',
            discount: '-25%',
            availability: 'Next Weekend',
            description: 'Elegant ballroom perfect for weddings and receptions'
        },
        {
            name: 'Grand Conference Center',
            type: 'Conference Hall',
            icon: '🏢',
            location: 'Śródmieście, Warsaw',
            price: '$150/hr',
            discount: null,
            availability: 'This Week',
            description: 'Professional conference facilities with AV equipment'
        },
        {
            name: 'Art Gallery Loft',
            type: 'Art Gallery',
            icon: '🎨',
            location: 'Praga-Północ, Warsaw',
            price: '$80/hr',
            discount: '-30%',
            availability: 'Tomorrow 10:00AM-6:00PM',
            description: 'Contemporary art space for exhibitions and events'
        },
        {
            name: 'Theater Workshop',
            type: 'Theater Space',
            icon: '🎭',
            location: 'Żoliborz, Warsaw',
            price: '$60/hr',
            discount: '-20%',
            availability: 'Today 7:00PM-11:00PM',
            description: 'Intimate theater space for performances and rehearsals'
        },
        {
            name: 'Music Studio Pro',
            type: 'Recording Studio',
            icon: '🎵',
            location: 'Mokotów, Warsaw',
            price: '$75/hr',
            discount: null,
            availability: 'Tomorrow 2:00PM-10:00PM',
            description: 'Professional recording studio with mixing console'
        },
        // Hotels & Accommodation
        {
            name: 'Luxury Palace Hotel',
            type: 'Luxury Hotel',
            icon: '🏨',
            location: 'Śródmieście, Warsaw',
            price: '$300/night',
            discount: '-20%',
            availability: 'This Weekend',
            description: 'Five-star luxury hotel with spa and fine dining'
        },
        {
            name: 'Boutique Garden Hotel',
            type: 'Boutique Hotel',
            icon: '🌿',
            location: 'Żoliborz, Warsaw',
            price: '$180/night',
            discount: '-35%',
            availability: 'Next Week',
            description: 'Charming boutique hotel with garden views'
        },
        {
            name: 'Business Center Hotel',
            type: 'Business Hotel',
            icon: '💼',
            location: 'Wola, Warsaw',
            price: '$120/night',
            discount: '-15%',
            availability: 'Tomorrow',
            description: 'Modern business hotel with conference facilities'
        },
        {
            name: 'Historic Manor',
            type: 'Historic Hotel',
            icon: '🏛️',
            location: 'Wilanów, Warsaw',
            price: '$250/night',
            discount: null,
            availability: 'This Month',
            description: 'Restored 18th-century manor house'
        },
        // Co-working & Office Spaces
        {
            name: 'Innovation Hub',
            type: 'Co-working Space',
            icon: '💡',
            location: 'Śródmieście, Warsaw',
            price: '$25/hr',
            discount: '-40%',
            availability: 'Today 9:00AM-6:00PM',
            description: 'Modern co-working space for startups and freelancers'
        },
        {
            name: 'Creative Commons',
            type: 'Creative Space',
            icon: '🎨',
            location: 'Praga-Południe, Warsaw',
            price: '$20/hr',
            discount: '-25%',
            availability: 'Tomorrow 8:00AM-8:00PM',
            description: 'Collaborative workspace for creative professionals'
        },
        {
            name: 'Tech Campus',
            type: 'Tech Hub',
            icon: '💻',
            location: 'Mokotów, Warsaw',
            price: '$30/hr',
            discount: null,
            availability: 'Today 24/7',
            description: 'High-tech workspace with fast internet and equipment'
        },
        {
            name: 'Executive Suites',
            type: 'Executive Office',
            icon: '🏢',
            location: 'Wola, Warsaw',
            price: '$50/hr',
            discount: '-20%',
            availability: 'This Week',
            description: 'Premium executive office space with meeting rooms'
        },
        // Sports & Fitness
        {
            name: 'Fitness Arena',
            type: 'Gym & Fitness',
            icon: '💪',
            location: 'Ursynów, Warsaw',
            price: '$35/hr',
            discount: '-30%',
            availability: 'Today 6:00AM-10:00PM',
            description: 'Modern fitness center with personal training'
        },
        {
            name: 'Aqua Center',
            type: 'Swimming Pool',
            icon: '🏊',
            location: 'Mokotów, Warsaw',
            price: '$40/hr',
            discount: '-15%',
            availability: 'Tomorrow 7:00AM-9:00PM',
            description: 'Olympic-size swimming pool with spa facilities'
        },
        {
            name: 'Tennis Club Elite',
            type: 'Tennis Court',
            icon: '🎾',
            location: 'Wilanów, Warsaw',
            price: '$45/hr',
            discount: null,
            availability: 'Today 8:00AM-8:00PM',
            description: 'Professional tennis courts with coaching available'
        },
        {
            name: 'Boxing Gym Pro',
            type: 'Boxing Gym',
            icon: '🥊',
            location: 'Praga-Północ, Warsaw',
            price: '$25/hr',
            discount: '-25%',
            availability: 'Tomorrow 6:00AM-10:00PM',
            description: 'Professional boxing gym with training equipment'
        },
        // Entertainment & Recreation
        {
            name: 'Virtual Reality Zone',
            type: 'VR Gaming',
            icon: '🥽',
            location: 'Targówek, Warsaw',
            price: '$35/hr',
            discount: '-20%',
            availability: 'Today 2:00PM-10:00PM',
            description: 'Cutting-edge VR gaming experience'
        },
        {
            name: 'Bowling Paradise',
            type: 'Bowling Alley',
            icon: '🎳',
            location: 'Ochota, Warsaw',
            price: '$30/hr',
            discount: '-35%',
            availability: 'Tomorrow 12:00PM-12:00AM',
            description: 'Modern bowling alley with arcade games'
        },
        {
            name: 'Escape Room Adventures',
            type: 'Escape Room',
            icon: '🔐',
            location: 'Śródmieście, Warsaw',
            price: '$40/hr',
            discount: null,
            availability: 'Today 4:00PM-10:00PM',
            description: 'Challenging escape rooms with various themes'
        },
        {
            name: 'Cinema Lux',
            type: 'Private Cinema',
            icon: '🎬',
            location: 'Mokotów, Warsaw',
            price: '$80/hr',
            discount: '-30%',
            availability: 'Tomorrow 6:00PM-12:00AM',
            description: 'Private cinema screening room with luxury seating'
        },
        // Additional Restaurants
        {
            name: 'Farm to Table',
            type: 'Organic Restaurant',
            icon: '🌱',
            location: 'Żoliborz, Warsaw',
            price: '$42/hr',
            discount: '-25%',
            availability: 'Today 5:00PM-9:00PM',
            description: 'Farm-fresh organic cuisine with seasonal menu'
        },
        {
            name: 'Grill Master',
            type: 'BBQ Restaurant',
            icon: '🔥',
            location: 'Wola, Warsaw',
            price: '$35/hr',
            discount: '-20%',
            availability: 'Tomorrow 4:00PM-10:00PM',
            description: 'Authentic BBQ with smoked meats and craft beer'
        },
        {
            name: 'Seafood Wharf',
            type: 'Seafood Restaurant',
            icon: '🦞',
            location: 'Wilanów, Warsaw',
            price: '$50/hr',
            discount: null,
            availability: 'Today 6:00PM-11:00PM',
            description: 'Fresh seafood with waterfront atmosphere'
        },
        {
            name: 'Vegetarian Bliss',
            type: 'Vegetarian Restaurant',
            icon: '🥬',
            location: 'Praga-Południe, Warsaw',
            price: '$28/hr',
            discount: '-30%',
            availability: 'Tomorrow 12:00PM-9:00PM',
            description: 'Creative vegetarian cuisine with global influences'
        },
        {
            name: 'Pizza Artisan',
            type: 'Pizzeria',
            icon: '🍕',
            location: 'Ursynów, Warsaw',
            price: '$25/hr',
            discount: '-15%',
            availability: 'Today 12:00PM-11:00PM',
            description: 'Wood-fired pizza with artisan toppings'
        },
        {
            name: 'Burger Junction',
            type: 'Burger Restaurant',
            icon: '🍔',
            location: 'Bemowo, Warsaw',
            price: '$22/hr',
            discount: '-25%',
            availability: 'Tomorrow 11:00AM-10:00PM',
            description: 'Gourmet burgers with premium ingredients'
        },
        {
            name: 'Noodle House',
            type: 'Asian Noodles',
            icon: '🍜',
            location: 'Targówek, Warsaw',
            price: '$20/hr',
            discount: '-35%',
            availability: 'Today 11:30AM-9:30PM',
            description: 'Authentic Asian noodle soups and stir-fries'
        },
        {
            name: 'Dessert Heaven',
            type: 'Dessert Café',
            icon: '🍰',
            location: 'Śródmieście, Warsaw',
            price: '$18/hr',
            discount: '-20%',
            availability: 'Tomorrow 10:00AM-8:00PM',
            description: 'Artisan desserts and specialty coffee'
        },
        // More Bars & Lounges
        {
            name: 'Cocktail Laboratory',
            type: 'Cocktail Bar',
            icon: '🍸',
            location: 'Mokotów, Warsaw',
            price: '$55/hr',
            discount: null,
            availability: 'Today 7:00PM-2:00AM',
            description: 'Molecular mixology with innovative cocktails'
        },
        {
            name: 'Cigar Lounge Elite',
            type: 'Cigar Lounge',
            icon: '🚬',
            location: 'Śródmieście, Warsaw',
            price: '$70/hr',
            discount: '-15%',
            availability: 'Tomorrow 6:00PM-1:00AM',
            description: 'Premium cigar lounge with whiskey selection'
        },
        {
            name: 'Tiki Paradise',
            type: 'Tiki Bar',
            icon: '🌺',
            location: 'Wola, Warsaw',
            price: '$40/hr',
            discount: '-30%',
            availability: 'Today 5:00PM-12:00AM',
            description: 'Tropical tiki bar with exotic cocktails'
        },
        {
            name: 'Beer Garden Oasis',
            type: 'Beer Garden',
            icon: '🌳',
            location: 'Żoliborz, Warsaw',
            price: '$30/hr',
            discount: '-25%',
            availability: 'Tomorrow 2:00PM-10:00PM',
            description: 'Outdoor beer garden with traditional atmosphere'
        },
        // Specialty Venues
        {
            name: 'Chef\'s Table',
            type: 'Private Dining',
            icon: '👨‍🍳',
            location: 'Wilanów, Warsaw',
            price: '$120/hr',
            discount: '-20%',
            availability: 'Next Weekend',
            description: 'Exclusive chef\'s table experience with wine pairing'
        },
        {
            name: 'Rooftop Garden',
            type: 'Garden Venue',
            icon: '🌸',
            location: 'Praga-Południe, Warsaw',
            price: '$45/hr',
            discount: null,
            availability: 'Today 10:00AM-6:00PM',
            description: 'Beautiful rooftop garden for outdoor events'
        },
        {
            name: 'Wine Cellar',
            type: 'Wine Cellar',
            icon: '🍇',
            location: 'Mokotów, Warsaw',
            price: '$65/hr',
            discount: '-35%',
            availability: 'Tomorrow 4:00PM-10:00PM',
            description: 'Historic wine cellar with tasting sessions'
        },
        {
            name: 'Library Lounge',
            type: 'Literary Café',
            icon: '📖',
            location: 'Ursynów, Warsaw',
            price: '$15/hr',
            discount: '-10%',
            availability: 'Today 9:00AM-9:00PM',
            description: 'Quiet literary café perfect for book lovers'
        },
        // Cultural Venues
        {
            name: 'Opera House Chamber',
            type: 'Opera Venue',
            icon: '🎭',
            location: 'Śródmieście, Warsaw',
            price: '$200/hr',
            discount: null,
            availability: 'Special Events',
            description: 'Intimate opera chamber for classical performances'
        },
        {
            name: 'Dance Studio Pro',
            type: 'Dance Studio',
            icon: '💃',
            location: 'Praga-Północ, Warsaw',
            price: '$40/hr',
            discount: '-25%',
            availability: 'Today 6:00PM-10:00PM',
            description: 'Professional dance studio with mirrors and sound system'
        },
        {
            name: 'Photography Studio',
            type: 'Photo Studio',
            icon: '📸',
            location: 'Wola, Warsaw',
            price: '$60/hr',
            discount: '-20%',
            availability: 'Tomorrow 10:00AM-6:00PM',
            description: 'Professional photography studio with lighting equipment'
        },
        {
            name: 'Ceramics Workshop',
            type: 'Art Workshop',
            icon: '🏺',
            location: 'Żoliborz, Warsaw',
            price: '$35/hr',
            discount: '-30%',
            availability: 'Today 2:00PM-8:00PM',
            description: 'Pottery and ceramics workshop with kilns'
        },
        // Health & Wellness
        {
            name: 'Spa Sanctuary',
            type: 'Spa & Wellness',
            icon: '🧘',
            location: 'Wilanów, Warsaw',
            price: '$80/hr',
            discount: '-25%',
            availability: 'Tomorrow 9:00AM-7:00PM',
            description: 'Luxury spa with massage and wellness treatments'
        },
        {
            name: 'Yoga Studio Zen',
            type: 'Yoga Studio',
            icon: '🧘‍♀️',
            location: 'Mokotów, Warsaw',
            price: '$30/hr',
            discount: '-20%',
            availability: 'Today 7:00AM-9:00PM',
            description: 'Peaceful yoga studio with experienced instructors'
        },
        {
            name: 'Pilates Precision',
            type: 'Pilates Studio',
            icon: '🤸‍♀️',
            location: 'Ursynów, Warsaw',
            price: '$35/hr',
            discount: null,
            availability: 'Tomorrow 8:00AM-8:00PM',
            description: 'Specialized pilates studio with reformer equipment'
        },
        {
            name: 'Meditation Center',
            type: 'Meditation Space',
            icon: '🕯️',
            location: 'Żoliborz, Warsaw',
            price: '$25/hr',
            discount: '-15%',
            availability: 'Today 6:00AM-10:00PM',
            description: 'Tranquil meditation center for mindfulness practice'
        },
        // Shopping & Retail
        {
            name: 'Boutique Showcase',
            type: 'Fashion Boutique',
            icon: '👗',
            location: 'Śródmieście, Warsaw',
            price: '$50/hr',
            discount: '-30%',
            availability: 'Tomorrow 10:00AM-6:00PM',
            description: 'Elegant fashion boutique for private shopping'
        },
        {
            name: 'Vintage Market',
            type: 'Vintage Store',
            icon: '🕰️',
            location: 'Praga-Północ, Warsaw',
            price: '$25/hr',
            discount: '-25%',
            availability: 'Today 11:00AM-7:00PM',
            description: 'Curated vintage items and antiques'
        },
        {
            name: 'Artisan Crafts',
            type: 'Craft Store',
            icon: '🎨',
            location: 'Wola, Warsaw',
            price: '$20/hr',
            discount: '-35%',
            availability: 'Tomorrow 9:00AM-5:00PM',
            description: 'Handmade crafts and artisan goods'
        },
        // Technology & Innovation
        {
            name: 'Startup Incubator',
            type: 'Innovation Hub',
            icon: '🚀',
            location: 'Mokotów, Warsaw',
            price: '$40/hr',
            discount: '-20%',
            availability: 'Today 24/7',
            description: 'Startup incubator with mentorship and resources'
        },
        {
            name: 'Gaming Lounge',
            type: 'Gaming Center',
            icon: '🎮',
            location: 'Targówek, Warsaw',
            price: '$25/hr',
            discount: '-40%',
            availability: 'Tomorrow 2:00PM-12:00AM',
            description: 'Gaming lounge with latest consoles and PCs'
        },
        {
            name: 'Maker Space',
            type: 'Workshop Space',
            icon: '🔧',
            location: 'Praga-Południe, Warsaw',
            price: '$35/hr',
            discount: null,
            availability: 'Today 10:00AM-8:00PM',
            description: '3D printing and electronics workshop space'
        },
        // Additional Unique Venues
        {
            name: 'Greenhouse Café',
            type: 'Botanical Café',
            icon: '🌿',
            location: 'Ursynów, Warsaw',
            price: '$22/hr',
            discount: '-15%',
            availability: 'Tomorrow 8:00AM-6:00PM',
            description: 'Café surrounded by tropical plants and flowers'
        },
        {
            name: 'Vintage Train Car',
            type: 'Unique Venue',
            icon: '🚂',
            location: 'Praga-Północ, Warsaw',
            price: '$75/hr',
            discount: '-25%',
            availability: 'Today 5:00PM-11:00PM',
            description: 'Restored vintage train car converted to dining space'
        },
        {
            name: 'Observatory Lounge',
            type: 'Observatory',
            icon: '🔭',
            location: 'Wilanów, Warsaw',
            price: '$55/hr',
            discount: null,
            availability: 'Tomorrow 8:00PM-12:00AM',
            description: 'Astronomical observatory with telescope viewing'
        },
        {
            name: 'Underground Speakeasy',
            type: 'Speakeasy Bar',
            icon: '🕵️',
            location: 'Śródmieście, Warsaw',
            price: '$60/hr',
            discount: '-30%',
            availability: 'Today 9:00PM-3:00AM',
            description: 'Hidden speakeasy with prohibition-era atmosphere'
        },
        {
            name: 'Floating Restaurant',
            type: 'Boat Restaurant',
            icon: '⛵',
            location: 'Żoliborz, Warsaw',
            price: '$90/hr',
            discount: '-20%',
            availability: 'Tomorrow 6:00PM-10:00PM',
            description: 'Unique dining experience on a floating restaurant'
        },
        {
            name: 'Tree House Café',
            type: 'Tree House',
            icon: '🌳',
            location: 'Bemowo, Warsaw',
            price: '$35/hr',
            discount: '-25%',
            availability: 'Today 10:00AM-8:00PM',
            description: 'Elevated café built around a large oak tree'
        },
        // Additional Business Venues
        {
            name: 'Executive Boardroom',
            type: 'Meeting Room',
            icon: '🏛️',
            location: 'Wola, Warsaw',
            price: '$80/hr',
            discount: null,
            availability: 'This Week 9:00AM-5:00PM',
            description: 'Professional boardroom for executive meetings'
        },
        {
            name: 'Training Center',
            type: 'Training Facility',
            icon: '🎓',
            location: 'Mokotów, Warsaw',
            price: '$45/hr',
            discount: '-15%',
            availability: 'Tomorrow 8:00AM-6:00PM',
            description: 'Modern training facility with AV equipment'
        },
        {
            name: 'Presentation Theater',
            type: 'Auditorium',
            icon: '🎤',
            location: 'Śródmieście, Warsaw',
            price: '$120/hr',
            discount: '-25%',
            availability: 'Next Week',
            description: 'Professional auditorium for presentations and lectures'
        },
        // Food Halls & Markets
        {
            name: 'Gourmet Food Hall',
            type: 'Food Hall',
            icon: '🍽️',
            location: 'Ochota, Warsaw',
            price: '$40/hr',
            discount: '-30%',
            availability: 'Today 11:00AM-9:00PM',
            description: 'Diverse food vendors under one roof'
        },
        {
            name: 'Farmers Market Space',
            type: 'Market Venue',
            icon: '🥕',
            location: 'Żoliborz, Warsaw',
            price: '$30/hr',
            discount: '-20%',
            availability: 'Tomorrow 7:00AM-3:00PM',
            description: 'Fresh produce and artisan goods market'
        },
        {
            name: 'Street Food Corner',
            type: 'Street Food',
            icon: '🌮',
            location: 'Praga-Południe, Warsaw',
            price: '$25/hr',
            discount: '-35%',
            availability: 'Today 12:00PM-10:00PM',
            description: 'Authentic street food from around the world'
        },
        // Seasonal & Outdoor Venues
        {
            name: 'Winter Lodge',
            type: 'Seasonal Venue',
            icon: '🎿',
            location: 'Ursynów, Warsaw',
            price: '$50/hr',
            discount: '-25%',
            availability: 'Winter Season',
            description: 'Cozy winter lodge with fireplace and hot drinks'
        },
        {
            name: 'Summer Pavilion',
            type: 'Outdoor Pavilion',
            icon: '☀️',
            location: 'Wilanów, Warsaw',
            price: '$45/hr',
            discount: null,
            availability: 'Summer Season',
            description: 'Open-air pavilion perfect for summer events'
        },
        {
            name: 'Beach Bar Simulator',
            type: 'Beach Bar',
            icon: '🏖️',
            location: 'Mokotów, Warsaw',
            price: '$35/hr',
            discount: '-20%',
            availability: 'Today 4:00PM-11:00PM',
            description: 'Indoor beach bar with sand floors and tropical drinks'
        },
        // Additional Specialty Restaurants
        {
            name: 'Molecular Gastronomy',
            type: 'Modern Cuisine',
            icon: '⚗️',
            location: 'Śródmieście, Warsaw',
            price: '$85/hr',
            discount: null,
            availability: 'Tomorrow 7:00PM-11:00PM',
            description: 'Cutting-edge molecular gastronomy experience'
        },
        {
            name: 'Raw Food Kitchen',
            type: 'Raw Food Restaurant',
            icon: '🥗',
            location: 'Żoliborz, Warsaw',
            price: '$35/hr',
            discount: '-25%',
            availability: 'Today 12:00PM-8:00PM',
            description: 'Healthy raw food cuisine with superfoods'
        },
        {
            name: 'Comfort Food Diner',
            type: 'Diner',
            icon: '🥧',
            location: 'Wola, Warsaw',
            price: '$25/hr',
            discount: '-30%',
            availability: 'Tomorrow 8:00AM-10:00PM',
            description: 'Classic American diner with comfort food favorites'
        },
        {
            name: 'Tea House Ceremony',
            type: 'Tea House',
            icon: '🍵',
            location: 'Praga-Północ, Warsaw',
            price: '$20/hr',
            discount: '-15%',
            availability: 'Today 10:00AM-6:00PM',
            description: 'Traditional tea house with ceremony service'
        },
        // Final Specialty Venues
        {
            name: 'Chocolate Factory',
            type: 'Chocolate Workshop',
            icon: '🍫',
            location: 'Bemowo, Warsaw',
            price: '$40/hr',
            discount: '-20%',
            availability: 'Tomorrow 1:00PM-7:00PM',
            description: 'Artisan chocolate making workshop and tasting'
        },
        {
            name: 'Perfume Atelier',
            type: 'Perfume Workshop',
            icon: '🌹',
            location: 'Mokotów, Warsaw',
            price: '$55/hr',
            discount: null,
            availability: 'Today 11:00AM-5:00PM',
            description: 'Create your own signature perfume blend'
        },
        {
            name: 'Crystal Healing Center',
            type: 'Wellness Center',
            icon: '💎',
            location: 'Ursynów, Warsaw',
            price: '$45/hr',
            discount: '-25%',
            availability: 'Tomorrow 9:00AM-7:00PM',
            description: 'Crystal healing and energy therapy sessions'
        },
        {
            name: 'Astronomy Café',
            type: 'Space Café',
            icon: '🌌',
            location: 'Wilanów, Warsaw',
            price: '$30/hr',
            discount: '-15%',
            availability: 'Today 6:00PM-12:00AM',
            description: 'Space-themed café with planetarium ceiling'
        },
        {
            name: 'Retro Arcade Bar',
            type: 'Arcade Bar',
            icon: '🕹️',
            location: 'Targówek, Warsaw',
            price: '$35/hr',
            discount: '-30%',
            availability: 'Tomorrow 3:00PM-1:00AM',
            description: 'Vintage arcade games with craft cocktails'
        },
        {
            name: 'Silent Disco Venue',
            type: 'Silent Disco',
            icon: '🎧',
            location: 'Praga-Południe, Warsaw',
            price: '$50/hr',
            discount: '-35%',
            availability: 'Today 8:00PM-2:00AM',
            description: 'Unique silent disco experience with wireless headphones'
        }
    ]
};

// Export for use in other modules
window.AppConfig = AppConfig;