import { auth } from './firebase-db';

async function deleteUserByEmail(email: string) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);

    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.uid}`);

    // Delete the user
    await auth.deleteUser(userRecord.uid);
    console.log(`🗑️  Successfully deleted user: ${email}`);

    process.exit(0);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log(`❌ No user found with email: ${email}`);
    } else {
      console.error(`❌ Error deleting user:`, error);
    }
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: npx tsx server/delete-user.ts <email>');
  process.exit(1);
}

deleteUserByEmail(email);
