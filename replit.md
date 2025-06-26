# JobMindr - Job Application Tracker

## Overview

JobMindr is a full-stack job application tracking system built with a modern React frontend and Express.js backend. The application allows users to manage their job applications with features for creating, updating, filtering, and organizing job search activities. It uses PostgreSQL for data persistence and includes a complete UI component library based on shadcn/ui.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod for runtime type validation
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions

### Database Schema
The application uses a PostgreSQL database with the following main tables:
- **job_applications**: Core table storing job application data with fields for job title, company, status, dates, and contact information
- **users**: Simple user table for authentication (placeholder implementation)

## Key Components

### Data Layer
- **Database Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema Definition**: Centralized in `shared/schema.ts` with Drizzle table definitions
- **Type Safety**: Automatic TypeScript type generation from database schema
- **Migrations**: Drizzle-kit for database schema management

### API Layer
- **RESTful Endpoints**: CRUD operations for job applications
- **Filtering & Sorting**: Query parameter-based filtering by company, status, and date
- **Validation**: Server-side validation using Zod schemas
- **Error Handling**: Centralized error handling middleware

### Frontend Components
- **Dashboard**: Main application interface with job form and table
- **JobForm**: React Hook Form component for creating new applications
- **JobTable**: Data table with sorting, filtering, and bulk operations
- **Authentication**: Simple login system (currently mock implementation)
- **Toast Notifications**: User feedback for actions and errors

### UI System
- **Design System**: Consistent theming with CSS custom properties
- **Component Library**: Full set of reusable UI components
- **Dark Mode Support**: Theme switching capability built into components
- **Responsive Design**: Mobile-first approach with responsive breakpoints

## Data Flow

1. **User Input**: Forms capture user data with client-side validation
2. **API Requests**: TanStack Query manages server communication and caching
3. **Server Processing**: Express routes handle requests with validation and business logic
4. **Database Operations**: Drizzle ORM performs type-safe database queries
5. **Response Handling**: Data flows back through the query cache to update UI
6. **State Management**: React Query manages server state synchronization

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Modern TypeScript ORM with excellent type safety
- **@tanstack/react-query**: Powerful data synchronization for React
- **@radix-ui/***: Headless UI components for accessibility
- **zod**: Runtime type validation and schema definition

### Development Tools
- **Vite**: Fast build tool with HMR for development
- **TypeScript**: Static typing throughout the application
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon serverless PostgreSQL connection
- **Environment Variables**: DATABASE_URL required for database connection

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Deployment**: Configured for Replit's autoscale deployment
- **Port Configuration**: Server runs on port 5000, exposed as port 80

### Build Process
1. Frontend assets built with Vite
2. Server code bundled with ESBuild
3. Static files served from Express in production
4. Database migrations applied via Drizzle-kit

## Changelog

```
Changelog:
- June 23, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```