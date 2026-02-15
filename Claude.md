# Claude Training Document
# Strata Management Application

**Version:** 1.0
**Date:** October 13, 2025
**Purpose:** Training guide for Claude AI assistant working on this project

---

## 1. Project Context & Overview

### 1.1 What This Project Is

This is a **comprehensive strata management platform** designed to streamline administrative workflows for strata councils, property managers, and residents. The application provides:

- Multi-role user management with RBAC
- Financial tracking and reporting
- Vendor and quote management with AI document analysis
- Meeting scheduling with audio transcription
- Internal communications and announcements
- Maintenance request tracking
- Document repository
- Subscription billing system
- Mobile apps for iOS and Android

### 1.2 Technology Stack

**Frontend:**
- React 18+ with TypeScript
- Vite (build tool)
- shadcn/ui + Radix UI (component library)
- Tailwind CSS (styling)
- TanStack Query / React Query (server state)
- Wouter (routing)
- React Hook Form + Zod (forms/validation)

**Backend:**
- Node.js + Express.js
- TypeScript with ES modules
- Firebase Firestore (database)
- Firebase Authentication (auth)
- Firebase Storage (file uploads)
- OpenAI API (document analysis, transcription)

**Mobile:**
- Capacitor 7+ (native wrapper)
- iOS and Android apps
- Shared codebase with web app

### 1.3 Key Documents to Reference

Before working on any task, familiarize yourself with:

1. **PRD.md** - Complete feature specifications and requirements
2. **Planning.md** - Development structure, conventions, and best practices
3. **Tasks.md** - Current task tracking and progress (check before starting new work)

---

## 2. How to Approach Work on This Project

### 2.1 Before Starting Any Task

**ALWAYS follow this sequence:**

1. **Read Tasks.md** - Check if this work has already been done or is in progress
2. **Review PRD.md** - Understand the feature requirements and acceptance criteria
3. **Check Planning.md** - Follow the established patterns and conventions
4. **Understand the context** - Where does this fit in the application architecture?
5. **Plan your approach** - Think through the implementation before coding
6. **Update Tasks.md** - Add the task and mark as "in progress"

### 2.2 Development Workflow

**Step-by-step process:**

```
1. Understand requirement
   ↓
2. Check existing code for similar patterns
   ↓
3. Plan implementation (which files to modify/create)
   ↓
4. Write code following conventions
   ↓
5. Test functionality
   ↓
6. Update Tasks.md (mark as complete)
   ↓
7. Document any important decisions or changes
```

### 2.3 Communication Style

When working with the user:

- **Be concise** - Get to the point quickly
- **Be specific** - Reference file paths with line numbers (e.g., `server/routes.ts:245`)
- **Explain decisions** - When making architectural choices, explain why
- **Ask when uncertain** - Don't make assumptions about business logic
- **Show code samples** - Use code blocks to illustrate changes
- **Provide alternatives** - Offer options when multiple approaches exist

---

## 3. Critical Rules & Patterns

### 3.1 Data Isolation - THE MOST CRITICAL RULE

**⚠️ ALWAYS FILTER BY `strataId` ⚠️**

This application supports multiple strata organizations. **Data MUST be isolated** between organizations.

**CORRECT:**
```typescript
// Frontend - Always use selectedStrataId from context
const { selectedStrataId } = useStrata();

const { data: expenses } = useQuery({
  queryKey: ['expenses', selectedStrataId],
  queryFn: () => fetchExpenses(selectedStrataId),
  enabled: !!selectedStrataId, // Don't fetch without strataId
});

// Backend - Always filter by strataId
const expenses = await db
  .collection('expenses')
  .where('strataId', '==', strataId)
  .get();
```

**INCORRECT (Data bleeding):**
```typescript
// DON'T DO THIS - No strataId filter
const expenses = await db.collection('expenses').get();

// DON'T DO THIS - Hardcoded strataId
const expenses = await fetchExpenses('some-hardcoded-id');
```

**Why this matters:**
- Previous VibeStrat implementation had data bleeding issues
- Strata A should NEVER see data from Strata B
- This is a security and privacy requirement

**Enforcement checklist:**
- [ ] All database queries include strataId filter
- [ ] API endpoints validate user has access to strataId
- [ ] Frontend components use global selectedStrataId context
- [ ] Firestore security rules enforce strataId matching

### 3.2 Authentication Pattern

**Firebase Authentication Flow:**

