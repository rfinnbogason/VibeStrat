import type { IStorage } from './storage-interface';
import { PostgresStorage } from './postgres-storage';

const storage: IStorage = new PostgresStorage();

export { storage };
