#!/usr/bin/env tsx
import { migrationService } from '../migrate-to-firebase.js';

async function runMigration() {
  console.log('🚀 Starting Firebase Migration...\n');
  
  try {
    const result = await migrationService.migrateAll();
    
    console.log('\n📊 Migration Summary:');
    console.log(`Stage: ${result.stage}`);
    console.log(`Completed: ${result.completed}/${result.total}`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (result.stage === 'Completed') {
      console.log('\n✅ Migration completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Update server routes to use Firebase storage');
      console.log('2. Test all functionality');
      console.log('3. Deploy with Firebase configuration');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();