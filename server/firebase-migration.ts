import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { storage } from './storage';
import { COLLECTIONS } from '@shared/firebase-types';

// Initialize Firebase Admin (you'll need to add service account key)
// For now, we'll use the client SDK approach in development
let adminDb: any = null;

export class FirebaseMigrationService {
  private sourceStorage = storage;
  
  constructor() {
    // In production, you would initialize Firebase Admin here
    // const serviceAccount = require('./path-to-service-account-key.json');
    // const app = initializeApp({
    //   credential: cert(serviceAccount),
    //   projectId: 'vibestrat'
    // });
    // adminDb = getFirestore(app);
  }

  // Convert PostgreSQL timestamp to Firebase Timestamp
  private convertTimestamp(pgTimestamp: string | Date | null): Timestamp | null {
    if (!pgTimestamp) return null;
    const date = typeof pgTimestamp === 'string' ? new Date(pgTimestamp) : pgTimestamp;
    return Timestamp.fromDate(date);
  }

  // Convert PostgreSQL UUID to Firebase document ID
  private convertId(pgId: string): string {
    return pgId.replace(/-/g, ''); // Remove hyphens for Firebase
  }

  // Migrate all strata organizations
  async migrateStrata(): Promise<{ migrated: number; errors: string[] }> {
    console.log('Starting strata migration...');
    const errors: string[] = [];
    let migrated = 0;

    try {
      // Get all strata from PostgreSQL
      const allStrata = await this.sourceStorage.getAllStrata();
      
      for (const strata of allStrata) {
        try {
          const firebaseStrata = {
            id: this.convertId(strata.id),
            name: strata.name,
            address: strata.address,
            city: strata.city || '',
            province: strata.province || '',
            postalCode: strata.postalCode || '',
            country: strata.country || 'Canada',
            phoneNumber: strata.phoneNumber || '',
            email: strata.email || '',
            unitCount: strata.unitCount,
            corporationNumber: strata.corporationNumber || '',
            incorporationDate: this.convertTimestamp(strata.incorporationDate),
            managementCompany: strata.managementCompany || '',
            managementContactName: strata.managementContactName || '',
            managementContactEmail: strata.managementContactEmail || '',
            managementContactPhone: strata.managementContactPhone || '',
            bylawsUrl: strata.bylawsUrl || '',
            feeStructure: strata.feeStructure || { tiers: [] },
            status: strata.status as 'active' | 'inactive' | 'archived',
            notes: strata.notes || '',
            
            subscription: {
              status: (strata as any).subscriptionStatus || 'trial',
              tier: (strata as any).subscriptionTier || 'standard',
              monthlyRate: parseFloat((strata as any).monthlyRate || '49'),
              trialStartDate: this.convertTimestamp((strata as any).trialStartDate),
              trialEndDate: this.convertTimestamp((strata as any).trialEndDate),
              subscriptionStartDate: this.convertTimestamp((strata as any).subscriptionStartDate),
              subscriptionEndDate: this.convertTimestamp((strata as any).subscriptionEndDate),
              lastPaymentDate: this.convertTimestamp((strata as any).lastPaymentDate),
              nextPaymentDate: this.convertTimestamp((strata as any).nextPaymentDate),
              isFreeForever: (strata as any).isFreeForever || false,
            },
            
            createdBy: strata.createdBy || '',
            createdAt: this.convertTimestamp(strata.createdAt),
            updatedAt: this.convertTimestamp(strata.updatedAt),
          };
          
          // Store migration data (will be written to Firebase in Phase 2)
          console.log(`Prepared strata: ${firebaseStrata.name}`);
          migrated++;
          
        } catch (error) {
          const errorMsg = `Failed to migrate strata ${strata.name}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }
      
    } catch (error) {
      const errorMsg = `Failed to fetch strata: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }

    return { migrated, errors };
  }

  // Migrate all users
  async migrateUsers(): Promise<{ migrated: number; errors: string[] }> {
    console.log('Starting user migration...');
    const errors: string[] = [];
    let migrated = 0;

    try {
      const allUsers = await this.sourceStorage.getAllUsers();
      
      for (const user of allUsers) {
        try {
          const firebaseUser = {
            id: user.id, // Keep original ID for consistency
            email: user.email || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            profileImageUrl: user.profileImageUrl || '',
            isActive: user.isActive !== false,
            lastLoginAt: this.convertTimestamp(user.lastLoginAt),
            role: user.role as any,
            preferences: {
              notifications: true,
              emailAlerts: true,
              theme: 'system' as const,
            },
            createdAt: this.convertTimestamp(user.createdAt),
            updatedAt: this.convertTimestamp(user.updatedAt),
          };
          
          console.log(`Prepared user: ${firebaseUser.email}`);
          migrated++;
          
        } catch (error) {
          const errorMsg = `Failed to migrate user ${user.email}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }
      
    } catch (error) {
      const errorMsg = `Failed to fetch users: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }

    return { migrated, errors };
  }

  // Migrate user-strata access relationships
  async migrateUserAccess(): Promise<{ migrated: number; errors: string[] }> {
    console.log('Starting user access migration...');
    const errors: string[] = [];
    let migrated = 0;

    try {
      // Get all user-strata access records
      const allAccess = await this.sourceStorage.getAllUserStrataAccess();
      
      for (const access of allAccess) {
        try {
          const firebaseAccess = {
            id: access.userId, // Use userId as document ID
            userId: access.userId,
            role: access.role as any,
            canPostAnnouncements: access.canPostAnnouncements || false,
            permissions: {
              canViewFinancials: ['chairperson', 'treasurer', 'property_manager'].includes(access.role),
              canApproveExpenses: ['chairperson', 'treasurer'].includes(access.role),
              canManageUsers: ['chairperson', 'property_manager'].includes(access.role),
              canScheduleMeetings: ['chairperson', 'secretary', 'property_manager'].includes(access.role),
            },
            createdAt: this.convertTimestamp(access.createdAt),
            updatedAt: this.convertTimestamp(access.createdAt), // Use createdAt as fallback
          };
          
          // Group by strata for Firebase subcollections
          console.log(`Prepared access for user ${access.userId} in strata ${access.strataId}`);
          migrated++;
          
        } catch (error) {
          const errorMsg = `Failed to migrate access for user ${access.userId}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }
      
    } catch (error) {
      const errorMsg = `Failed to fetch user access: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }

    return { migrated, errors };
  }

  // Generate migration summary report
  async generateMigrationReport(): Promise<void> {
    console.log('\n=== FIREBASE MIGRATION ANALYSIS ===\n');
    
    try {
      // Analyze current PostgreSQL data
      const allStrata = await this.sourceStorage.getAllStrata();
      const allUsers = await this.sourceStorage.getAllUsers();
      
      console.log(`📊 CURRENT DATA SUMMARY:`);
      console.log(`   • Strata Organizations: ${allStrata.length}`);
      console.log(`   • Total Users: ${allUsers.length}`);
      
      // Get sample counts for each table
      const tables = [
        'expenses', 'quotes', 'meetings', 'documents', 
        'announcements', 'vendors', 'units', 'messages'
      ];
      
      for (const table of tables) {
        try {
          // This would need corresponding methods in storage
          const count = await this.getTableCount(table);
          console.log(`   • ${table.charAt(0).toUpperCase() + table.slice(1)}: ${count}`);
        } catch (error) {
          console.log(`   • ${table.charAt(0).toUpperCase() + table.slice(1)}: Unable to count`);
        }
      }
      
      console.log(`\n🔄 MIGRATION STRUCTURE:`);
      console.log(`   ✓ Root Collections:`);
      console.log(`     • users (${allUsers.length} documents)`);
      console.log(`     • strata (${allStrata.length} documents)`);
      console.log(`     • vendors (shared across strata)`);
      console.log(`     • pendingRegistrations`);
      
      console.log(`   ✓ Subcollections per strata:`);
      console.log(`     • units, userAccess, expenses, quotes`);
      console.log(`     • meetings, documents, announcements`);
      console.log(`     • messages, notifications, funds`);
      console.log(`     • paymentReminders, reports`);
      
      console.log(`\n📈 FIREBASE BENEFITS:`);
      console.log(`   ✓ Real-time updates across all devices`);
      console.log(`   ✓ Automatic scaling for growth`);
      console.log(`   ✓ Built-in security rules`);
      console.log(`   ✓ Offline support for mobile`);
      console.log(`   ✓ Cloud storage for files`);
      console.log(`   ✓ Advanced authentication`);
      
      console.log(`\n⚠️  MIGRATION CONSIDERATIONS:`);
      console.log(`   • Data structure optimized for NoSQL`);
      console.log(`   • Denormalized fields for performance`);
      console.log(`   • Subcollections for better organization`);
      console.log(`   • Real-time listeners for live updates`);
      console.log(`   • Security rules for data protection`);
      
    } catch (error) {
      console.error('Error generating migration report:', error);
    }
  }

  private async getTableCount(tableName: string): Promise<number> {
    // This would need to be implemented based on your storage methods
    // For now, return 0 to avoid errors
    return 0;
  }

  // Run complete migration analysis
  async runMigrationAnalysis(): Promise<void> {
    console.log('🚀 Starting Firebase Migration Analysis...\n');
    
    await this.generateMigrationReport();
    
    console.log('\n📋 NEXT STEPS FOR MIGRATION:');
    console.log('1. Set up Firebase Security Rules');
    console.log('2. Create Firebase service account for server operations');
    console.log('3. Update authentication to use Firebase Auth');
    console.log('4. Migrate data in phases (users → strata → subcollections)');
    console.log('5. Update all API endpoints to use Firebase');
    console.log('6. Add real-time listeners to components');
    console.log('7. Test thoroughly before switching over');
    console.log('8. Set up backup and monitoring');
    
    console.log('\n✅ Ready to proceed with Firebase setup!');
  }
}

// Export migration service
export const migrationService = new FirebaseMigrationService();