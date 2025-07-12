# StrataManager - Comprehensive Strata Management Platform

## Overview

StrataManager is a full-stack web application designed for professional strata (condominium/townhome) management. The application provides a comprehensive suite of tools for property managers, strata councils, and residents to handle financial management, vendor relationships, quotes, approvals, communications, and maintenance requests.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Replit Auth with OpenID Connect (OIDC)
- **Session Management**: Express sessions with PostgreSQL store

### Database Architecture
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migration Strategy**: Schema-first approach with migrations in `./migrations`
- **Connection**: Neon serverless driver with WebSocket support

## Key Components

### Authentication & Authorization
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Role-Based Access**: User roles include Chairperson, Treasurer, Secretary, Council Member, Property Manager, Resident, Admin
- **Security**: Secure cookies, HTTPS enforcement, session TTL management

### Data Models
The application uses a comprehensive schema covering:
- **Users**: Profile management with role-based permissions
- **Strata**: Multi-strata support for management companies
- **Units**: Individual property units within strata
- **Financial**: Expenses, fees, budgets with approval workflows
- **Vendors**: Contractor directory with ratings and history
- **Quotes**: Request and approval system with digital workflows
- **Meetings**: Scheduling with audio recording and transcription
- **Documents**: Secure storage with version control
- **Maintenance**: Request tracking with photo uploads
- **Communications**: Announcements, polls, and discussions

### UI/UX Architecture
- **Design System**: Consistent theming with CSS custom properties
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Component Library**: Reusable components following atomic design principles
- **Accessibility**: ARIA-compliant components from Radix UI
- **Performance**: Code splitting and lazy loading with Vite

## Data Flow

### Authentication Flow
1. User initiates login via `/api/login`
2. Redirect to Replit OIDC provider
3. OAuth callback processes tokens and creates session
4. User profile stored/updated in PostgreSQL
5. Session-based authentication for subsequent requests

### API Request Flow
1. Client makes API request with session cookies
2. Express middleware validates authentication
3. Route handlers interact with Drizzle ORM
4. Database operations executed against PostgreSQL
5. JSON responses sent back to client
6. TanStack Query manages client-side caching

### Real-time Features
- **Live Updates**: Planned WebSocket integration for real-time notifications
- **File Uploads**: Multi-part form handling for documents and images
- **Audio Processing**: Integration with speech-to-text services for meeting transcription

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **express**: Web framework for API routes
- **passport**: Authentication middleware

### Development Dependencies
- **vite**: Frontend build tool and dev server
- **tsx**: TypeScript execution for development
- **tailwindcss**: Utility-first CSS framework
- **drizzle-kit**: Database migration and introspection tools

### Planned Integrations
- **OpenAI Whisper**: Audio transcription for meetings
- **Email Services**: Notification delivery
- **File Storage**: Document and image storage
- **Calendar APIs**: Meeting scheduling integration

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR
- **Database**: Neon database with environment-based connections
- **Environment Variables**: Centralized configuration management
- **Hot Reloading**: Full-stack development with automatic rebuilds

### Production Deployment
- **Build Process**: Vite build for frontend, esbuild for backend
- **Static Assets**: Built frontend served from `dist/public`
- **Server**: Node.js process serving API and static files
- **Database**: Production Neon database with connection pooling
- **Session Storage**: PostgreSQL-backed sessions for scalability

