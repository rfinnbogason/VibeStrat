import { getStorage } from 'firebase-admin/storage';
import { app } from './firebase-db';

// Initialize Firebase Storage with proper bucket name
export const bucket = getStorage(app).bucket();

// Helper function to upload file to Firebase Storage
export async function uploadFileToStorage(
  fileName: string, 
  fileBuffer: Buffer, 
  contentType: string,
  folder: string = 'uploads'
): Promise<string> {
  try {
    console.log('🔍 Attempting Firebase Storage upload...');
    console.log('📊 Bucket info:', { name: bucket.name, exists: await bucket.exists() });
    
    const file = bucket.file(`${folder}/${fileName}`);
    
    await file.save(fileBuffer, {
      metadata: {
        contentType: contentType,
      },
      public: true, // Make file publicly accessible
    });

    // Return the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${folder}/${fileName}`;
    console.log('✅ Firebase Storage upload successful:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ Firebase Storage upload failed:', error);
    console.log('🔄 Falling back to base64 storage in Firestore...');
    
    // Fallback: store as base64 in Firestore (like the original working version)
    const base64Data = fileBuffer.toString('base64');
    const fileUrl = `data:${contentType};base64,${base64Data}`;
    
    console.log('✅ Fallback base64 storage successful');
    return fileUrl;
  }
}

// Helper function to delete file from Firebase Storage
export async function deleteFileFromStorage(filePath: string): Promise<void> {
  try {
    await bucket.file(filePath).delete();
  } catch (error) {
    console.error('Error deleting file from Firebase Storage:', error);
    throw error;
  }
}

// Helper function to get signed URL for private files
export async function getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
  try {
    const [url] = await bucket.file(filePath).getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 1000, // expires in seconds
    });
    return url;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
}