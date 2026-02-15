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

async function grantAccess() {
  const masterAdminEmail = 'jrfinnbogason@gmail.com';
  const userId = 'qgYMBa6uMcZC8btVPdzPlVZOAES2';
  const missingStrataId = 'b13712fb-8c41-4d4e-b5b4-a8f196b09716'; // The Gables

  console.log(`🔧 Granting access to The Gables for ${masterAdminEmail}...\n`);

  const accessId = `${userId}_${missingStrataId}`;
  await db.collection('userStrataAccess').doc(accessId).set({
    userId,
    strataId: missingStrataId,
    role: 'chairperson',
    canPostAnnouncements: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log('✅ Access granted!');
  console.log(`  User: ${masterAdminEmail}`);
  console.log(`  Strata: The Gables`);
  console.log(`  Role: chairperson\n`);

  // Clean up bad records
  console.log('🧹 Cleaning up bad userStrataAccess records...\n');

  const badRecords = [
    '1751845688364-8fhp96bpk_b13712fb-8c41-4d4e-b5b4-a8f196b09716',
    'HSKgCvmZlZMp8XY18N5d_b13712fb-8c41-4d4e-b5b4-a8f196b09716',
    'master-admin_b13712fb-8c41-4d4e-b5b4-a8f196b09716'
  ];

  for (const recordId of badRecords) {
    const doc = await db.collection('userStrataAccess').doc(recordId).get();
    if (doc.exists) {
      await doc.ref.delete();
      console.log(`  ❌ Deleted bad record: ${recordId}`);
    }
  }

  console.log('\n✨ All done!\n');
  process.exit(0);
}

grantAccess().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
