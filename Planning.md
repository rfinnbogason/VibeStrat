# Planning Document
# Strata Management Application

**Version:** 1.0
**Date:** October 13, 2025
**Purpose:** Development structure and consistency guide

---

## 1. Project Structure & Organization

### 1.1 Directory Structure

```
strata-management-app/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── assets/                  # Static assets (images, fonts, etc.)
│   │   ├── components/              # Reusable React components
│   │   │   ├── ui/                  # shadcn/ui base components
│   │   │   ├── layout/              # Layout components (Header, Sidebar, Footer)
│   │   │   ├── auth/                # Authentication components
│   │   │   ├── financial/           # Financial module components
│   │   │   ├── vendors/             # Vendor module components
│   │   │   ├── quotes/              # Quote module components
│   │   │   ├── meetings/            # Meeting module components
│   │   │   ├── communications/      # Communications module components
│   │   │   ├── maintenance/         # Maintenance module components
│   │   │   ├── documents/           # Document module components
│   │   │   ├── reports/             # Reports module components
│   │   │   └── common/              # Shared common components
│   │   ├── contexts/                # React Context providers
│   │   │   ├── AuthContext.tsx      # Authentication context
│   │   │   ├── StrataContext.tsx    # Selected strata context
│   │   │   └── ThemeContext.tsx     # Theme/dark mode context
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.ts           # Authentication hook
│   │   │   ├── useStrata.ts         # Strata selection hook
│   │   │   ├── useApi.ts            # API request hook
│   │   │   └── useNotifications.ts  # Notifications hook
│   │   ├── lib/                     # Utility libraries
│   │   │   ├── utils.ts             # General utilities
│   │   │   ├── api.ts               # API client configuration
│   │   │   ├── firebase.ts          # Firebase client setup
│   │   │   ├── constants.ts         # Application constants
│   │   │   └── validators.ts        # Form validation helpers
│   │   ├── pages/                   # Page components (route views)
│   │   │   ├── landing.tsx          # Public landing page
│   │   │   ├── login.tsx            # Login page
│   │   │   ├── signup.tsx           # Signup page
│   │   │   ├── dashboard.tsx        # Dashboard home
│   │   │   ├── financial.tsx        # Financial management
│   │   │   ├── dwellings.tsx        # Unit management
│   │   │   ├── vendors.tsx          # Vendor directory
│   │   │   ├── quotes.tsx           # Quote management
│   │   │   ├── meetings.tsx         # Meeting scheduling
│   │   │   ├── communications.tsx   # Communications hub
│   │   │   ├── maintenance.tsx      # Maintenance requests
│   │   │   ├── documents.tsx        # Document repository
│   │   │   ├── reports.tsx          # Reports generation
│   │   │   ├── admin.tsx            # Master admin panel
│   │   │   ├── strata-admin.tsx     # Strata-level admin
│   │   │   ├── change-password.tsx  # Password change
│   │   │   ├── terms.tsx            # Terms & conditions
│   │   │   ├── privacy-policy.tsx   # Privacy policy
│   │   │   ├── refund-policy.tsx    # Refund policy
│   │   │   └── not-found.tsx        # 404 page
│   │   ├── types/                   # TypeScript type definitions
│   │   │   ├── index.ts             # Re-exports all types
│   │   │   ├── auth.ts              # Authentication types
│   │   │   ├── strata.ts            # Strata types
│   │   │   ├── financial.ts         # Financial types
│   │   │   ├── vendor.ts            # Vendor types
│   │   │   └── api.ts               # API response types
│   │   ├── App.tsx                  # Root application component
│   │   ├── main.tsx                 # Application entry point
│   │   └── index.css                # Global styles
│   ├── public/                      # Public static files
│   └── index.html                   # HTML template
│
├── server/                          # Backend Node.js application
│   ├── index.ts                     # Server entry point
│   ├── routes.ts                    # API route definitions
│   ├── firebase-admin.ts            # Firebase Admin SDK setup
│   ├── firebase-auth.ts             # Authentication middleware
│   ├── firebase-db.ts               # Firestore database operations
│   ├── firebase-storage-bucket.ts   # Firebase Storage operations
│   ├── openai.ts                    # OpenAI API integration
│   ├── email-service.ts             # Email sending service
│   ├── middleware/                  # Express middleware
│   │   ├── auth.ts                  # Authentication middleware
│   │   ├── validation.ts            # Request validation
│   │   ├── errorHandler.ts          # Error handling
│   │   └── rateLimit.ts             # Rate limiting
│   ├── services/                    # Business logic services
│   │   ├── userService.ts           # User operations
│   │   ├── strataService.ts         # Strata operations
│   │   ├── financialService.ts      # Financial operations
│   │   ├── vendorService.ts         # Vendor operations
│   │   ├── quoteService.ts          # Quote operations
│   │   ├── meetingService.ts        # Meeting operations
│   │   ├── notificationService.ts   # Notification operations
│   │   └── documentService.ts       # Document operations
│   ├── utils/                       # Server utilities
│   │   ├── logger.ts                # Logging utility
│   │   ├── validation.ts            # Data validation
│   │   └── helpers.ts               # Helper functions
│   └── scripts/                     # Utility scripts
│       ├── migrate.ts               # Database migrations
│       └── seed.ts                  # Seed data
│
├── shared/                          # Shared code between client/server
│   ├── schema.ts                    # Database schema definitions (legacy)
│   ├── firebase-types.ts            # Firebase document types
│   ├── accessControl.ts             # Role-based access definitions
│   └── constants.ts                 # Shared constants
│
├── mobile/                          # Mobile platform-specific code
│   ├── android/                     # Android native code
│   ├── ios/                         # iOS native code
│   └── capacitor.config.ts          # Capacitor configuration
│
├── docs/                            # Documentation
│   ├── PRD.md                       # Product Requirements Document
│   ├── Claude.md                    # Claude training document
│   ├── Planning.md                  # This file - development planning
│   ├── Tasks.md                     # Task tracking document
│   ├── API.md                       # API documentation
│   └── DEPLOYMENT.md                # Deployment guide
│
├── tests/                           # Test files
│   ├── unit/                        # Unit tests
│   ├── integration/                 # Integration tests
│   └── e2e/                         # End-to-end tests
│
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── package.json                     # Project dependencies
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite build configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
├── firestore.rules                  # Firestore security rules
├── firestore.indexes.json           # Firestore indexes
└── README.md                        # Project readme
```

---

## 2. Naming Conventions

### 2.1 File Naming

**React Components:**
- PascalCase for component files: `DashboardCard.tsx`, `UserProfile.tsx`
- kebab-case for page files: `dashboard.tsx`, `strata-admin.tsx`

**TypeScript Files:**
- camelCase for utilities and services: `apiClient.ts`, `userService.ts`
- PascalCase for types/interfaces: `User.ts`, `StrataTypes.ts`

**Folders:**
- kebab-case for all directories: `user-management/`, `api-services/`

### 2.2 Code Naming

**Variables:**
```typescript
// camelCase for variables and functions
const userProfile = getUserProfile();
const selectedStrataId = "123";

// PascalCase for React components and classes
const DashboardCard = () => { ... };
class UserService { ... }

// UPPER_SNAKE_CASE for constants
const API_BASE_URL = "https://api.example.com";
const MAX_UPLOAD_SIZE = 10485760;
```

**Interfaces and Types:**
```typescript
// PascalCase with descriptive names
interface User {
  id: string;
  email: string;
}

type UserRole = "chairperson" | "treasurer" | "resident";

// Prefix with "I" for interfaces (optional, team preference)
interface IApiResponse {
  data: any;
  error?: string;
}
```

**Functions:**
```typescript
// Descriptive action verbs
function getUserById(id: string) { ... }
function calculateMonthlyIncome(units: Unit[]) { ... }
function handleSubmit() { ... }

// Boolean functions start with is/has/can
function isAuthenticated() { ... }
function hasPermission(role: string) { ... }
function canEditExpense(user: User) { ... }
```

### 2.3 Firebase Collection Naming

**Collections:**
- Plural nouns: `users`, `strata`, `expenses`, `quotes`
- Subcollections nested appropriately: `strata/{id}/units`, `strata/{id}/expenses`

**Document IDs:**
- Auto-generated Firebase IDs preferred
- Composite keys for relationships: `userId_strataId` for userStrataAccess

**Field Names:**
- camelCase: `firstName`, `monthlyRate`, `createdAt`
- Consistent timestamp fields: `createdAt`, `updatedAt`

---

## 3. Component Architecture

### 3.1 Component Structure Pattern

```typescript
// 1. Imports (grouped and ordered)
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useStrata } from '@/hooks/useStrata';
import type { Expense } from '@/types/financial';

// 2. Type definitions
interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

// 3. Component definition
export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  // 4. Hooks (order: context, state, effects, queries)
  const { user } = useAuth();
  const { selectedStrataId } = useStrata();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Side effects
  }, [dependency]);

  const { data, isLoading } = useQuery({
    queryKey: ['expense', expense.id],
    queryFn: () => fetchExpenseDetails(expense.id),
  });

  // 5. Event handlers
  const handleEdit = () => {
    setIsEditing(true);
    onEdit?.(expense);
  };

  const handleDelete = () => {
    onDelete?.(expense.id);
  };

  // 6. Render logic with early returns
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return null;
  }

  // 7. Main JSX return
  return (
    <Card>
      <CardHeader>
        <CardTitle>{expense.description}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  );
}

// 8. Default export (if needed)
export default ExpenseCard;
```