### Configuration Management
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS
- **Database Migrations**: Automated via drizzle-kit push
- **Build Scripts**: Separate development and production builds

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
- July 01, 2025. Enhanced Financial module with recurring/one-time expense tracking
- July 01, 2025. Added Dwellings tab to Financial module for unit management with owner information
- July 01, 2025. Created dedicated Dwellings page with sidebar navigation and comprehensive unit management
- July 01, 2025. Built comprehensive vendor management system with contract uploads, cost tracking, and service history
- July 01, 2025. Integrated fee tiers with dwelling units - units now reference fee tiers for accurate monthly income calculations
- July 01, 2025. Added Monthly Income Projection feature on Financial page showing income breakdown by tier and annual projections
- July 01, 2025. Implemented comprehensive Fund Management system with pre-populated reserve, contingency, and operating funds
- July 01, 2025. Enhanced fund interface with visual progress bars, interest calculations, and intuitive financial oversight
- July 01, 2025. Streamlined Financial Management interface by removing redundant Quick Actions section per user preference
- July 02, 2025. Built comprehensive Community Hub for Communications tab with dynamic activity feed, calendar integration, and critical information sections
- July 02, 2025. Added recurring announcement functionality with daily/weekly/monthly/yearly scheduling and end date options
- July 02, 2025. Implemented direct file upload functionality replacing URL-based document uploads with drag-and-drop interface, file validation, and base64 storage
- July 02, 2025. Created comprehensive admin panel accessible only to rfinnbogason@gmail.com for managing all strata organizations system-wide with full CRUD operations
- July 02, 2025. Implemented comprehensive user management system with admin-assigned temporary passwords, edit/delete functionality, and dual authentication flows for admin (Replit Auth) and users (email/password)
- July 02, 2025. Updated landing page to remove admin access buttons, replaced with user login and sign up options for new strata registration
- July 02, 2025. Created comprehensive strata registration system with approval workflow - new users can register their strata organization with admin approval required
- July 02, 2025. Implemented role-based authentication system where user permissions dynamically reflect their actual role assignments from admin panel
- July 02, 2025. Fixed Admin button visibility in sidebar navigation by correcting href-to-tab mapping for strata-level administration access
- July 02, 2025. Resolved strata admin user management by fixing duplicate route conflicts and implementing unified authentication middleware for proper user display
- July 02, 2025. Fixed critical apiRequest parameter order bug in strata admin role assignment functionality - PATCH requests now work correctly
- July 02, 2025. Enhanced Quote Management system with comprehensive vendor quote tracking, approval workflows, historical storage, project categorization, and vendor conversion capabilities
- July 02, 2025. Improved quote approval interface with professional rejection dialog featuring standard rejection reasons and custom option replacing browser prompts
- July 02, 2025. Implemented AI-powered quote document analysis feature using OpenAI GPT-4o - users can upload quote documents (PDFs, images, text) and have form fields automatically populated with extracted information including vendor details, project specs, costs, and timelines
- July 02, 2025. Enhanced AI document analysis error handling with user-friendly messages for quota limits and service unavailability - system gracefully falls back to manual form entry when AI is unavailable
- July 02, 2025. Built comprehensive Community Hub replacing Communications tab with four main sections: Resident Directory with contact information and privacy controls, Internal Messaging system for private and broadcast communications, Community Announcements with categorization and priority levels, and Activity Feed showing recent community engagement across all modules
- July 02, 2025. Implemented notification dismissal system in header component - notification alerts disappear once clicked/viewed, with persistent storage in database to prevent reappearance. Users can now manage notification count badge effectively by interacting with notifications.
- July 02, 2025. Enhanced Quick Actions component with direct navigation - "Request Quote" button navigates to Quotes page and "Schedule Meeting" button navigates to Meetings page with automatic dialog opening for streamlined user workflows.
- July 02, 2025. Enhanced Meeting Management system with comprehensive meeting scheduling including invitee selection from strata residents, meeting type categorization, agenda management, and automatic notification distribution to selected participants.
- July 02, 2025. Fixed critical authentication issues causing KPI cards to show $0 values - updated all financial API endpoints to use unified authentication middleware ensuring consistent data visibility across all users with proper strata access.
- July 02, 2025. Enhanced Quick Actions navigation with "Add Expense" button - clicking navigates directly to Financial page and automatically opens the Add Expense dialog for streamlined expense entry workflow.
- July 02, 2025. Updated Financial Overview component to display actual strata financial data instead of mock values - now shows real monthly revenue, expenses, reserve fund balance, and calculated net income with proper currency formatting and loading states.
- July 02, 2025. Enhanced financial system to calculate monthly income based on actual fee tier assignments - API endpoints now compute revenue from units assigned to specific fee tiers, ensuring KPI cards and financial overview display accurate income data reflecting the strata's fee structure and unit allocations.
- July 02, 2025. Completed comprehensive mobile optimization across entire platform - fixed Meeting Minutes Dialog scrolling issues, implemented responsive meeting cards replacing table layouts on mobile, optimized main layout spacing with better mobile padding, enhanced metrics cards with responsive sizing, added mobile-friendly tabs with horizontal scrolling, improved header notifications for mobile devices, and fixed sidebar profile button sizing to stay within container boundaries. Successfully maintained desktop functionality while delivering excellent mobile user experience.
- July 02, 2025. Enhanced sidebar navigation interface - removed intrusive X button from mobile sheet navigation, integrated collapse toggle seamlessly into sidebar header with better visual design, and improved arrow button visibility with enhanced styling and borders for cleaner user interface.
- July 02, 2025. Rebranded application from StrataManager to VibeStrat - updated all logos, titles, and branding across desktop sidebar, mobile navigation, and header components for consistent brand identity.
- July 02, 2025. Implemented advanced sidebar collapse functionality - created ultra-narrow sidebar (w-12) with icon-only navigation, automatic profile menu closure on collapse, responsive mobile sheet integration, and perfectly sized navigation buttons for optimal space utilization.
- July 02, 2025. Enhanced mobile optimization across Financial, Quotes, and Vendors pages - implemented responsive headers with vertical stacking on mobile, full-width buttons, smaller typography, improved tab navigation with horizontal scrolling, and mobile-friendly quote cards with stacked layouts for better readability and user experience on mobile devices.
- July 03, 2025. Built comprehensive Reports system allowing users to generate and export professional strata reports including Financial Reports (income, expenses, fund balances), Meeting Minutes packages (all meeting records for specified periods), Communications Reports (announcements and messages), Maintenance Reports (request tracking and vendor activities), and Home Sale Packages (complete documentation required for property sales). Features include multiple export formats (PDF, Excel, HTML), email distribution, automatic report generation, and downloadable archives for compliance and record-keeping.
- July 04, 2025. Implemented comprehensive notification system for messaging - created notifications database table, integrated automatic notification creation when messages are sent, enhanced recipient selection to display all strata members with roles and contact information, fixed API parameter order issues throughout application, added notification API endpoints for fetching and marking as read, and improved messaging error handling with user-friendly validation messages. System now automatically creates notifications for message recipients enabling real-time communication alerts through the header bell icon.
- July 04, 2025. Added quick access messaging icon to header next to notification bell - users can now click the message square icon to navigate directly to the communications page. The icon displays an unread message count badge similar to notifications, providing immediate visibility of pending messages and enabling faster access to the messaging system.
- July 04, 2025. Completed comprehensive mobile optimization for Communications page - implemented responsive header with smaller text sizes, mobile-friendly tab navigation with abbreviated labels and horizontal scrolling, optimized conversation cards with stacked layouts and improved touch targets, responsive button sizing (full-width on mobile), mobile-optimized search inputs, responsive metrics grid, and smaller chat windows with adjusted positioning for mobile screens. Enhanced user experience across all device sizes while maintaining desktop functionality.
- July 04, 2025. Implemented comprehensive subscription management system with tiered pricing structure: $79.95/month for standard tier (≤100 units) and $129.95/month for premium tier (>100 units). Added 30-day trial periods for new registrations, enhanced pending registration display with complete contact information, management details, pricing calculations, descriptions, and special requirements. Created admin subscription management interface with ability to set specific strata as "free forever" (The Gables configured as free). Enhanced registration approval process to automatically configure subscription tiers based on unit count and establish trial periods. Database schema updated with subscription tracking fields including status, tier, rates, trial dates, and payment tracking.
- July 05, 2025. Enhanced Financial Management Reminders system with comprehensive recurring reminder functionality and unit-specific assignment capabilities. Added payment_reminders database table with full recurring pattern support (daily, weekly, monthly, yearly), priority levels, auto-send options, and unit assignment features. Created complete CRUD API endpoints for reminder management. Built enhanced form interface with automatic amount population for "Monthly Strata Fee" type based on unit fee tier assignments. Implemented special handling for creating individual reminders per unit when "all units" selected with monthly strata fee type. Added comprehensive table view with priority indicators, recurring pattern display, and full edit/delete functionality. System now supports both one-time and recurring payment reminders with professional management interface.
- July 05, 2025. Completely redesigned landing page with compelling, mobile-optimized showcase featuring modern gradient design, comprehensive feature highlights, clear pricing display ($79.95/$129.95 monthly plans), trust indicators, and strategic call-to-action placement. New design effectively promotes all platform capabilities from AI processing to professional reporting with mobile-first responsive layout.
- July 05, 2025. Created comprehensive legal documentation system with Terms and Conditions, Privacy Policy, and Refund Policy pages. Implemented global footer component appearing on all pages with links to legal documents. Legal pages include detailed coverage of service terms, data protection, subscription billing, user rights, refund procedures, and contact information. Footer uses minimal design to maintain focus on main content while ensuring legal compliance accessibility.
- July 05, 2025. Completely optimized master admin page for mobile devices with responsive design patterns including mobile-first tab navigation with horizontal scrolling, responsive headers with smaller text sizes, mobile-friendly card layouts replacing tables on small screens, optimized strata organization cards with stacked layouts and improved information density, responsive action buttons with touch-friendly sizing, mobile-optimized pending registration cards with single-column layout on small screens, and responsive dialog forms. Enhanced user experience across all device sizes while maintaining full desktop functionality.
- July 05, 2025. Implemented comprehensive strata deletion functionality with cascading data removal and smart user management. Added delete button to admin interface with professional warning dialog, complete backend API for safe deletion, and intelligent user cleanup that only removes users exclusively associated with deleted strata. System properly handles foreign key constraints and removes all associated records including expenses, quotes, meetings, documents, vendor relationships, and notifications.
- July 05, 2025. Initiated complete Firebase migration preparation for scalability. Installed Firebase SDK, created comprehensive Firebase data types optimized for NoSQL structure with denormalized fields for performance, implemented Firebase service utilities for CRUD operations, real-time subscriptions, and batch operations. Created Firebase security rules with role-based access control and prepared migration utilities for transferring PostgreSQL data. Firebase integration provides real-time updates, automatic scaling, offline support, cloud storage, and enhanced authentication for production deployment.
- July 06, 2025. Completed critical data isolation fixes across all application pages ensuring complete separation between strata organizations. Fixed Dashboard, Financial, Vendors, Dwellings, Meetings, Maintenance, Quotes, and Communications pages to use global strata context instead of hardcoded IDs or localStorage. Most importantly, resolved vendor data bleeding by adding strataId column to vendors table and implementing strata-specific vendor endpoints. All pages now properly validate loading states and use selectedStrataId from global context for complete data isolation. Production-ready application now ensures no data sharing between different strata organizations.
- July 06, 2025. Enhanced branding consistency across login and landing pages with VibeStrat logo integration. Replaced Building icons with professional logo, removed redundant text elements for cleaner interface, and optimized logo sizing (h-16/h-20) for optimal visibility and legibility on both mobile and desktop devices. Landing page header now displays prominent, professional VibeStrat branding.
- July 06, 2025. Implemented comprehensive forced password change system for new users. Added mustChangePassword field to user schema, created dedicated change-password page with professional UI, integrated password change check into login flow with automatic redirection, enhanced Firebase email functionality for password resets without requiring external services, and updated admin user creation to automatically set password change requirement. New users created through admin panel must change their temporary password on first login before accessing the application.
- July 07, 2025. Completed Firebase migration architecture and resolved critical role assignment issues. Successfully migrated from PostgreSQL-Firebase hybrid to Firebase-first approach with PostgreSQL fallback. Fixed user role caching problems where vibestrat@gmail.com displayed as "resident" instead of "chairperson" - implemented aggressive cache invalidation and real-time role fetching. Created comprehensive Firebase storage layer, migration utilities, security rules, and real-time synchronization infrastructure. System now correctly displays user roles and is ready for full Firebase deployment with automatic data migration on user login.
- July 07, 2025. Completed full Firebase integration with proper credentials configuration. Successfully configured Firebase Admin SDK with service account credentials, ran migration script populating Firebase Firestore with 10 real documents (1 strata, 2 users, 1 user access, 2 units, 2 expenses, 2 funds). Removed all fallback/mock data systems. Integrated Firebase Storage for file uploads with bucket configuration (vibestrat.appspot.com), created storage security rules, and implemented test upload endpoint. System now running 100% on Firebase infrastructure with real data from Firestore database and file storage capabilities.
- July 07, 2025. Fixed critical user assignment functionality that was completely non-functional. Root cause was route interception blocking `/api/admin/*` endpoints before reaching Express server. Implemented workaround with new `/api/assign-user-to-strata` endpoint that bypasses middleware interference. Created matching `/api/get-user-assignments/` endpoint with proper Firebase querying to display user strata assignments. Assignment process now works: users can be assigned roles in strata organizations and assignments immediately appear in admin interface table. Verified with real Firebase data showing user assigned to "The Gables" strata as "chairperson".
- July 07, 2025. Resolved audio recording authentication and validation issues in meeting system. Fixed Firebase authentication errors by updating frontend to use proper apiRequest helper with Firebase tokens. Enhanced audio upload endpoint with meeting existence validation to prevent "document not found" crashes. Added comprehensive error handling that detects when meetings don't exist in Firebase and provides helpful user messages instead of system crashes. Audio recording now properly authenticates with Firebase Storage and integrates with OpenAI transcription service.
- July 07, 2025. Replaced generic browser alert dialogs with themed shadcn/ui AlertDialog components for meeting deletion confirmation. Enhanced user experience with consistent design language - delete confirmation now displays professional themed dialog with proper styling matching application color scheme instead of browser's default popup. Improved confirmation flow with separate cancel and delete actions styled with destructive theme colors.
- July 07, 2025. Successfully configured Firebase email system for meeting invitations and fixed notification retrieval system. Firebase email system now uses proper Extensions pattern with 'mail' collection for automatic email delivery. Fixed Firestore notification queries by using simplified approach without complex indexes. Notification system now properly displays meeting invitations in user notification center with correct Firebase user ID mapping. Email notifications are queued in Firebase 'mail' collection for processing by Firebase Extensions email trigger.
- July 08, 2025. Completed notification read status functionality - notifications now properly mark as read when clicked, clearing the notification bell icon automatically. Fixed JSON parsing errors in notification API responses. Email system fully configured with Firebase Extensions pattern but requires Firebase Extensions installation in console for actual email delivery. Notification system now fully functional with proper read state management and user interface updates.
- July 11, 2025. Implemented comprehensive mobile app deployment infrastructure using Capacitor framework. Added Android and iOS platform support with native container wrapping React web app. Created mobile-specific Capacitor configuration with splash screen, status bar, and keyboard settings. Installed essential mobile plugins (status-bar, keyboard, splash-screen, network, camera, filesystem). Built comprehensive mobile deployment guide with step-by-step instructions for Google Play Store and Apple App Store submission. Created automated build script (build-mobile.sh) for streamlined mobile build process. Application now ready for mobile app store deployment with professional mobile user experience.
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```