```typescript
// 1. User logs in (client side)
const { user } = useAuth(); // From AuthContext

// 2. Get Firebase ID token for API calls
const token = await user.getIdToken();

// 3. Send with requests
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 4. Server validates token
const decodedToken = await admin.auth().verifyIdToken(token);
const userId = decodedToken.uid;
```

**Key points:**
- NEVER store passwords in plain text
- ALWAYS use Firebase ID tokens for API authentication
- ALWAYS verify tokens on the server side
- Check user has access to the strataId they're requesting

### 3.3 Role-Based Access Control (RBAC)

**Roles hierarchy (most to least privileged):**
1. `master_admin` - System-wide access (only rfinnbogason@gmail.com)
2. `chairperson` - Full strata access
3. `treasurer` - Financial focus
4. `secretary` - Administrative focus
5. `council_member` - Limited council access
6. `property_manager` - Multi-strata management
7. `resident` - Basic access

**Permission checking:**

```typescript
// Frontend
import { hasPermission } from '@/shared/accessControl';

const { userRole } = useAuth();

if (hasPermission(userRole, 'financial.create')) {
  return <Button onClick={handleCreate}>Add Expense</Button>;
}

// Backend
function requirePermission(permission: string) {
  return async (req, res, next) => {
    const userRole = await getUserRole(req.user.uid, req.params.strataId);

    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}
```

**Important:**
- User can have DIFFERENT roles in DIFFERENT stratas
- Always check role for the SPECIFIC strata being accessed
- UI should hide features user doesn't have permission to use

### 3.4 Component Structure Pattern

**ALWAYS follow this structure:**

```typescript
// 1. Imports (grouped)
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import type { Expense } from '@/types/financial';

// 2. Types/Interfaces
interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
}

// 3. Component
export function ExpenseCard({ expense, onEdit }: ExpenseCardProps) {
  // 4. Hooks (context, state, effects, queries)
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // 5. Event handlers
  const handleEdit = () => {
    setIsEditing(true);
    onEdit?.(expense);
  };

  // 6. Render with early returns for loading/error
  if (!expense) return null;

  // 7. Main JSX
  return (
    <Card>
      {/* Component content */}
    </Card>
  );
}
```

### 3.5 API Route Pattern

**Standard API route structure:**

```typescript
// server/routes.ts

// GET - Fetch list
app.get('/api/strata/:strataId/expenses',
  authenticateRequest,
  requirePermission('financial.view'),
  async (req, res, next) => {
    try {
      const { strataId } = req.params;
      const userId = req.user.uid;

      // Verify access
      await verifyStrataAccess(userId, strataId);

      // Fetch data (with strataId filter!)
      const expenses = await db
        .collection('expenses')
        .where('strataId', '==', strataId)
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get();

      const data = expenses.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

// POST - Create
app.post('/api/strata/:strataId/expenses',
  authenticateRequest,
  requirePermission('financial.create'),
  async (req, res, next) => {
    try {
      const { strataId } = req.params;
      const userId = req.user.uid;

      await verifyStrataAccess(userId, strataId);

      // Validate input
      const validated = expenseSchema.parse(req.body);

      // Create document
      const docRef = await db.collection('expenses').add({
        ...validated,
        strataId, // ALWAYS include strataId
        submittedBy: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(201).json({
        success: true,
        data: { id: docRef.id, ...validated }
      });
    } catch (error) {
      next(error);
    }
  }
);
```

**Key points:**
- ALWAYS authenticate
- ALWAYS verify strataId access
- ALWAYS validate input
- ALWAYS include strataId in created documents
- ALWAYS handle errors with try/catch
- ALWAYS use next(error) for error handling

---

## 4. Common Tasks & How to Handle Them

### 4.1 Adding a New Page

**Steps:**

1. Create page component in `client/src/pages/`
   ```typescript
   // client/src/pages/new-feature.tsx
   export default function NewFeaturePage() {
     const { selectedStrataId } = useStrata();
     // Component implementation
   }
   ```

2. Add route in `client/src/App.tsx`
   ```typescript
   <Route path="/new-feature" component={NewFeaturePage} />
   ```

3. Add to sidebar navigation in `client/src/components/layout/sidebar.tsx`
   ```typescript
   {
     path: '/new-feature',
     label: 'New Feature',
     icon: NewIcon,
     permissions: ['feature.view']
   }
   ```

4. Update role permissions in `shared/accessControl.ts`
   ```typescript
   'chairperson': [
     // ... existing permissions
     'feature.view',
     'feature.create',
   ]
   ```

### 4.2 Adding a New API Endpoint