### 3.2 Component Types

**Page Components** (`client/src/pages/`)
- Top-level route components
- Handle data fetching for entire page
- Compose smaller feature components
- Manage page-level state

**Layout Components** (`client/src/components/layout/`)
- Sidebar, Header, Footer
- Persistent across pages
- Handle global navigation
- Manage global state (auth, strata selection)

**Feature Components** (`client/src/components/{module}/`)
- Domain-specific components
- Contain business logic for feature area
- Examples: `ExpenseForm`, `VendorCard`, `MeetingCalendar`

**UI Components** (`client/src/components/ui/`)
- Reusable, generic components from shadcn/ui
- No business logic
- Styled with Tailwind CSS
- Examples: `Button`, `Dialog`, `Card`, `Table`

**Common Components** (`client/src/components/common/`)
- Shared components used across modules
- Examples: `LoadingSpinner`, `ErrorBoundary`, `ConfirmDialog`

### 3.3 Component Best Practices

1. **Single Responsibility**: Each component should do one thing well
2. **Props over State**: Prefer controlled components with props
3. **Composition over Inheritance**: Compose complex UIs from simple components
4. **Explicit Props**: Use TypeScript interfaces for prop definitions
5. **Accessibility**: Include ARIA labels, keyboard navigation, focus management
6. **Loading States**: Always handle loading, error, and empty states
7. **Memoization**: Use `React.memo`, `useMemo`, `useCallback` for performance
8. **Extract Logic**: Move complex logic to custom hooks or utility functions

---

## 4. State Management Strategy

### 4.1 State Types and Where They Live

**Server State** (TanStack Query)
- Data from API/database
- User profiles, strata data, expenses, quotes, etc.
- Automatically cached and revalidated
- Use `useQuery` for reads, `useMutation` for writes

```typescript
// Example: Fetching expenses
const { data: expenses, isLoading, error } = useQuery({
  queryKey: ['expenses', selectedStrataId],
  queryFn: () => fetchExpenses(selectedStrataId),
  enabled: !!selectedStrataId,
});

// Example: Creating expense
const createExpenseMutation = useMutation({
  mutationFn: (newExpense: InsertExpense) => createExpense(newExpense),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
  },
});
```

**Global State** (React Context)
- Authentication state
- Selected strata
- Theme preferences
- Shared across entire app

```typescript
// AuthContext
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth logic...

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

**Local State** (useState, useReducer)
- Component-specific UI state
- Form inputs, modal open/closed, selected tabs
- Not shared with other components

```typescript
// Example: Local form state
const [formData, setFormData] = useState({
  description: '',
  amount: 0,
  category: '',
});

// Example: Modal state
const [isDialogOpen, setIsDialogOpen] = useState(false);
```

**URL State** (Wouter, query params)
- Current route/page
- Filter parameters
- Shareable application state

```typescript
// Example: Using route params
const [params] = useRoute('/strata/:id/expenses');
const strataId = params?.id;

// Example: Query parameters
const [searchParams] = useSearchParams();
const filter = searchParams.get('filter');
```

### 4.2 State Management Best Practices

1. **Keep State Close**: Place state at lowest common parent
2. **Lift State Up**: Share state by moving to common ancestor
3. **Avoid Prop Drilling**: Use Context for deeply nested state
4. **Optimize Re-renders**: Use React.memo and context splitting
5. **Cache Invalidation**: Properly invalidate TanStack Query caches
6. **Optimistic Updates**: Update UI immediately, rollback on error
7. **Loading & Error States**: Always handle all async states

---

## 5. API Design & Integration

### 5.1 RESTful API Endpoint Structure

**Pattern:** `/api/v1/{resource}/{id?}/{action?}`

**Core Endpoints:**

```
Authentication & Users:
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/signup
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/user/profile
PATCH  /api/user/profile
POST   /api/user/change-password

Strata Management:
GET    /api/strata                          # List user's stratas
GET    /api/strata/:id                      # Get strata details
POST   /api/strata                          # Create strata
PATCH  /api/strata/:id                      # Update strata
DELETE /api/strata/:id                      # Delete strata
GET    /api/strata/:id/users                # Get strata users
GET    /api/strata/:id/user-role            # Get current user's role

Financial:
GET    /api/strata/:id/expenses             # List expenses
POST   /api/strata/:id/expenses             # Create expense
PATCH  /api/expenses/:id                    # Update expense
DELETE /api/expenses/:id                    # Delete expense
GET    /api/strata/:id/funds                # List funds
POST   /api/strata/:id/funds                # Create fund
PATCH  /api/funds/:id                       # Update fund

Units:
GET    /api/strata/:id/units                # List units
POST   /api/strata/:id/units                # Create unit
PATCH  /api/units/:id                       # Update unit
DELETE /api/units/:id                       # Delete unit

Vendors:
GET    /api/strata/:id/vendors              # List vendors
POST   /api/strata/:id/vendors              # Create vendor
PATCH  /api/vendors/:id                     # Update vendor
DELETE /api/vendors/:id                     # Delete vendor

Quotes:
GET    /api/strata/:id/quotes               # List quotes
POST   /api/strata/:id/quotes               # Create quote
PATCH  /api/quotes/:id                      # Update quote
DELETE /api/quotes/:id                      # Delete quote
POST   /api/quotes/analyze-document         # AI document analysis

Meetings:
GET    /api/strata/:id/meetings             # List meetings
POST   /api/strata/:id/meetings             # Create meeting
PATCH  /api/meetings/:id                    # Update meeting
DELETE /api/meetings/:id                    # Delete meeting
POST   /api/meetings/:id/recording          # Upload audio

Communications:
GET    /api/strata/:id/messages             # List messages
POST   /api/strata/:id/messages             # Send message
GET    /api/strata/:id/announcements        # List announcements
POST   /api/strata/:id/announcements        # Create announcement

Notifications:
GET    /api/notifications                   # List user notifications
PATCH  /api/notifications/:id/read          # Mark as read
DELETE /api/notifications/:id               # Dismiss notification

Reports:
POST   /api/strata/:id/reports/financial    # Generate financial report
POST   /api/strata/:id/reports/meetings     # Generate meeting report
```

### 5.2 API Request/Response Format

**Request Format:**
```typescript
// Headers
Authorization: Bearer {firebase-id-token}
Content-Type: application/json

// Body (POST/PATCH)
{
  "description": "Monthly landscaping",
  "amount": 500.00,
  "category": "maintenance",
  "isRecurring": true,
  "recurringFrequency": "monthly"
}
```

**Success Response Format:**
```typescript
// HTTP 200/201
{
  "success": true,
  "data": {
    "id": "expense_123",
    "description": "Monthly landscaping",
    "amount": 500.00,
    "createdAt": "2025-10-13T10:30:00Z"
  }
}
```

**Error Response Format:**
```typescript
// HTTP 400/401/403/404/500
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be greater than 0",
    "details": {
      "field": "amount",
      "value": -10
    }
  }
}
```

### 5.3 API Client Pattern

```typescript
// lib/api.ts - API client wrapper
import { auth } from './firebase';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await auth.currentUser?.getIdToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// Usage in components
const expenses = await apiRequest<Expense[]>('/api/strata/123/expenses');
```

---

## 6. Database Design Patterns

### 6.1 Firestore Collection Structure

**Top-Level Collections:**
- `users` - User accounts and profiles
- `strata` - Strata organizations
- `userStrataAccess` - User-strata role mappings
- `vendors` - Vendor directory (isolated by strataId)
- `notifications` - User notifications
- `messages` - Internal messaging
- `pendingRegistrations` - New strata registrations awaiting approval

**Subcollections (nested under strata):**
- `strata/{id}/units` - Units within strata
- `strata/{id}/expenses` - Expenses
- `strata/{id}/funds` - Financial funds
- `strata/{id}/quotes` - Quote requests
- `strata/{id}/meetings` - Meetings
- `strata/{id}/documents` - Documents
- `strata/{id}/maintenanceRequests` - Maintenance requests
- `strata/{id}/announcements` - Announcements
- `strata/{id}/paymentReminders` - Payment reminders

### 6.2 Document Structure Pattern

```typescript
// Base document interface
interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Example: Expense document
interface ExpenseDocument extends BaseDocument {
  strataId: string;          // Always include for data isolation
  amount: number;
  description: string;
  category: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  submittedBy: string;       // User ID
  submittedByName: string;   // Denormalized for performance
  approvedBy?: string;
  approvedByName?: string;
  vendorId?: string;
  vendorName?: string;       // Denormalized
}
```

### 6.3 Data Isolation Strategy

**Critical Rule: Always filter by strataId**

```typescript
// CORRECT - Filters by strataId
const expenses = await db
  .collection('expenses')
  .where('strataId', '==', selectedStrataId)
  .get();

