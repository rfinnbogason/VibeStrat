import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkUserAssignments() {
  console.log('🔍 Checking user strata assignments...\n');

  // Get all users
  const usersSnapshot = await db.collection('users').get();
  console.log(`👥 Found ${usersSnapshot.size} users:\n`);

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    console.log(`📧 User: ${userData.email} (UID: ${userDoc.id})`);
    console.log(`   Name: ${userData.firstName} ${userData.lastName}`);
    console.log(`   Role: ${userData.role}`);

    // Find their strata access records
    const accessSnapshot = await db.collection('userStrataAccess')
      .where('userId', '==', userDoc.id)
      .get();

    if (accessSnapshot.empty) {
      console.log(`   ❌ No strata access records found\n`);
    } else {
      console.log(`   ✅ Strata Access (${accessSnapshot.size} records):`);

      for (const accessDoc of accessSnapshot.docs) {
        const accessData = accessDoc.data();

        // Get strata name
        const strataDoc = await db.collection('strata').doc(accessData.strataId).get();
        const strataName = strataDoc.exists ? strataDoc.data()?.name : 'Unknown';

        console.log(`      - ${strataName} (${accessData.strataId})`);
        console.log(`        Role: ${accessData.role}`);
        console.log(`        Can Post Announcements: ${accessData.canPostAnnouncements}`);
        console.log(`        Access ID: ${accessDoc.id}`);
      }
      console.log('');
    }
  }

  // Get all stratas
  console.log('\n🏢 All Stratas:');
  const stratasSnapshot = await db.collection('strata').get();

  for (const strataDoc of stratasSnapshot.docs) {
    const strataData = strataDoc.data();
    console.log(`   - ${strataData.name} (${strataDoc.id})`);
  }

  console.log('\n✨ Done!\n');
  process.exit(0);
}

checkUserAssignments().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
