#!/usr/bin/env tsx
import { migrationService } from '../migrate-to-firebase.js';

function displayMigrationStatus() {
  const progress = migrationService.getProgress();
  
  console.log('📊 Firebase Migration Status\n');
  console.log(`Current Stage: ${progress.stage}`);
  console.log(`Progress: ${progress.completed}/${progress.total}`);
  
  if (progress.total > 0) {
    const percentage = Math.round((progress.completed / progress.total) * 100);
    console.log(`Completion: ${percentage}%`);
  }
  
  if (progress.errors.length > 0) {
    console.log('\n❌ Errors:');
    progress.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log('\n');
}

displayMigrationStatus();