// INCORRECT - No strataId filter (data bleeding!)
const expenses = await db
  .collection('expenses')
  .get();
```

**Enforcement Points:**
1. API endpoints validate user has access to strataId
2. Firestore security rules enforce strataId matching
3. Frontend uses global `selectedStrataId` from context
4. All queries include strataId filter

### 6.4 Denormalization Strategy

**When to Denormalize:**
- Display names (avoid joins for common displays)
- Aggregated counts (avoid expensive calculations)
- Frequently accessed reference data

**Example:**
```typescript
// Instead of joining to get vendor name every time
{
  vendorId: "vendor_123",
  vendorName: "ABC Plumbing"  // Denormalized for quick display
}

// Keep in sync with update triggers
async function updateVendorName(vendorId: string, newName: string) {
  // Update vendor document
  await db.collection('vendors').doc(vendorId).update({ name: newName });

  // Update all expenses referencing this vendor
  const batch = db.batch();
  const expenses = await db.collection('expenses')
    .where('vendorId', '==', vendorId)
    .get();

  expenses.forEach(doc => {
    batch.update(doc.ref, { vendorName: newName });
  });

  await batch.commit();
}
```

### 6.5 Indexes and Query Optimization

**Composite Indexes Required:**
```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "expenses",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "strataId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "quotes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "strataId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Query Best Practices:**
1. Always filter by strataId first (most selective)
2. Use composite indexes for multiple filters
3. Limit result sets (pagination)
4. Use `.limit()` for large collections
5. Avoid array-contains with other filters (requires index)

---

## 7. Authentication & Authorization

### 7.1 Authentication Flow

```typescript
// 1. User logs in
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

// 2. Get Firebase ID token
const idToken = await user.getIdToken();

// 3. Send token with API requests
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});

// 4. Server validates token
async function authenticateRequest(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
```

### 7.2 Authorization Pattern

**Role-Based Access Control (RBAC):**

```typescript
// shared/accessControl.ts
export const PERMISSIONS = {
  'chairperson': [
    'dashboard.view',
    'financial.view', 'financial.create', 'financial.edit', 'financial.delete',
    'vendors.view', 'vendors.create', 'vendors.edit', 'vendors.delete',
    'quotes.view', 'quotes.create', 'quotes.edit', 'quotes.approve',
    'meetings.view', 'meetings.create', 'meetings.edit', 'meetings.delete',
    'users.view', 'users.create', 'users.edit', 'users.delete',
    // ... all permissions
  ],
  'treasurer': [
    'dashboard.view',
    'financial.view', 'financial.create', 'financial.edit',
    'vendors.view', 'vendors.create',
    'quotes.view', 'quotes.create',
    // ... financial-focused permissions
  ],
  'resident': [
    'dashboard.view',
    'communications.view', 'communications.create',
    'maintenance.view', 'maintenance.create',
    'documents.view',
    // ... limited permissions
  ],
};

export function hasPermission(role: string, permission: string): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}

// Usage in components
const { userRole } = useAuth();

if (hasPermission(userRole, 'financial.create')) {
  return <Button onClick={handleCreateExpense}>Add Expense</Button>;
}
```

**Server-Side Authorization:**
```typescript
// Middleware to check permissions
function requirePermission(permission: string) {
  return async (req, res, next) => {
    const userId = req.user.uid;
    const strataId = req.params.strataId;

    // Get user's role in this strata
    const access = await db
      .collection('userStrataAccess')
      .where('userId', '==', userId)
      .where('strataId', '==', strataId)
      .limit(1)
      .get();

    if (access.empty) {
      return res.status(403).json({ error: 'No access to this strata' });
    }

    const role = access.docs[0].data().role;

    if (!hasPermission(role, permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.userRole = role;
    next();
  };
}

// Usage in routes
app.post('/api/strata/:strataId/expenses',
  authenticateRequest,
  requirePermission('financial.create'),
  async (req, res) => {
    // Create expense
  }
);
```

---

## 8. Error Handling Strategy

### 8.1 Frontend Error Handling

```typescript
// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// TanStack Query error handling
const { data, error, isError } = useQuery({
  queryKey: ['expenses'],
  queryFn: fetchExpenses,
  onError: (error) => {
    toast.error(`Failed to load expenses: ${error.message}`);
  },
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

if (isError) {
  return <ErrorMessage error={error} />;
}
```

### 8.2 Backend Error Handling

