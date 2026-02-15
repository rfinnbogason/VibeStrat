# Firestore Composite Indexes Required

This document lists all Firestore composite indexes that need to be created in the Firebase Console for the application to function correctly.

## Why Indexes Are Needed

Firestore requires composite indexes for queries that:
1. Filter by multiple fields
2. Combine filtering with ordering
3. Use inequality operators on multiple fields

## How to Create Indexes

When you encounter an index error in the logs, Firestore provides a direct link to create the index. Simply:
1. Click the URL in the error message
2. Firebase Console will open with the index pre-configured
3. Click "Create Index"
4. Wait for the index to build (can take a few minutes)

## Required Indexes

### 1. Messages Collection
**Query:** Filter by `strataId` + Order by `createdAt`

**Fields:**
- `strataId` (Ascending)
- `createdAt` (Descending)

**Error Message:**
```
The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/vibestrat/firestore/indexes?create_composite=...
```

**Where Used:**
- Communications page (server/routes.ts:3197)
- Function: `getMessagesByStrata`

---

### 2. Announcements Collection
**Query:** Filter by `strataId` + Order by `publishDate`

**Fields:**
- `strataId` (Ascending)
- `publishDate` (Descending)

**Where Used:**
- Communications page
- Function: `getStrataAnnouncements`

---

### 3. Funds Collection
**Query:** Filter by `strataId` + Order by `createdAt`

**Fields:**
- `strataId` (Ascending)
- `createdAt` (Descending)

**Where Used:**
- Financial page
- Function: `getStrataFunds`

---

### 4. Expenses Collection
**Query:** Filter by `strataId` + Order by `createdAt`

**Fields:**
- `strataId` (Ascending)
- `createdAt` (Descending)

**Where Used:**
- Financial page
- Function: `getStrataExpenses`

---

### 5. Maintenance Requests Collection
**Query:** Filter by `strataId` + `status` + Order by `createdAt`

**Fields:**
- `strataId` (Ascending)
- `status` (Ascending)
- `createdAt` (Descending)

**Where Used:**
- Dashboard, Maintenance page
- Function: `getStrataMetrics` (for pending maintenance count)

---

### 6. Quotes Collection
**Query:** Filter by `strataId` + `status`

**Fields:**
- `strataId` (Ascending)
- `status` (Ascending)

**Where Used:**
- Quotes page
- Function: `getStrataMetrics` (for pending quotes count)

---

## Quick Start

1. Start the application and navigate through all pages
2. Watch the server logs for Firestore index errors
3. Click the provided URLs to create indexes
4. Wait for indexes to build
5. Refresh the page to see data loading correctly

## Important Notes

- **Index Creation Time:** Can take 5-15 minutes depending on data volume
- **Data Isolation:** All indexes MUST include `strataId` as the first field to maintain data isolation between organizations
- **Production vs Development:** Indexes need to be created in each Firebase environment separately
- **Performance:** Proper indexes are critical for query performance and data security

## Verification

After creating all indexes, verify by:
1. Navigating to Firebase Console → Firestore → Indexes
2. Ensure all indexes show status: "Enabled"
3. Test all application pages to ensure data loads without errors
4. Check server logs for no index-related errors
