# Planificador de Anime

## Overview

This is a Spanish-language web application that helps users plan their anime watching schedule. The application allows users to search for anime titles, specify how many episodes they plan to watch per day, and calculates when they will finish watching each series. It features integration with the Jikan API (MyAnimeList unofficial API) for anime data retrieval and uses browser localStorage for data persistence. The app includes a calendar view to visualize the watching schedule.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
**Single-Page Application (SPA)**: The application is built as a vanilla JavaScript SPA with no framework dependencies. This approach was chosen for simplicity and minimal setup requirements, making it ideal for a lightweight planning tool.

**Responsive Design**: Uses Tailwind CSS for utility-first styling with a mobile-first approach. The grid layout adapts from single-column on mobile to two-column on larger screens, ensuring usability across devices.

**Component Structure**:
- Search interface with autocomplete suggestions
- Anime list management with add/remove functionality
- Calendar visualization for viewing schedule
- Episode tracking per day configuration

### Data Management
**Client-Side Storage**: Uses browser localStorage for data persistence. This eliminates the need for a backend database while maintaining user data across sessions. The tradeoff is that data is device-specific and not synchronized across browsers.

**Data Model**: Anime entries are stored as JSON objects containing:
- Anime metadata (title, episodes, image)
- User preferences (episodes per day, start date)
- Calculated completion dates

**State Management**: Application state is managed through vanilla JavaScript with a global `animes` array that syncs with localStorage on each modification.

### External API Integration
**Jikan API Integration**: The application uses the Jikan API (v4) for anime search functionality. This provides access to MyAnimeList's extensive anime database without requiring direct MAL API authentication.

**Search Debouncing**: Implements 500ms debounce timeout to reduce API calls and comply with rate limiting. Minimum 3-character query requirement further optimizes API usage.

**Error Handling**: Includes try-catch blocks for API failures with user-friendly error messages displayed in the suggestions dropdown.

### UI/UX Patterns
**Progressive Enhancement**: The search functionality shows/hides suggestions dynamically based on user input and API responses.

**Visual Feedback**: 
- Active calendar days are marked with purple dots to indicate scheduled viewing
- Hover states on interactive elements for better user experience
- Loading states during API calls (implicit through debouncing)

**Accessibility Considerations**: Uses semantic HTML, proper input labels, and Font Awesome icons with accompanying text for better screen reader support.

## External Dependencies

### Third-Party APIs
- **Jikan API (v4)**: `https://api.jikan.moe/v4/anime` - Unofficial MyAnimeList API for anime search and metadata retrieval. Free tier with rate limiting applies.

### CDN Libraries
- **Tailwind CSS**: `https://cdn.tailwindcss.com` - Utility-first CSS framework for responsive styling
- **Font Awesome 6.0.0**: Icon library for UI elements (search, TV, calendar icons)
- **Google Fonts - Roboto**: Typography for consistent cross-platform font rendering

### Browser APIs
- **localStorage**: Client-side data persistence for anime list and user preferences
- **Fetch API**: HTTP requests to Jikan API for anime search functionality
- **Date API**: Date calculations for schedule planning and calendar rendering

### Development Notes
The application requires no build process or package management, making it deployable as static files to any web server or hosting platform. The only runtime requirement is a modern web browser with ES6+ JavaScript support.

## Recent Changes (November 2025)

### Security and Robustness Improvements
- Fixed XSS vulnerability by implementing `escapeHtml()` function for user-generated content
- Replaced inline onclick handlers with programmatic event listeners to prevent JSON injection issues
- Added robust duration parsing with fallback values (default: 24 minutes) for API responses with missing or invalid duration data

### Error Handling Enhancements
- Added user-visible error messages for API failures
- Implemented "No results found" messaging for empty search results
- Added console error logging for debugging purposes

### Code Quality
- Event delegation pattern for suggestion items using data-index attributes
- Consistent error handling across all async operations
- Improved code maintainability with helper functions (escapeHtml, parseDuration)