```typescript
// Custom error classes
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, message, 'VALIDATION_ERROR', details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}

// Global error handler middleware
function errorHandler(err, req, res, next) {
  // Log error
  console.error('Error:', err);

  // AppError (known errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}

// Usage in routes
app.get('/api/strata/:id', async (req, res, next) => {
  try {
    const strata = await getStrataById(req.params.id);

    if (!strata) {
      throw new NotFoundError('Strata');
    }

    res.json({ success: true, data: strata });
  } catch (error) {
    next(error); // Pass to error handler
  }
});
```

---

## 9. Testing Strategy

### 9.1 Testing Pyramid

```
       /\
      /  \     E2E Tests (10%)
     /____\    Integration Tests (30%)
    /      \   Unit Tests (60%)
   /________\
```

### 9.2 Unit Tests

**What to Test:**
- Utility functions
- Custom hooks
- Business logic functions
- Data transformations

**Example:**
```typescript
// lib/validators.test.ts
import { validateEmail, calculateMonthlyIncome } from './validators';

describe('validateEmail', () => {
  it('should return true for valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('should return false for invalid emails', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });
});

describe('calculateMonthlyIncome', () => {
  it('should calculate total income correctly', () => {
    const units = [
      { feeTierId: 'tier1', monthlyFee: 250 },
      { feeTierId: 'tier1', monthlyFee: 250 },
      { feeTierId: 'tier2', monthlyFee: 350 },
    ];

    expect(calculateMonthlyIncome(units)).toBe(850);
  });
});
```

### 9.3 Integration Tests

**What to Test:**
- API endpoints
- Database operations
- Service layer functions
- Authentication flows

**Example:**
```typescript
// server/routes.test.ts
import request from 'supertest';
import app from './index';

describe('POST /api/strata/:id/expenses', () => {
  it('should create expense with valid data', async () => {
    const response = await request(app)
      .post('/api/strata/test-strata-id/expenses')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        amount: 500,
        description: 'Test expense',
        category: 'maintenance',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
  });

  it('should return 401 without authentication', async () => {
    const response = await request(app)
      .post('/api/strata/test-strata-id/expenses')
      .send({});

    expect(response.status).toBe(401);
  });
});
```

### 9.4 E2E Tests

**What to Test:**
- Critical user flows
- Multi-step processes
- Cross-feature interactions

**Example:**
```typescript
// tests/e2e/expense-approval-flow.test.ts
import { test, expect } from '@playwright/test';

test('expense approval workflow', async ({ page }) => {
  // Login as treasurer
  await page.goto('/login');
  await page.fill('input[name="email"]', 'treasurer@test.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to financial page
  await page.click('text=Financial');
  await expect(page).toHaveURL('/financial');

  // Create new expense
  await page.click('text=Add Expense');
  await page.fill('input[name="description"]', 'Test expense');
  await page.fill('input[name="amount"]', '500');
  await page.selectOption('select[name="category"]', 'maintenance');
  await page.click('button:has-text("Submit")');

  // Verify expense appears in list
  await expect(page.locator('text=Test expense')).toBeVisible();
});
```

---

## 10. Development Workflow

### 10.1 Git Branching Strategy

**Branch Types:**
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features (`feature/expense-tracking`)
- `bugfix/*` - Bug fixes (`bugfix/dashboard-loading`)
- `hotfix/*` - Critical production fixes (`hotfix/auth-error`)
- `release/*` - Release preparation (`release/v1.0.0`)

**Workflow:**
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/vendor-management

# Work on feature, commit regularly
git add .
git commit -m "feat: add vendor creation form"

# Push and create PR
git push origin feature/vendor-management
# Create PR: feature/vendor-management -> develop

# After PR approval and merge
git checkout develop
git pull origin develop
git branch -d feature/vendor-management
```

### 10.2 Commit Message Convention

**Format:** `<type>(<scope>): <subject>`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Build process, dependencies, tooling

**Examples:**
```
feat(financial): add recurring expense functionality
fix(auth): resolve token expiration issue
docs(api): update endpoint documentation
refactor(vendors): extract vendor form to separate component
test(quotes): add unit tests for quote approval
chore(deps): update React to v18.3.1
```

### 10.3 Code Review Checklist

**Before Creating PR:**
- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Code follows naming conventions
- [ ] Added tests for new functionality
- [ ] Updated documentation if needed
- [ ] No commented-out code
- [ ] No hardcoded values (use constants/config)

**Reviewer Checklist:**
- [ ] Code meets requirements
- [ ] Logic is correct and efficient
- [ ] Error handling is adequate
- [ ] Security considerations addressed
- [ ] Accessibility requirements met
- [ ] Performance is acceptable
- [ ] Code is readable and maintainable
- [ ] Tests provide good coverage

### 10.4 Development Environment Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd strata-management-app

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Initialize Firebase
# - Create Firebase project
# - Download service account key
# - Add to .env

# 5. Start development server
npm run dev

# 6. In separate terminal, start backend
npm run dev:server

# 7. Run tests
npm test
npm run test:watch

# 8. Build for production
npm run build
```

