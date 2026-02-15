# VibeStrat Firebase Storage Configuration Issue - Codebase Export

## CRITICAL ISSUE SUMMARY
**Document uploads fail with error: "The specified bucket does not exist"**
- Firebase project ID: `vibestrat` 
- Attempted bucket: `vibestrat.appspot.com` 
- Error: Firebase Storage bucket does not exist

## WORKING BEFORE
Document uploads worked correctly when using Replit's PostgreSQL database before Firebase migration.

## FIREBASE CONFIGURATION FILES

### 1. Firebase Admin SDK Initialization (`server/firebase-db.ts`)
```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
let app;
if (getApps().length === 0) {
  const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (!serviceAccountJson) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is required');
  }

  try {
    // Parse the JSON credentials from environment variable
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || 'vibestrat',
      storageBucket: `${serviceAccount.project_id}.appspot.com`, // THIS IS THE ISSUE
    });
    
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to parse Firebase credentials:', error);
    throw new Error('Invalid Firebase credentials format');
  }
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export { app };
```

### 2. Firebase Storage Bucket Configuration (`server/firebase-storage-bucket.ts`)
```typescript
import { getStorage } from 'firebase-admin/storage';
import { app } from './firebase-db';

// Initialize Firebase Storage with bucket name
export const bucket = getStorage(app).bucket('vibestrat.appspot.com'); // BUCKET DOESN'T EXIST

// Helper function to upload file to Firebase Storage
export async function uploadFileToStorage(
  fileName: string, 
  fileBuffer: Buffer, 
  contentType: string,
  folder: string = 'uploads'
): Promise<string> {
  try {
    const file = bucket.file(`${folder}/${fileName}`);
    
    await file.save(fileBuffer, {
      metadata: {
        contentType: contentType,
      },
      public: true, // Make file publicly accessible
    });

    // Return the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${folder}/${fileName}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw error;
  }
}
```

