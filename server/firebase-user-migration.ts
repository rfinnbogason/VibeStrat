import { storage } from "./storage";

interface PostgreSQLUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface MigrationResult {
  email: string;
  status: 'success' | 'error' | 'exists';
  firebaseUid?: string;
  tempPassword?: string;
  error?: string;
}

export class FirebaseUserMigration {
  private temporaryPassword = "VibeStrat2025!"; // Temporary password for all migrated users

  // Helper method to convert JavaScript object to Firestore fields format
  private convertToFirestoreFields(obj: any): any {
    const fields: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        fields[key] = { stringValue: value };
      } else if (typeof value === 'boolean') {
        fields[key] = { booleanValue: value };
      } else if (typeof value === 'object' && value !== null) {
        fields[key] = { mapValue: { fields: this.convertToFirestoreFields(value) } };
      }
    }
    return fields;
  }

  // Get all users from PostgreSQL
  async getAllPostgreSQLUsers(): Promise<PostgreSQLUser[]> {
    try {
      const users = await storage.getAllUsers();
      return users.map(user => ({
        id: user.id,
        email: user.email || '',
        first_name: user.firstName || null,
        last_name: user.lastName || null,
        role: user.role,
        is_active: user.isActive !== false,
        created_at: user.createdAt || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching PostgreSQL users:', error);
      return [];
    }
  }

  // Create or update Firebase user password using REST API
  async createFirebaseUser(pgUser: PostgreSQLUser, newPassword?: string): Promise<MigrationResult> {
    try {
      const apiKey = process.env.VITE_FIREBASE_API_KEY;
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
      
      if (!apiKey || !projectId) {
        throw new Error('Firebase API key or project ID not configured');
      }

      const passwordToUse = newPassword || this.temporaryPassword;

      // Try to create Firebase Auth user first
      const authResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pgUser.email,
          password: passwordToUse,
          returnSecureToken: true
        })
      });

      let firebaseUid: string;
      let isNewUser = true;

      if (!authResponse.ok) {
        const error = await authResponse.json();
        
        // If user already exists, update their password instead
        if (error.error?.message === 'EMAIL_EXISTS') {
          console.log(`Firebase user ${pgUser.email} already exists, updating password...`);
          
          // First get the user's UID
          const lookupResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: [pgUser.email]
            })
          });

          if (!lookupResponse.ok) {
            throw new Error('Failed to lookup existing user');
          }

          const lookupData = await lookupResponse.json();
          if (!lookupData.users || lookupData.users.length === 0) {
            throw new Error('User not found in Firebase');
          }

          firebaseUid = lookupData.users[0].localId;
          isNewUser = false;

          // Update the user's password
          const updateResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              localId: firebaseUid,
              password: passwordToUse,
              returnSecureToken: true
            })
          });

          if (!updateResponse.ok) {
            const updateError = await updateResponse.json();
            throw new Error(updateError.error?.message || 'Failed to update Firebase user password');
          }

          console.log(`Successfully updated password for Firebase user: ${pgUser.email}`);
        } else {
          throw new Error(error.error?.message || 'Failed to create Firebase user');
        }
      } else {
        const authData = await authResponse.json();
        firebaseUid = authData.localId;
      }

      // Create/update user document in Firestore using REST API
      const userData = {
        id: pgUser.id,
        firebaseUid: firebaseUid,
        email: pgUser.email,
        firstName: pgUser.first_name || '',
        lastName: pgUser.last_name || '',
        role: pgUser.role,
        isActive: pgUser.is_active,
        isMigrated: true,
        needsPasswordUpdate: true,
        migratedAt: new Date().toISOString(),
        originalCreatedAt: pgUser.created_at,
        preferences: {
          notifications: true,
          emailAlerts: true,
          theme: 'system'
        }
      };

      const firestoreResponse = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${pgUser.id}?key=${apiKey}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: this.convertToFirestoreFields(userData)
          })
        }
      );

      if (!firestoreResponse.ok) {
        console.warn('Failed to create Firestore document, but Firebase Auth user created successfully');
      }

      return {
        email: pgUser.email,
        status: isNewUser ? 'success' : 'updated',
        firebaseUid: firebaseUid,
        tempPassword: passwordToUse
      };

    } catch (error: any) {
      return {
        email: pgUser.email,
        status: 'error',
        error: error.message
      };
    }
  }

  // Migrate all users from PostgreSQL to Firebase
  async migrateAllUsers(): Promise<{ results: MigrationResult[]; summary: any }> {
    console.log('🚀 Starting Firebase user migration...\n');
    
    const pgUsers = await this.getAllPostgreSQLUsers();
    const results: MigrationResult[] = [];
    
    console.log(`Found ${pgUsers.length} users to migrate:\n`);
    
    for (const user of pgUsers) {
      console.log(`Migrating: ${user.email} (${user.role})`);
      const result = await this.createFirebaseUser(user);
      results.push(result);
      
      if (result.status === 'success') {
        console.log(`✅ Success: ${user.email} -> Firebase UID: ${result.firebaseUid}`);
      } else if (result.status === 'exists') {
        console.log(`ℹ️  Already exists: ${user.email}`);
      } else {
        console.log(`❌ Failed: ${user.email} - ${result.error}`);
      }
    }

    const summary = {
      total: results.length,
      successful: results.filter(r => r.status === 'success').length,
      existing: results.filter(r => r.status === 'exists').length,
      failed: results.filter(r => r.status === 'error').length,
      temporaryPassword: this.temporaryPassword
    };

    console.log('\n📊 Migration Summary:');
    console.log(`Total users: ${summary.total}`);
    console.log(`Successfully migrated: ${summary.successful}`);
    console.log(`Already existed: ${summary.existing}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`\n🔑 Temporary password for all users: ${this.temporaryPassword}`);
    console.log('\n📋 Next Steps:');
    console.log('1. Users can log in with their email and temporary password');
    console.log('2. Prompt users to change their password on first login');
    console.log('3. Update frontend to handle migrated users');

    return { results, summary };
  }

  // Check if a specific user exists in Firebase
  async checkUserExists(email: string): Promise<boolean> {
    try {
      const pgUsers = await this.getAllPostgreSQLUsers();
      const user = pgUsers.find(u => u.email === email);
      
      if (!user) return false;
      
      const apiKey = process.env.VITE_FIREBASE_API_KEY;
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
      
      if (!apiKey || !projectId) return false;

      // Check if user document exists in Firestore using REST API
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${user.id}?key=${apiKey}`,
        { method: 'GET' }
      );
      
      return response.ok;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  // Get migration status for all users
  async getMigrationStatus(): Promise<any> {
    const pgUsers = await this.getAllPostgreSQLUsers();
    const status = [];

    for (const user of pgUsers) {
      const exists = await this.checkUserExists(user.email);
      status.push({
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        migratedToFirebase: exists
      });
    }

    return {
      totalUsers: pgUsers.length,
      migrated: status.filter(s => s.migratedToFirebase).length,
      pending: status.filter(s => !s.migratedToFirebase).length,
      users: status
    };
  }
}

export const userMigration = new FirebaseUserMigration();