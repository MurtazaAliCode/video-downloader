# VidDonloader

## Overview

VidDonloader is a modern, AdSense-friendly video processing web application built for personal use. The application allows users to upload videos and perform various operations like compression, format conversion, trimming, audio extraction, and watermarking. Built with a focus on privacy and security, all files are automatically deleted after 12 hours, and the tool is designed exclusively for personal, non-commercial use.

The project follows a full-stack architecture with React/TypeScript frontend, Express backend, and PostgreSQL database with Drizzle ORM. It's optimized for deployment on Vercel with serverless functions and includes a blog system for SEO purposes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: TailwindCSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack Query for server state management and React Hook Form for form handling
- **UI Components**: Radix UI primitives with custom styling via shadcn/ui
- **Theme System**: Built-in dark/light mode support with CSS variables

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **File Upload**: Multer middleware for handling multipart file uploads (500MB limit)
- **Video Processing**: Simple job queue system (designed to integrate with BullMQ/Redis in production)
- **API Design**: RESTful endpoints for video processing, job status, and contact messages
- **Storage**: Temporary local storage in `/tmp/uploads` with automatic cleanup

### Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Tables**:
  - `jobs`: Video processing jobs with status tracking and file metadata
  - `blog_posts`: Content management for SEO blog articles
  - `contact_messages`: Contact form submissions
- **Data Validation**: Zod schemas for type-safe validation across frontend and backend

### Video Processing Pipeline
- **Supported Formats**: MP4, AVI, MOV input files
- **Operations**: Compression, format conversion, trimming, audio extraction, watermarking
- **Job Management**: Asynchronous processing with progress tracking and status updates
- **File Lifecycle**: 12-hour automatic expiration with cleanup mechanisms

### Content Management
- **Blog System**: Markdown-based content with in-memory storage (designed for database integration)
- **SEO Content**: Pre-seeded articles for organic traffic generation
- **Contact System**: Form handling with validation and storage

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for Neon DB
- **drizzle-orm & drizzle-kit**: Database ORM and migration tools
- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Form validation with Zod integration
- **multer**: File upload handling middleware

### UI/UX Libraries
- **@radix-ui/***: Complete set of accessible UI primitives (accordion, dialog, dropdown, etc.)
- **class-variance-authority**: Type-safe CSS class variants
- **clsx & tailwind-merge**: Utility for conditional CSS classes
- **cmdk**: Command palette component
- **framer-motion**: Animation library (planned integration)

### Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the entire stack
- **PostCSS & Autoprefixer**: CSS processing pipeline
- **ESBuild**: Backend bundling for production builds

### Planned Integrations
- **FFmpeg**: Video processing engine (backend integration pending)
- **BullMQ with Redis**: Production job queue system
- **AWS S3/Cloudflare R2**: Cloud storage for processed files
- **Google AdSense**: Monetization with compliant ad placements

### Deployment Architecture
- **Primary**: Vercel with serverless functions
- **Development**: Replit environment support
- **Environment Variables**: Database URL, AdSense ID, Redis URL (when implemented)
- **File Storage**: Local temporary storage with cloud backup option