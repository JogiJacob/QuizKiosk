# Destination Designers Quiz

## Overview

The Destination Designers Quiz is a kiosk-style quiz application designed for interactive destination design knowledge testing. It's built as a full-stack web application with PWA capabilities, originally intended for desktop kiosk deployment but adapted for web-based deployment on Replit. The application supports admin management of quizzes and questions, participant registration, and comprehensive leaderboard functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React Context API for auth and quiz state management
- **Data Fetching**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing with hash-based navigation for quiz flow
- **PWA Features**: Service worker implementation with manifest.json for offline support and kiosk mode

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Development Setup**: Vite middleware integration for hot module replacement
- **API Structure**: RESTful endpoints with `/api` prefix (placeholder implementation)
- **Error Handling**: Centralized error middleware with structured error responses

### Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Shared TypeScript schemas using Zod for validation
- **Collections**: 
  - Quizzes (title, description, duration, question count)
  - Questions (text, options, correct answers, image support)
  - Participants (name, email, organization, phone)
  - Quiz Sessions (scores, answers, timing data)
  - Settings and Admin configurations

### Authentication & Authorization
- **Admin Authentication**: Firebase Auth integration
- **Participant Flow**: Anonymous participation with optional registration
- **Session Management**: Browser session storage for quiz state persistence
- **Admin Panel**: Protected routes requiring Firebase authentication

### Component Architecture
- **Admin Dashboard**: Quiz and question management with CRUD operations
- **Quiz Interface**: Step-by-step quiz taking with timer and progress tracking
- **Leaderboard**: Real-time rankings with quiz-specific filtering
- **Registration**: Optional participant information collection

## External Dependencies

### Firebase Services
- **Firebase Auth**: Admin authentication and user management
- **Firestore**: Real-time database for storing quiz data, sessions, and leaderboards
- **Firebase Storage**: Image uploads for questions

### Development & Build Tools
- **Vite**: Development server and build tool with React plugin
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Production bundling for server-side code
- **Replit Integration**: Custom plugins for development environment

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for consistent iconography
- **Google Fonts**: Inter font family for typography

### Database & ORM
- **Drizzle ORM**: Type-safe database operations
- **Neon Database**: PostgreSQL hosting (configured but using Firebase as primary)
- **Zod**: Schema validation for data integrity

### State Management & Data Fetching
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with Zod validation
- **Date-fns**: Date manipulation utilities

### PWA & Performance
- **Service Worker**: Offline caching and background sync
- **Manifest**: App installation and kiosk mode configuration
- **Embla Carousel**: Touch-friendly component interactions