# Pre-Purchase Copilot

## Overview

Pre-Purchase Copilot is a workflow-driven mobile application that helps consumers make informed decisions when buying used cars. The app transforms the chaotic process of purchasing a used vehicle into a structured, repeatable, and data-driven workflow by providing:

- **Vehicle inspection checklists** with 68+ items organized into sections (Exterior, Interior, Mechanical, Underbody, Test Drive)
- **VIN decoding** to automatically populate vehicle specifications
- **Risk and completeness scoring** based on inspection responses
- **LLM-powered analysis** for vehicle-specific inspection recommendations and comparisons
- **Multi-car comparison** to objectively evaluate candidates side-by-side

The application is built as a React web app with mobile-first design, using an Express.js backend with PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **Styling**: Tailwind CSS v4 with shadcn/ui components (New York style)
- **UI Library**: Tamagui for cross-platform components
- **State Management**: Zustand with persist middleware for local storage
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack React Query
- **Animations**: Framer Motion

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints prefixed with `/api`
- **Build**: esbuild for server bundling, Vite for client

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Managed via `drizzle-kit push`
- **Current State**: In-memory storage implementation exists as fallback (`MemStorage` class)

### Key Design Patterns
- **Shared Schema**: Database types and validation schemas in `shared/` directory accessible to both client and server
- **Path Aliases**: `@/` for client source, `@shared/` for shared code
- **Component Structure**: Atomic design with reusable UI components in `client/src/components/ui/`
- **Mobile-First Layout**: `MobileLayout` wrapper component with bottom navigation and floating action button

### Visual Design System
- Premium, technical aesthetic inspired by automotive brand guidelines
- Dark control bands with pill-style navigation
- Minimal shadows, hairline borders, low border-radius
- Monospace typography for VINs and technical data
- Single accent color (Audi red) used sparingly

## External Dependencies

### Third-Party APIs (Planned)
- **NHTSA vPIC API**: Free public API for VIN decoding
- **OpenAI API**: GPT-4 for vehicle-specific checklist generation and analysis (field-only, no image interpretation)

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database access with automatic schema inference

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `express`: HTTP server framework
- `@tanstack/react-query`: Server state management
- `zustand`: Client state management
- `framer-motion`: Animation library
- `tamagui`: Cross-platform UI primitives
- `wouter`: Client-side routing
- `zod`: Runtime type validation