---

## 11. Performance Optimization

### 11.1 Frontend Performance

**Code Splitting:**
```typescript
// Lazy load pages
const Dashboard = lazy(() => import('./pages/dashboard'));
const Financial = lazy(() => import('./pages/financial'));

// In router
<Suspense fallback={<LoadingSpinner />}>
  <Route path="/dashboard" component={Dashboard} />
  <Route path="/financial" component={Financial} />
</Suspense>
```

**Memoization:**
```typescript
// Memoize expensive calculations
const monthlyIncome = useMemo(() => {
  return calculateMonthlyIncome(units, feeTiers);
}, [units, feeTiers]);

// Memoize callbacks
const handleExpenseCreate = useCallback((expense: Expense) => {
  createExpenseMutation.mutate(expense);
}, [createExpenseMutation]);

// Memoize components
export const ExpenseCard = React.memo(({ expense }) => {
  // Component code
});
```

**Image Optimization:**
```typescript
// Use next-gen formats (WebP, AVIF)
// Lazy load images
<img
  src={imageUrl}
  loading="lazy"
  alt="Description"
/>

// Use srcset for responsive images
<img
  srcset="image-320w.jpg 320w, image-640w.jpg 640w"
  sizes="(max-width: 640px) 100vw, 640px"
  src="image-640w.jpg"
  alt="Description"
/>
```

### 11.2 Backend Performance

**Database Optimization:**
```typescript
// Use batch operations
const batch = db.batch();
expenses.forEach(expense => {
  const docRef = db.collection('expenses').doc();
  batch.set(docRef, expense);
});
await batch.commit();

// Limit query results
const expenses = await db
  .collection('expenses')
  .where('strataId', '==', strataId)
  .limit(50)
  .get();

// Use pagination
const expenses = await db
  .collection('expenses')
  .where('strataId', '==', strataId)
  .orderBy('createdAt', 'desc')
  .startAfter(lastDoc)
  .limit(20)
  .get();
```

**Caching:**
```typescript
// Cache frequently accessed data
const cache = new Map();

async function getStrataById(id: string) {
  // Check cache first
  if (cache.has(id)) {
    return cache.get(id);
  }

  // Fetch from database
  const strata = await db.collection('strata').doc(id).get();
  const data = strata.data();

  // Store in cache (with expiry)
  cache.set(id, data);
  setTimeout(() => cache.delete(id), 5 * 60 * 1000); // 5 min

  return data;
}
```

---

## 12. Deployment Process

### 12.1 Environment Configuration

**Environments:**
- **Development** - Local development
- **Staging** - Pre-production testing
- **Production** - Live application

**Environment Variables:**
```bash
# Development (.env.development)
NODE_ENV=development
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=dev_key
GOOGLE_APPLICATION_CREDENTIALS=./firebase-dev-key.json

# Staging (.env.staging)
NODE_ENV=staging
VITE_API_URL=https://staging-api.example.com
VITE_FIREBASE_API_KEY=staging_key
GOOGLE_APPLICATION_CREDENTIALS=./firebase-staging-key.json

# Production (.env.production)
NODE_ENV=production
VITE_API_URL=https://api.example.com
VITE_FIREBASE_API_KEY=prod_key
GOOGLE_APPLICATION_CREDENTIALS=./firebase-prod-key.json
```

### 12.2 Build Process

```bash
# Build web application
npm run build
# Output: dist/public/ (static files)

# Build server
npm run build:server
# Output: dist/index.js (Node.js server)

# Build mobile apps
npx cap sync
npx cap build ios
npx cap build android
```

### 12.3 Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Firebase security rules updated
- [ ] Database migrations run
- [ ] Performance testing completed
- [ ] Security audit passed
- [ ] Documentation updated

**Deployment Steps:**
1. Merge to main branch
2. Tag release (e.g., v1.0.0)
3. Build production artifacts
4. Deploy to hosting (Firebase Hosting, Vercel, etc.)
5. Run smoke tests
6. Monitor error logs
7. Notify team

**Post-Deployment:**
- [ ] Smoke tests pass
- [ ] No critical errors in logs
- [ ] Performance metrics acceptable
- [ ] Rollback plan ready if needed

