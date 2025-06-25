# VenueSpot - Venue Marketplace

A modern web application connecting venue owners with customers, allowing venues to sell empty spots at promotional prices.

## Project Structure

```
VenueSpot/
├── index.html                          # Main HTML file
├── README.md                           # Project documentation
├── assets/
│   ├── css/
│   │   ├── main.css                    # Base styles, typography, layout
│   │   ├── components.css              # Component-specific styles
│   │   └── responsive.css              # Media queries and responsive design
│   └── js/
│       ├── app.js                      # Main application entry point
│       ├── config.js                   # Application configuration and data
│       ├── components/
│       │   ├── animation-manager.js    # Scroll animations and effects
│       │   ├── feature-manager.js      # Features section management
│       │   ├── modal-manager.js        # Modal dialogs management
│       │   └── venue-manager.js        # Venue listings management
│       ├── templates/
│       │   └── form-templates.js       # HTML templates for forms
│       └── utils/
│           └── ui-components.js        # Reusable UI component builders
```

## Features

- **Responsive Design**: Mobile-first approach with responsive layouts
- **Modern UI**: Clean, professional interface with smooth animations
- **Modular Architecture**: Organized code structure for maintainability
- **Component-Based**: Reusable components for scalability
- **Interactive Elements**: Modal dialogs, smooth scrolling, hover effects

## File Breakdown

### HTML
- **index.html**: Clean semantic HTML structure with external CSS/JS references

### CSS Architecture
- **main.css**: Core styles (reset, base, layout, header, hero, animations)
- **components.css**: Component styles (buttons, cards, modals, forms)
- **responsive.css**: Mobile and tablet responsive breakpoints

### JavaScript Modules
- **config.js**: Application data (features, venues)
- **app.js**: Main initialization and coordination
- **modal-manager.js**: Modal dialog functionality
- **venue-manager.js**: Venue listing and interaction
- **feature-manager.js**: Features section rendering
- **animation-manager.js**: Scroll animations and smooth effects
- **ui-components.js**: HTML template generators
- **form-templates.js**: Form HTML templates

## Getting Started

1. Open `index.html` in a web browser
2. The application will automatically initialize all components
3. Navigate through different sections using the navigation menu
4. Click buttons to open modal dialogs for venue owners and customers

## Key Improvements Over Original

1. **Separation of Concerns**: Each file has a single responsibility
2. **Maintainability**: Easy to locate and modify specific functionality
3. **Scalability**: Simple to add new features without cluttering
4. **Team Collaboration**: Multiple developers can work on different files
5. **Performance**: Conditional loading and better organization
6. **Testing**: Individual modules can be unit tested
7. **Code Reusability**: Components can be imported where needed

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Progressive enhancement approach

## Authentication System

VenueSpot now includes a complete login and registration system with the following features:

### Database Management
- **SQLite backend database**: Persistent server-side database for all user data
- **User management**: Complete CRUD operations with server-side validation
- **Session management**: Secure JWT tokens with server-side validation
- **Data persistence**: Reliable database storage with backup capabilities

### User Authentication
- **Registration**: New users can create accounts as customers or venue owners
- **Login/Logout**: Secure authentication with session management
- **Profile management**: Users can update their personal information
- **User types**: Customers and venue owners with different access levels

### Features
- **Form validation**: Client-side validation for all forms
- **Error handling**: User-friendly error messages
- **Responsive design**: All authentication forms work on mobile devices
- **Admin panel**: Development tool to view database statistics and manage data

### Sample Data
The system automatically creates sample users for testing:
- **john@example.com** / password123 (Customer)
- **jane@example.com** / password123 (Venue Owner)
- **mike@example.com** / password123 (Customer)

### Database Schema
The application uses SQLite with properly normalized tables:
- **Users table**: Secure user profiles with hashed passwords
- **Venues table**: Venue listings with owner relationships
- **Sessions table**: Secure session management
- **Analytics tables**: Performance tracking and reporting

See [`BACKEND_SETUP.md`](BACKEND_SETUP.md) for complete database schema details.

## Architecture

### Current Features
- **SQLite Backend**: Persistent database with full CRUD operations
- **Secure Authentication**: Hashed passwords and JWT session management
- **Admin Dashboard**: Complete administrative interface with analytics
- **RESTful API**: Well-structured backend API with proper routing
- **Real-time Analytics**: Performance tracking and user behavior insights

### Future Enhancements
- Real-time messaging and notifications
- Payment processing integration
- Advanced filtering and search capabilities
- Mobile app development
- Third-party API integrations

## Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Node.js with Express framework
- **Database**: SQLite with proper migrations
- **Authentication**: JWT tokens with bcrypt password hashing
- **Analytics**: Built-in performance tracking and reporting