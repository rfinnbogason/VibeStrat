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

async function checkAuthUsers() {
  console.log('🔍 Checking Firebase Authentication users...\n');

  // List all Firebase Auth users
  const listUsersResult = await admin.auth().listUsers(1000);

  console.log(`👥 Found ${listUsersResult.users.length} Firebase Auth users:\n`);

  for (const userRecord of listUsersResult.users) {
    console.log(`Email: ${userRecord.email}`);
    console.log(`UID: ${userRecord.uid}`);
    console.log(`Created: ${userRecord.metadata.creationTime}`);

    // Check if user exists in Firestore
    const firestoreUser = await db.collection('users').doc(userRecord.uid).get();

    if (firestoreUser.exists) {
      console.log(`✅ Firestore user document exists`);
    } else {
      console.log(`❌ Missing Firestore user document!`);
      console.log(`   Creating user document...`);

      await db.collection('users').doc(userRecord.uid).set({
        id: userRecord.uid,
        email: userRecord.email,
        firstName: userRecord.displayName?.split(' ')[0] || '',
        lastName: userRecord.displayName?.split(' ')[1] || '',
        role: 'chairperson',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`   ✅ Created Firestore user document`);

      // Grant access to all stratas
      const stratas = await db.collection('strata').get();
      console.log(`   Granting access to ${stratas.size} stratas...`);

      for (const strataDoc of stratas.docs) {
        const accessId = `${userRecord.uid}_${strataDoc.id}`;
        await db.collection('userStrataAccess').doc(accessId).set({
          userId: userRecord.uid,
          strataId: strataDoc.id,
          role: 'chairperson',
          canPostAnnouncements: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`   ✅ Granted access to ${strataDoc.data().name}`);
      }
    }

    console.log('');
  }

  console.log('✨ All done!\n');
  process.exit(0);
}

checkAuthUsers().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