---

## 13. Documentation Standards

### 13.1 Code Documentation

**JSDoc Comments:**
```typescript
/**
 * Calculates total monthly income for a strata based on unit assignments
 *
 * @param units - Array of units with fee tier assignments
 * @param feeTiers - Array of fee tier definitions
 * @returns Total monthly income in dollars
 *
 * @example
 * const income = calculateMonthlyIncome(units, feeTiers);
 * console.log(income); // 12500.00
 */
export function calculateMonthlyIncome(
  units: Unit[],
  feeTiers: FeeTier[]
): number {
  // Implementation
}
```

**Component Documentation:**
```typescript
/**
 * ExpenseCard displays a single expense with actions
 *
 * Features:
 * - Shows expense details (amount, description, date)
 * - Displays approval status
 * - Provides edit/delete actions based on permissions
 *
 * @component
 * @example
 * <ExpenseCard
 *   expense={expense}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 */
export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  // Implementation
}
```

### 13.2 API Documentation

**Maintain API.md with:**
- Endpoint descriptions
- Request/response formats
- Authentication requirements
- Error codes
- Usage examples

### 13.3 README Documentation

**Project README should include:**
- Project overview and purpose
- Technology stack
- Setup instructions
- Development workflow
- Deployment process
- Contributing guidelines
- License information

---

## 14. Security Best Practices

### 14.1 Input Validation

```typescript
// Always validate user input
import { z } from 'zod';

const expenseSchema = z.object({
  amount: z.number().positive().max(1000000),
  description: z.string().min(1).max(500),
  category: z.enum(['maintenance', 'utilities', 'insurance', 'other']),
  isRecurring: z.boolean(),
});

// In API route
app.post('/api/expenses', async (req, res) => {
  try {
    const validated = expenseSchema.parse(req.body);
    // Proceed with validated data
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});
```

### 14.2 Secure Data Access

```typescript
// Always verify user has access to requested resource
async function verifyStrataAccess(userId: string, strataId: string) {
  const access = await db
    .collection('userStrataAccess')
    .where('userId', '==', userId)
    .where('strataId', '==', strataId)
    .limit(1)
    .get();

  if (access.empty) {
    throw new UnauthorizedError('No access to this strata');
  }

  return access.docs[0].data();
}

// Use in routes
app.get('/api/strata/:id/expenses', async (req, res) => {
  await verifyStrataAccess(req.user.uid, req.params.id);
  // Proceed with query
});
```

### 14.3 Sensitive Data Handling

```typescript
// Never log sensitive data
console.log('User logged in:', {
  userId: user.id,
  // DON'T: password, tokens, credit cards
});

// Sanitize error messages
try {
  // Operation
} catch (error) {
  // Don't expose internal details to users
  res.status(500).json({
    error: 'An error occurred'
    // Not: error.message (might expose system details)
  });

  // Log full error for debugging
  console.error('Internal error:', error);
}
```

---

## 15. Maintenance & Support

### 15.1 Monitoring Setup

**Application Monitoring:**
- Error tracking (Sentry, Rollbar)
- Performance monitoring (Firebase Performance, New Relic)
- Uptime monitoring (Pingdom, UptimeRobot)
- User analytics (Google Analytics, Mixpanel)

**Alerts:**
- Critical errors (immediate notification)
- Performance degradation (alert if p95 > threshold)
- Downtime (alert if service unavailable)
- Security issues (authentication failures spike)

### 15.2 Backup Strategy

**Automated Backups:**
- Daily Firestore exports to Cloud Storage
- 30-day retention policy
- Monthly long-term archives
- Test restoration quarterly

### 15.3 Update Process

**Regular Updates:**
- Security patches: Immediate
- Dependency updates: Monthly
- Feature releases: Bi-weekly or monthly
- Major versions: Quarterly

**Update Checklist:**
- [ ] Review changelog
- [ ] Test in staging environment
- [ ] Check breaking changes
- [ ] Update dependencies
- [ ] Run full test suite
- [ ] Deploy to production
- [ ] Monitor for issues

---

## 16. Living Document Notice

This Planning.md document is a **living document** that should be updated as the project evolves. When making architectural decisions or discovering better patterns, update this document to reflect current best practices.

**Update Frequency:** Review and update quarterly or when major changes occur

**Version History:**
- v1.0 - October 13, 2025 - Initial planning document created

---

**Next Steps:**
1. Review and approve this planning document
2. Create Claude.md for AI assistant training
3. Create Tasks.md for task tracking
4. Begin development following these guidelines