**Steps:**

1. Define types in `shared/firebase-types.ts`
   ```typescript
   export interface FirebaseNewEntity extends BaseFirebaseDocument {
     strataId: string;
     name: string;
     // ... other fields
   }
   ```

2. Add API route in `server/routes.ts`
   ```typescript
   app.get('/api/strata/:strataId/new-entities',
     authenticateRequest,
     requirePermission('entity.view'),
     async (req, res, next) => {
       // Implementation (with strataId filter!)
     }
   );
   ```

3. Create frontend API function in `client/src/lib/api.ts`
   ```typescript
   export async function fetchNewEntities(strataId: string) {
     return apiRequest<NewEntity[]>(`/api/strata/${strataId}/new-entities`);
   }
   ```

4. Use in component with React Query
   ```typescript
   const { data: entities } = useQuery({
     queryKey: ['new-entities', selectedStrataId],
     queryFn: () => fetchNewEntities(selectedStrataId),
     enabled: !!selectedStrataId,
   });
   ```

### 4.3 Adding a New Form

**Steps:**

1. Define Zod schema for validation
   ```typescript
   import { z } from 'zod';

   const newEntitySchema = z.object({
     name: z.string().min(1, 'Name is required'),
     amount: z.number().positive('Must be positive'),
   });

   type NewEntityFormData = z.infer<typeof newEntitySchema>;
   ```

2. Create form component with React Hook Form
   ```typescript
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';

   export function NewEntityForm({ onSubmit }) {
     const form = useForm<NewEntityFormData>({
       resolver: zodResolver(newEntitySchema),
       defaultValues: {
         name: '',
         amount: 0,
       },
     });

     const handleSubmit = form.handleSubmit((data) => {
       onSubmit(data);
     });

     return (
       <form onSubmit={handleSubmit}>
         {/* Form fields */}
       </form>
     );
   }
   ```

3. Use in dialog/modal
   ```typescript
   <Dialog open={isOpen} onOpenChange={setIsOpen}>
     <DialogContent>
       <DialogHeader>
         <DialogTitle>Create New Entity</DialogTitle>
       </DialogHeader>
       <NewEntityForm onSubmit={handleCreate} />
     </DialogContent>
   </Dialog>
   ```

### 4.4 Adding AI Features

**OpenAI integration pattern:**

```typescript
// server/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeDocument(documentData: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `Analyze this document and extract key information: ${documentData}`
      }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('AI analysis failed');
  }
}
```

**Important:**
- ALWAYS handle AI API errors gracefully
- Provide fallback to manual entry
- Show user-friendly error messages
- Implement usage quotas to control costs

### 4.5 File Upload Handling

**Pattern for file uploads:**

```typescript
// Frontend
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('strataId', selectedStrataId);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const { fileUrl } = await response.json();
  return fileUrl;
};

// Backend with Firebase Storage
import { getStorage } from 'firebase-admin/storage';

const bucket = getStorage().bucket();

app.post('/api/upload',
  authenticateRequest,
  upload.single('file'),
  async (req, res, next) => {
    try {
      const file = req.file;
      const { strataId } = req.body;

      // Verify access
      await verifyStrataAccess(req.user.uid, strataId);

      // Upload to Firebase Storage
      const fileName = `${strataId}/${Date.now()}_${file.originalname}`;
      const fileBuffer = file.buffer;

      await bucket.file(fileName).save(fileBuffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });

      // Get signed URL
      const [url] = await bucket.file(fileName).getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60 * 24 * 365, // 1 year
      });

      res.json({ success: true, fileUrl: url });
    } catch (error) {
      next(error);
    }
  }
);
```

---

## 5. Common Pitfalls to Avoid

### 5.1 Data Bleeding Between Stratas

**Problem:**
```typescript
// WRONG - No strataId filter
const vendors = await db.collection('vendors').get();
// Returns vendors from ALL stratas!
```

**Solution:**
```typescript
// CORRECT - Filter by strataId
const vendors = await db
  .collection('vendors')
  .where('strataId', '==', strataId)
  .get();
```

**Always ask yourself:** "Is this query filtered by strataId?"

### 5.2 Hardcoded Values

**Problem:**
```typescript
// WRONG - Hardcoded strataId
const expenses = await fetchExpenses('test-strata-123');
```

**Solution:**
```typescript
// CORRECT - Use from context
const { selectedStrataId } = useStrata();
const expenses = await fetchExpenses(selectedStrataId);
```

### 5.3 Missing Loading States

