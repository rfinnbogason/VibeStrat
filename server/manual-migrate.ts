#!/usr/bin/env tsx
// Manual Firebase migration for critical user data
import { storage as pgStorage } from './storage.js';

console.log('🚀 Starting manual data migration to resolve role issue...\n');

async function migrateVibestratUser() {
  try {
    console.log('👤 Looking up vibestrat@gmail.com in PostgreSQL...');
    
    const pgUser = await pgStorage.getUserByEmail('vibestrat@gmail.com');
    if (!pgUser) {
      console.log('❌ User not found in PostgreSQL');
      return;
    }
    
    console.log('✅ Found user:', {
      id: pgUser.id,
      email: pgUser.email,
      firstName: pgUser.firstName,
      lastName: pgUser.lastName,
      role: pgUser.role
    });
    
    // Get user's strata access
    const strataId = 'b13712fb-8c41-4d4e-b5b4-a8f196b09716';
    const userAccess = await pgStorage.getUserStrataAccess(pgUser.id, strataId);
    
    if (userAccess) {
      console.log('✅ Found user strata access:', {
        role: userAccess.role,
        strataId: userAccess.strataId,
        canPostAnnouncements: userAccess.canPostAnnouncements
      });
    } else {
      console.log('❌ No strata access found');
    }
    
    console.log('\n📊 Migration Summary for vibestrat@gmail.com:');
    console.log(`- User ID: ${pgUser.id}`);
    console.log(`- Email: ${pgUser.email}`);
    console.log(`- Role in strata: ${userAccess?.role || 'No access'}`);
    console.log(`- Database source: PostgreSQL`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateVibestratUser();