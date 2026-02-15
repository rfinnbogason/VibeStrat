import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Initialize Firebase Admin
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixStrataAccess() {
  console.log('🔍 Checking Firestore data...\n');

  // 1. Check all users
  const usersSnapshot = await db.collection('users').get();
  console.log(`👥 Found ${usersSnapshot.size} users:`);
  usersSnapshot.forEach(doc => {
    const user = doc.data();
    console.log(`  - ${user.email} (ID: ${doc.id})`);
  });
  console.log('');

  // 2. Check all stratas
  const stratasSnapshot = await db.collection('strata').get();
  console.log(`🏢 Found ${stratasSnapshot.size} stratas:`);
  stratasSnapshot.forEach(doc => {
    const strata = doc.data();
    console.log(`  - ${strata.name} (ID: ${doc.id})`);
  });
  console.log('');

  // 3. Check all userStrataAccess
  const accessSnapshot = await db.collection('userStrataAccess').get();
  console.log(`🔗 Found ${accessSnapshot.size} userStrataAccess records:`);
  accessSnapshot.forEach(doc => {
    const access = doc.data();
    console.log(`  - User ${access.userId} → Strata ${access.strataId} (${access.role})`);
  });
  console.log('');

  // 4. Find master admin user
  const masterAdminEmail = 'jrfinnbogason@gmail.com';
  const masterAdminQuery = await db.collection('users')
    .where('email', '==', masterAdminEmail)
    .limit(1)
    .get();

  if (masterAdminQuery.empty) {
    console.log('❌ Master admin user not found!');
    return;
  }

  const masterAdminDoc = masterAdminQuery.docs[0];
  const masterAdminId = masterAdminDoc.id;
  console.log(`✅ Master admin found: ${masterAdminEmail} (ID: ${masterAdminId})\n`);

  // 5. Check if master admin has access to any stratas
  const adminAccessQuery = await db.collection('userStrataAccess')
    .where('userId', '==', masterAdminId)
    .get();

  console.log(`🔍 Master admin has access to ${adminAccessQuery.size} stratas\n`);

  // 6. If there are stratas but admin has no access, create access
  if (stratasSnapshot.size > 0 && adminAccessQuery.empty) {
    console.log('🔧 Creating userStrataAccess for master admin...\n');

    for (const strataDoc of stratasSnapshot.docs) {
      const strataId = strataDoc.id;
      const strataData = strataDoc.data();

      const accessId = `${masterAdminId}_${strataId}`;
      await db.collection('userStrataAccess').doc(accessId).set({
        userId: masterAdminId,
        strataId: strataId,
        role: 'chairperson',
        canPostAnnouncements: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`  ✅ Created access: ${masterAdminEmail} → ${strataData.name}`);
    }

    console.log('\n✨ All userStrataAccess records created!');
  } else if (stratasSnapshot.size === 0) {
    console.log('⚠️  No stratas exist in the database. User needs to create one through signup.');
  } else {
    console.log('✅ Master admin already has access to all stratas.');
  }

  process.exit(0);
}

fixStrataAccess().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
