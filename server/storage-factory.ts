import type { IStorage } from './storage-interface';

let storage: IStorage;

if (process.env.USE_POSTGRES_STORAGE === 'true') {
  const { PostgresStorage } = await import('./postgres-storage');
  storage = new PostgresStorage();
  console.log('Using PostgreSQL storage');
} else {
  const { FirebaseStorage } = await import('./firebase-storage');
  storage = new FirebaseStorage();
  console.log('Using Firebase storage');
}

export { storage };
