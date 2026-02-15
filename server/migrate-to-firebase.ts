#!/usr/bin/env tsx

/**
 * One-time migration script to transfer data from PostgreSQL to Firebase Firestore
 * Run with: npm run migrate
 */

import { firebaseStorage } from './firebase-storage';
import { db as firestoreDb } from './firebase-db';

// Demo/seed data to populate Firestore for development
const seedData = {
  strata: [
    {
      id: 'b13712fb-8c41-4d4e-b5b4-a8f196b09716',
      name: 'The Gables',
      address: '123 Main Street',
      city: 'Vancouver',
      province: 'BC',
      postalCode: 'V6B 1A1',
      country: 'Canada',
      totalUnits: 85,
      contactEmail: 'admin@thegables.ca',
      contactPhone: '604-555-0123',
      description: 'Premium townhome complex with excellent amenities',
      feeStructure: {
        standard: 425.00,
        premium: 485.00,
        penthouse: 625.00
      },
      subscriptionStatus: 'active',
      subscriptionTier: 'standard',
      monthlyRate: 49,
      isFreeForever: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    }
  ],
  users: [
    {
      id: '1751845688364-8fhp96bpk',
      email: 'vibestrat@gmail.com',
      firstName: 'Vibe',
      lastName: 'Strat',
      profileImageUrl: null,
      passwordHash: '$2a$10$example.hash.here',
      isActive: true,
      lastLoginAt: new Date(),
      role: 'chairperson',
      mustChangePassword: false,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    },
    {
      id: 'master-admin',
      email: 'rfinnbogason@gmail.com',
      firstName: 'Master',
      lastName: 'Admin',
      profileImageUrl: null,
      passwordHash: '$2a$10$master.admin.hash',
      isActive: true,
      lastLoginAt: new Date(),
      role: 'master_admin',
      mustChangePassword: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    }
  ],
  userStrataAccess: [
    {
      id: '0f28b495-5c33-4580-b84a-94599ee60436',
      userId: '1751845688364-8fhp96bpk',
      strataId: 'b13712fb-8c41-4d4e-b5b4-a8f196b09716',
      role: 'chairperson',
      canPostAnnouncements: true,
      createdAt: new Date('2024-01-15')
    }
  ],
  units: [
    {
      id: 'unit-001',
      strataId: 'b13712fb-8c41-4d4e-b5b4-a8f196b09716',
      unitNumber: '101',
      ownerName: 'John Smith',
      ownerEmail: 'john.smith@email.com',
      ownerPhone: '604-555-0111',
      feeTier: 'standard',
      sqft: 1200,
      bedrooms: 2,
      bathrooms: 2,
      balcony: true,
      parking: 1,
      storage: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    },
    {
      id: 'unit-002',
      strataId: 'b13712fb-8c41-4d4e-b5b4-a8f196b09716',
      unitNumber: '102',
      ownerName: 'Jane Doe',
      ownerEmail: 'jane.doe@email.com',
      ownerPhone: '604-555-0112',
      feeTier: 'premium',
      sqft: 1400,
      bedrooms: 3,
      bathrooms: 2,
      balcony: true,
      parking: 1,
      storage: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    }
  ],
  expenses: [
    {
      id: 'expense-001',
      strataId: 'b13712fb-8c41-4d4e-b5b4-a8f196b09716',
      description: 'Landscaping maintenance',
      amount: 2500.00,
      category: 'maintenance',
      type: 'one-time',
      vendor: 'Green Thumb Landscaping',
      date: new Date('2024-12-15'),
      status: 'approved',
      createdBy: '1751845688364-8fhp96bpk',
      createdAt: new Date('2024-12-15'),
      updatedAt: new Date()
    },
    {
      id: 'expense-002',
      strataId: 'b13712fb-8c41-4d4e-b5b4-a8f196b09716',
      description: 'Monthly cleaning service',
      amount: 800.00,
      category: 'cleaning',
      type: 'recurring',
      vendor: 'Spotless Cleaners',
      date: new Date('2025-01-01'),
      status: 'approved',
      createdBy: '1751845688364-8fhp96bpk',
      createdAt: new Date('2024-12-20'),
      updatedAt: new Date()
    }
  ],
  funds: [
    {
      id: 'fund-reserve',
      strataId: 'b13712fb-8c41-4d4e-b5b4-a8f196b09716',
      name: 'Reserve Fund',
      type: 'reserve',
      currentBalance: 125000.00,
      targetBalance: 150000.00,
      interestRate: 2.5,
      description: 'Emergency repairs and major maintenance',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    },
    {
      id: 'fund-operating',
      strataId: 'b13712fb-8c41-4d4e-b5b4-a8f196b09716',
      name: 'Operating Fund',
      type: 'operating',
      currentBalance: 45000.00,
      targetBalance: 50000.00,
      interestRate: 1.5,
      description: 'Day-to-day operational expenses',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    }
  ]
};

async function migrateCollectionData(collectionName: string, data: any[]) {
  console.log(`\n🔄 Migrating ${collectionName}...`);
  
  try {
    const batch = firestoreDb.batch();
    let count = 0;
    
    for (const item of data) {
      const docRef = firestoreDb.collection(collectionName).doc(item.id);
      batch.set(docRef, {
        ...item,
        // Convert dates to Firestore timestamps
        createdAt: item.createdAt,
        updatedAt: item.updatedAt || item.createdAt,
        lastLoginAt: item.lastLoginAt || null
      });
      count++;
    }
    
    await batch.commit();
    console.log(`✅ Successfully migrated ${count} documents to ${collectionName}`);
    return count;
  } catch (error) {
    console.error(`❌ Error migrating ${collectionName}:`, error);
    throw error;
  }
}

async function runMigration() {
  try {
    console.log('🚀 Starting Firebase Firestore migration...\n');
    
    let totalDocuments = 0;
    
    // Migrate each collection
    totalDocuments += await migrateCollectionData('strata', seedData.strata);
    totalDocuments += await migrateCollectionData('users', seedData.users);
    totalDocuments += await migrateCollectionData('userStrataAccess', seedData.userStrataAccess);
    totalDocuments += await migrateCollectionData('units', seedData.units);
    totalDocuments += await migrateCollectionData('expenses', seedData.expenses);
    totalDocuments += await migrateCollectionData('funds', seedData.funds);
    
    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Total documents migrated: ${totalDocuments}`);
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const strataSnapshot = await firestoreDb.collection('strata').get();
    const usersSnapshot = await firestoreDb.collection('users').get();
    const accessSnapshot = await firestoreDb.collection('userStrataAccess').get();
    
    console.log(`✅ Strata documents: ${strataSnapshot.size}`);
    console.log(`✅ Users documents: ${usersSnapshot.size}`);
    console.log(`✅ UserStrataAccess documents: ${accessSnapshot.size}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { runMigration, seedData };