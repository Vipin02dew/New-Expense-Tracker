# Expense Tracker PWA

## Overview

A Progressive Web App for personal and group expense management with offline-first capabilities, gamification, and visual analytics. The application enables users to track personal expenses, split bills with groups, set savings goals, and unlock achievements through gamified features. Built as a client-side PWA with local storage persistence, it provides a native app-like experience with full offline functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Design Pattern**: Single Page Application (SPA) with screen-based navigation
- **State Management**: Centralized `appState` object managing user data, expenses, goals, groups, and achievements
- **Rationale**: Vanilla JS chosen for simplicity and minimal dependencies, reducing bundle size and improving load times for a PWA. Screen-based navigation provides mobile-app-like experience.

### Data Storage & Persistence
- **Primary Storage**: Browser localStorage for all application state
- **Data Structure**: JSON serialization of the `appState` object
- **Offline-First Strategy**: All data stored locally; no backend required
- **Import/Export**: Excel (XLSX) format support for data portability and backup
- **Rationale**: localStorage provides instant access, complete offline functionality, and zero server costs. Excel export enables user data ownership and migration.

### PWA Architecture
- **Service Worker**: Cache-first strategy for static assets and application shell
- **Cache Strategy**: Pre-cache core files on install, runtime cache for external CDN resources
- **Manifest**: Configured for standalone display mode with custom theme colors and icons
- **Installability**: Deferred prompt handling for add-to-homescreen functionality
- **Rationale**: Offline-first PWA provides native app experience without app store deployment, instant updates, and cross-platform compatibility.

### Visualization & Analytics
- **Charting Library**: Chart.js 4.4.0 (loaded via CDN)
- **Chart Types**: Line charts (weekly trends), Doughnut charts (category breakdown)
- **Real-time KPIs**: Daily spend, monthly total, average daily spend, budget remaining
- **Calculation Engine**: Client-side aggregation and statistical analysis
- **Rationale**: Chart.js provides lightweight, responsive visualizations suitable for mobile devices. Client-side calculations eliminate server dependency.

### Feature Architecture

#### Smart Category Detection
- **Pattern Matching**: Keyword-based category suggestion using predefined dictionary
- **Categories**: Food, Transport, Shopping, Entertainment, Bills, Healthcare, Education, Other
- **Algorithm**: Description text matching against keyword arrays per category
- **Rationale**: Reduces manual input friction, improves data consistency, and enhances user experience.

#### Group Expense Management
- **Group Model**: Unique group codes for sharing, member lists, shared expense pool
- **Split Calculation**: Automatic fair distribution of expenses among group members
- **Attribution**: Timestamp and member tracking for all group transactions
- **Rationale**: Enables collaborative expense tracking without server-side complexity or authentication.

#### Gamification System
- **Achievement Engine**: Condition-based unlocking using state evaluation functions
- **Achievements**: First Entry, Money Master (100+ expenses), Strategic Saver, Goal Achiever, streak-based rewards
- **Streak Tracking**: Daily login monitoring with localStorage-based persistence
- **Visual Feedback**: Snapchat-style celebratory animations for budget milestones
- **Rationale**: Gamification drives engagement and encourages positive financial behaviors through intrinsic motivation.

#### Savings Goals & Projections
- **Goal System**: Custom targets with manual contribution tracking and progress visualization
- **What-If Calculator**: Category-based spending reduction simulations
- **Projection Models**: 1, 6, and 12-month savings forecasts based on spending patterns
- **Rationale**: Provides actionable insights and motivates savings behavior through visual goal progress.

### Theme System
- **Implementation**: CSS custom properties (CSS variables) with data-theme attribute
- **Modes**: Light and dark themes with persistent user preference
- **Storage**: Theme choice saved to localStorage
- **Rationale**: Reduces eye strain, improves accessibility, and provides modern user experience expectations.

### Mobile-First Design
- **Responsive Strategy**: Mobile-first CSS with progressive enhancement
- **Touch Optimization**: Large tap targets, gesture-friendly UI, disabled zoom where appropriate
- **Viewport**: Maximum-scale=1.0 to prevent unwanted scaling
- **Rationale**: Primary use case is mobile expense tracking on-the-go; desktop is secondary viewport.

## External Dependencies

### CDN-Loaded Libraries
- **Chart.js v4.4.0**: Data visualization for weekly trends and category breakdowns
  - Source: `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`
  - Purpose: Lightweight charting without local bundling
  
- **SheetJS (xlsx) v0.18.5**: Excel import/export functionality
  - Source: `https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js`
  - Purpose: Data portability and backup/restore features

### Browser APIs
- **LocalStorage API**: Primary persistence layer for all application data
- **Service Worker API**: Offline functionality and app caching
- **Web App Manifest**: PWA installation and standalone display
- **Canvas API**: Required by Chart.js for chart rendering

### No Backend Services
- No database servers (all data stored client-side)
- No authentication services (local-only data)
- No API endpoints (fully client-side application)
- No cloud storage (localStorage only)

**Note**: Application is designed to be entirely self-contained with no server-side dependencies. All features work offline after initial load and asset caching.