### 3. Storage Rules (`storage.rules`)
```
rules_version = '2';

// Firebase Storage Rules for VibeStrat
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload and read files
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Public read access for uploaded files
    match /uploads/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Documents folder
    match /documents/{strataId}/{fileName} {
      allow read, write: if request.auth != null;
    }
    
    // Maintenance photos
    match /maintenance/{strataId}/{fileName} {
      allow read, write: if request.auth != null;
    }
    
    // Quote documents
    match /quotes/{strataId}/{fileName} {
      allow read, write: if request.auth != null;
    }
    
    // Meeting recordings
    match /meetings/{strataId}/{fileName} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## UPLOAD ROUTE IMPLEMENTATION

### API Route (`server/routes.ts` - Emergency Upload Route)
```typescript
// EMERGENCY UPLOAD ROUTE - BYPASSES MIDDLEWARE ISSUES
app.post('/api/emergency-upload/:strataId', async (req, res) => {
  console.log('🚨 EMERGENCY UPLOAD ROUTE REACHED 🚨');
  
  try {
    const { strataId } = req.params;
    console.log('📁 Upload request for strata:', strataId);
    
    if (!req.file) {
      console.log('❌ No file provided');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('📋 File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Upload to Firebase Storage
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const folder = req.body.folderId || 'general';
    
    console.log('☁️ Uploading to Firebase Storage...');
    const fileUrl = await uploadFileToStorage(fileName, req.file.buffer, req.file.mimetype, `documents/${strataId}/${folder}`);
    console.log('✅ File uploaded successfully:', fileUrl);

    // Save document metadata to Firestore
    const documentData = {
      title: req.body.title || req.file.originalname,
      type: req.body.type || 'document',
      description: req.body.description || '',
      tags: req.body.tags || '',
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      strataId,
      folderId: req.body.folderId || null,
      uploadedBy: req.user?.id || 'unknown',
      uploadedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('💾 Saving document to Firestore...');
    const docRef = await db.collection('documents').add(documentData);
    console.log('✅ Document saved with ID:', docRef.id);

    const document = { id: docRef.id, ...documentData };
    res.status(201).json(document);
  } catch (error) {
    console.error('❌ Emergency upload failed:', error);
    res.status(500).json({ 
      message: `Emergency upload failed: ${JSON.stringify(error, null, 2)}` 
    });
  }
});
```

### Frontend Upload Code (`client/src/pages/documents.tsx`)
```typescript
const createDocumentMutation = useMutation({
  mutationFn: async (data: z.infer<typeof documentSchema>) => {
    if (!selectedFile) throw new Error("No file selected");
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', data.title);
    formData.append('type', data.type);
    if (data.description) formData.append('description', data.description);
    if (data.tags) formData.append('tags', data.tags);
    if (currentFolderId) formData.append('folderId', currentFolderId);
    
    // EMERGENCY ROUTE - BYPASS MIDDLEWARE ISSUES
    console.log('🚨 Using emergency upload route');
    const response = await apiRequest("POST", `/api/emergency-upload/${currentStrata?.id}`, formData);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create document");
    }
    return response.json();
  },
  onSuccess: () => {
    toast({ title: "Success", description: "Document uploaded successfully" });
    fetchDocuments();
    setShowUploadDocument(false);
    setSelectedFile(null);
    documentForm.reset();
  },
  onError: (error) => {
    toast({
      title: "Upload Failed",
      description: error.message,
      variant: "destructive",
    });
  },
});
```

## ERROR LOGS

### Console Error Output
```
🚨 API Request Failed: {
  "status": 500,
  "statusText": "Internal Server Error", 
  "responseText": "{\"message\":\"Emergency upload failed: {\\n  \\\"error\\\": {\\n    \\\"code\\\": 404,\\n    \\\"message\\\": \\\"The specified bucket does not exist.\\\",\\n    \\\"errors\\\": [\\n      {\\n        \\\"message\\\": \\\"The specified bucket does not exist.\\\",\\n        \\\"domain\\\": \\\"global\\\",\\n        \\\"reason\\\": \\\"notFound\\\"\\n      }\\n    ]\\n  }\\n}\\n\"}"
}
```

## ENVIRONMENT VARIABLES
```
VITE_FIREBASE_PROJECT_ID=vibestrat
VITE_FIREBASE_API_KEY=[REDACTED]
VITE_FIREBASE_APP_ID=[REDACTED]
GOOGLE_APPLICATION_CREDENTIALS=[SERVICE_ACCOUNT_JSON]
```

## PROJECT STRUCTURE
```
├── server/
│   ├── firebase-db.ts           # Firebase Admin SDK initialization
│   ├── firebase-storage-bucket.ts # Storage bucket configuration (ISSUE HERE)
│   ├── firebase-storage.ts     # Firestore operations 
│   ├── routes.ts               # API routes including emergency upload
│   └── index.ts               # Express server
├── client/src/pages/
│   └── documents.tsx          # Frontend document upload component
├── storage.rules              # Firebase Storage security rules
└── shared/
    └── schema.ts              # TypeScript type definitions
```

## QUESTIONS FOR FIREBASE EXPERT:

1. **How to properly configure Firebase Storage bucket for project `vibestrat`?**
   - Should the bucket be `vibestrat.appspot.com` or different name?
   - How to create/enable the Storage bucket in Firebase Console?

2. **Is the Firebase Admin SDK initialization correct?**
   - Are we using the right bucket name format?
   - Should storageBucket configuration match projectId exactly?

3. **Storage Rules deployment - are these correctly configured?**
   - Do the rules need to be deployed separately?
   - Is the bucket reference correct in the rules?

4. **Working previously with Replit database:**
   - Files were stored as base64 in PostgreSQL before
   - Now trying to migrate to Firebase Storage for proper file handling
   - Need to maintain same upload functionality

## IMMEDIATE NEED
Fix Firebase Storage bucket configuration so document uploads work again. The application was working perfectly with PostgreSQL storage, now needs Firebase Storage to work with the same functionality.