**Problem:**
```typescript
// WRONG - No loading state
const { data } = useQuery({ queryKey: ['expenses'], queryFn: fetchExpenses });
return <div>{data.map(expense => ...)}</div>; // Crashes if data is undefined
```

**Solution:**
```typescript
// CORRECT - Handle all states
const { data, isLoading, error } = useQuery({
  queryKey: ['expenses'],
  queryFn: fetchExpenses
});

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data || data.length === 0) return <EmptyState />;

return <div>{data.map(expense => ...)}</div>;
```

### 5.4 Not Invalidating Cache

**Problem:**
```typescript
// WRONG - Data doesn't update after mutation
const mutation = useMutation({
  mutationFn: createExpense,
  // Missing cache invalidation
});
```

**Solution:**
```typescript
// CORRECT - Invalidate affected queries
const mutation = useMutation({
  mutationFn: createExpense,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
  },
});
```

### 5.5 Ignoring Role Permissions

**Problem:**
```typescript
// WRONG - No permission check
<Button onClick={deleteExpense}>Delete</Button>
```

**Solution:**
```typescript
// CORRECT - Check permissions
const { userRole } = useAuth();

{hasPermission(userRole, 'financial.delete') && (
  <Button onClick={deleteExpense}>Delete</Button>
)}
```

### 5.6 Poor Error Messages

**Problem:**
```typescript
// WRONG - Generic error
catch (error) {
  toast.error('Error');
}
```

**Solution:**
```typescript
// CORRECT - Specific, actionable error
catch (error) {
  if (error.code === 'QUOTA_EXCEEDED') {
    toast.error('AI quota exceeded. Please try again later or enter details manually.');
  } else {
    toast.error(`Failed to analyze document: ${error.message}`);
  }
}
```

---

## 6. Mobile Development Considerations

### 6.1 Responsive Design

**Always test on multiple screen sizes:**
- Mobile: 375px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Use Tailwind responsive classes:**
```tsx
<div className="flex flex-col md:flex-row gap-4">
  <Button className="w-full md:w-auto">Submit</Button>
</div>
```

**Mobile-specific patterns:**
```tsx
// Convert tables to cards on mobile
<div className="hidden md:block">
  <Table>{/* Desktop table */}</Table>
</div>
<div className="md:hidden space-y-4">
  {items.map(item => (
    <Card key={item.id}>{/* Mobile card */}</Card>
  ))}
</div>
```

### 6.2 Touch-Friendly Interactions

**Minimum touch target: 44px x 44px**

```tsx
// GOOD - Large enough for touch
<Button className="min-h-[44px] min-w-[44px]">
  <Icon />
</Button>

// BAD - Too small for touch
<button className="p-1">
  <Icon size={12} />
</button>
```

### 6.3 Native Features

**When using Capacitor plugins:**

```typescript
import { Camera } from '@capacitor/camera';

const takePicture = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
    });

    // Upload image
    uploadImage(image.webPath);
  } catch (error) {
    console.error('Camera error:', error);
  }
};
```

---

## 7. Performance Guidelines

### 7.1 Query Optimization

**Use proper indexes:**
```typescript
// Requires composite index: strataId + status + createdAt
const expenses = await db
  .collection('expenses')
  .where('strataId', '==', strataId)
  .where('status', '==', 'pending')
  .orderBy('createdAt', 'desc')
  .limit(50)
  .get();
```

**Limit result sets:**
```typescript
// GOOD - Limited results
.limit(50)

// BAD - Fetching everything
.get() // without limit
```

### 7.2 Component Optimization

**Memoize expensive calculations:**
```typescript
const totalIncome = useMemo(() => {
  return calculateMonthlyIncome(units, feeTiers);
}, [units, feeTiers]);
```

**Memoize callbacks:**
```typescript
const handleCreate = useCallback((data) => {
  createMutation.mutate(data);
}, [createMutation]);
```

**Memoize components:**
```typescript
export const ExpenseCard = React.memo(({ expense }) => {
  // Component
});
```

### 7.3 Code Splitting

**Lazy load pages:**
```typescript
const Dashboard = lazy(() => import('./pages/dashboard'));
const Financial = lazy(() => import('./pages/financial'));

<Suspense fallback={<LoadingSpinner />}>
  <Route path="/dashboard" component={Dashboard} />
</Suspense>
```

---

## 8. Testing Approach

### 8.1 What to Test

**Critical paths:**
- Authentication flow
- Data isolation (strataId filtering)
- Financial calculations
- Permission checks
- API endpoints
- Form validation

**Test example:**
```typescript
describe('Expense creation', () => {
  it('should include strataId in created expense', async () => {
    const expense = await createExpense({
      amount: 500,
      description: 'Test',
      strataId: 'test-strata-id',
    });

    expect(expense.strataId).toBe('test-strata-id');
  });

  it('should prevent access to other strata expenses', async () => {
    await expect(
      fetchExpenses('other-strata-id')
    ).rejects.toThrow('Unauthorized');
  });
});
```

### 8.2 Manual Testing Checklist

Before marking a feature as complete:

- [ ] Test with different roles (chairperson, treasurer, resident)
- [ ] Test with multiple stratas (data isolation)
- [ ] Test loading states
- [ ] Test error states
- [ ] Test empty states
- [ ] Test on mobile (responsive design)
- [ ] Test permissions (can't access unauthorized features)
- [ ] Test logout and re-login

---

## 9. Debugging Tips

### 9.1 Common Issues and Solutions

**Issue: Data not loading**
```typescript
// Check:
1. Is selectedStrataId defined?
   console.log('selectedStrataId:', selectedStrataId);

2. Is the query enabled?
   enabled: !!selectedStrataId

3. Is there a network error?
   Check browser console and Network tab

4. Is authentication working?
   console.log('user:', user);
   console.log('token:', await user?.getIdToken());
```

**Issue: Data showing from wrong strata**
```typescript
// Check:
1. Is strataId filter in query?
   .where('strataId', '==', strataId)

2. Is correct strataId being used?
   console.log('Using strataId:', strataId);

3. Is global context up to date?
   const { selectedStrataId } = useStrata();
   console.log('Global strataId:', selectedStrataId);
```

**Issue: Permission denied**
```typescript
// Check:
1. User's role in this strata
   const role = await getUserRole(userId, strataId);
   console.log('User role:', role);

2. Required permission
   console.log('Required permission:', permission);

3. Role has permission?
   console.log('Has permission:', hasPermission(role, permission));
```

### 9.2 Firestore Debugging

**View query results:**
```typescript
const snapshot = await db.collection('expenses')
  .where('strataId', '==', strataId)
  .get();

console.log('Documents found:', snapshot.size);
snapshot.forEach(doc => {
  console.log(doc.id, doc.data());
});
```

**Check security rules:**
```javascript
// Test in Firebase Console → Firestore → Rules Playground
```

---

## 10. Maintenance Tasks

### 10.1 Regular Updates

**Monthly tasks:**
- Update dependencies (`npm update`)
- Review and address security vulnerabilities
- Check Firebase usage and costs
- Review error logs for patterns
- Update documentation if needed

### 10.2 Performance Monitoring

**Monitor:**
- API response times
- Firestore read/write counts
- OpenAI API usage and costs
- Firebase Storage usage
- Error rates

### 10.3 Database Maintenance

**Periodic cleanup:**
- Archive old notifications (>30 days)
- Clean up expired announcements
- Remove orphaned documents
- Optimize indexes based on usage

---

## 11. Project-Specific Conventions

### 11.1 This Project's Specific Patterns

**Strata Context Pattern:**
```typescript
// ALWAYS get strataId from context
const { selectedStrataId } = useStrata();

// NEVER hardcode or use localStorage directly
// const strataId = localStorage.getItem('strataId'); // DON'T
```

**API Request Pattern:**
```typescript
// Use the apiRequest helper
import { apiRequest } from '@/lib/api';

const data = await apiRequest<Expense[]>(`/api/strata/${strataId}/expenses`);

// NOT raw fetch
// const response = await fetch(...); // DON'T
```

**Date Handling:**
```typescript
// Use Firebase Timestamp
import { Timestamp } from 'firebase/firestore';

const now = Timestamp.now();
const date = Timestamp.fromDate(new Date());
```

### 11.2 File Organization

**Where to put new code:**

- **New page?** → `client/src/pages/`
- **New component?** → `client/src/components/{module}/`
- **New API endpoint?** → `server/routes.ts`
- **New type?** → `shared/firebase-types.ts`
- **New utility?** → `client/src/lib/utils.ts` or `server/utils/`
- **New hook?** → `client/src/hooks/`

### 11.3 Naming Patterns

**Be consistent with existing names:**

- Financial: `expenses`, `funds`, `paymentReminders`
- Vendors: `vendors`, `vendorContracts`, `vendorHistory`
- Communications: `messages`, `announcements`, `notifications`
- Meetings: `meetings`, `invitees`, `recordings`
- Maintenance: `maintenanceRequests`, `photos`, `workNotes`

---

## 12. When to Ask Questions

### 12.1 Always Ask When:

1. **Business logic is unclear** - "Should this expense auto-approve for amounts under $100?"
2. **Multiple approaches exist** - "Should I use a modal or a separate page for this form?"
3. **Breaking changes needed** - "This would require changing the database schema, should I proceed?"
4. **External dependencies** - "Do you have an OpenAI API key set up?"
5. **User preference matters** - "Would you prefer tabs or a sidebar for navigation?"

### 12.2 Don't Ask When:

1. **Convention is established** - Follow Planning.md patterns
2. **PRD is clear** - If the requirement is specified, implement it
3. **Standard practice** - Follow React/TypeScript best practices
4. **Already documented** - Check Claude.md, Planning.md, PRD.md first

---

## 13. Version Control & Collaboration

### 13.1 Commit Messages

**Follow this format:**
```
<type>(<scope>): <subject>

feat(financial): add recurring expense functionality
fix(auth): resolve token expiration issue
docs(api): update endpoint documentation
refactor(vendors): extract form to separate component
```

### 13.2 Before Committing

**Checklist:**
- [ ] Code compiles without errors
- [ ] No console.log() left in code (unless intentional)
- [ ] No commented-out code
- [ ] Follows naming conventions
- [ ] Follows established patterns
- [ ] Updated Tasks.md

---

## 14. Success Criteria

### 14.1 High-Quality Code Checklist

Every piece of code should meet these criteria:

- [ ] **Functional** - Works as intended
- [ ] **Isolated** - Filters by strataId where applicable
- [ ] **Secure** - Validates authentication and permissions
- [ ] **Performant** - No unnecessary re-renders or queries
- [ ] **Accessible** - ARIA labels, keyboard navigation
- [ ] **Responsive** - Works on mobile, tablet, desktop
- [ ] **Maintainable** - Clear, documented, follows conventions
- [ ] **Tested** - Handles loading, error, empty states
- [ ] **Consistent** - Matches existing patterns and style

### 14.2 Definition of Done

A task is complete when:

1. Feature works according to PRD specifications
2. Code follows Planning.md conventions
3. Data isolation verified (no strataId bleeding)
4. Permissions enforced correctly
5. All states handled (loading, error, empty, success)
6. Responsive on all screen sizes
7. No console errors or warnings
8. Tasks.md updated with completion status
9. User has tested and approved (if applicable)

---

## 15. Quick Reference

### 15.1 Most Common Commands

```bash
# Start development
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Type check
npm run check

# Update dependencies
npm update

# Build mobile
npx cap sync
```

### 15.2 Most Used Imports

```typescript
// React basics
import { useState, useEffect, useMemo, useCallback } from 'react';

// React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Hooks
import { useAuth } from '@/hooks/useAuth';
import { useStrata } from '@/hooks/useStrata';

// Utils
import { apiRequest } from '@/lib/api';
import { hasPermission } from '@/shared/accessControl';

// Types
import type { Expense, Vendor, Quote } from '@/shared/firebase-types';
```

### 15.3 Key File Locations

```
Authentication:
- client/src/contexts/AuthContext.tsx
- server/firebase-auth.ts

Strata Context:
- client/src/contexts/StrataContext.tsx

API Routes:
- server/routes.ts

Database Types:
- shared/firebase-types.ts

Permissions:
- shared/accessControl.ts

UI Components:
- client/src/components/ui/

Feature Components:
- client/src/components/{module}/

Pages:
- client/src/pages/
```

---

## 16. Final Notes

### 16.1 Remember

1. **Data isolation is critical** - Always filter by strataId
2. **Check Tasks.md first** - Don't duplicate work
3. **Follow established patterns** - Consistency matters
4. **Ask when uncertain** - Better to ask than assume
5. **Test thoroughly** - Multiple roles, states, screen sizes
6. **Document decisions** - Update docs when making changes

### 16.2 This is a Living Document

As you work on the project, you may discover:
- Better patterns
- Common mistakes
- Helpful shortcuts
- Important gotchas

**Update this document** when you learn something important that would help future work on the project.

---

**You're now ready to work on the Strata Management Application!**

Always reference:
1. **PRD.md** for requirements
2. **Planning.md** for structure and conventions
3. **Tasks.md** for current work status
4. **This document (Claude.md)** for project-specific guidance

Good luck and happy coding! 🚀