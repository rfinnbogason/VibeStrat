/**
 * Import exported Firestore data into PostgreSQL via Drizzle ORM.
 *
 * Usage: DATABASE_URL=your_neon_url npx tsx server/scripts/import-to-postgres.ts
 *
 * Prerequisites:
 * 1. Run export-firestore.ts first to create migration-data/ JSON files
 * 2. Run `npm run db:push` to create the PostgreSQL schema
 * 3. Set DATABASE_URL environment variable
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@shared/schema';
import fs from 'fs/promises';
import path from 'path';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

const DATA_DIR = path.resolve(process.cwd(), 'migration-data');

async function loadJson(filename: string): Promise<any[]> {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log(`  [skip] ${filename}.json not found`);
      return [];
    }
    throw error;
  }
}

function toDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

async function importUsers() {
  const data = await loadJson('users');
  if (data.length === 0) return;

  for (const item of data) {
    try {
      await db.insert(schema.users).values({
        id: item.id,
        email: item.email || null,
        firstName: item.firstName || null,
        lastName: item.lastName || null,
        profileImageUrl: item.profileImageUrl || null,
        passwordHash: item.passwordHash || null,
        isActive: item.isActive ?? true,
        lastLoginAt: toDate(item.lastLoginAt),
        role: item.role || 'resident',
        mustChangePassword: item.mustChangePassword ?? false,
        createdAt: toDate(item.createdAt) || new Date(),
        updatedAt: toDate(item.updatedAt) || new Date(),
      }).onConflictDoNothing();
    } catch (err: any) {
      console.error(`  [warn] Failed to import user ${item.id}: ${err.message}`);
    }
  }
  console.log(`  [done] users: ${data.length} records`);
}

async function importStrata() {
  const data = await loadJson('strata');
  if (data.length === 0) return;

  for (const item of data) {
    try {
      await db.insert(schema.strata).values({
        id: item.id,
        name: item.name,
        address: item.address || '',
        city: item.city || null,
        province: item.province || null,
        postalCode: item.postalCode || null,
        country: item.country || 'Canada',
        phoneNumber: item.phoneNumber || null,
        email: item.email || null,
        unitCount: item.unitCount || 0,
        corporationNumber: item.corporationNumber || null,
        incorporationDate: toDate(item.incorporationDate),
        managementCompany: item.managementCompany || null,
        managementContactName: item.managementContactName || null,
        managementContactEmail: item.managementContactEmail || null,
        managementContactPhone: item.managementContactPhone || null,
        bylawsUrl: item.bylawsUrl || null,
        feeStructure: item.feeStructure || null,
        status: item.status || 'active',
        notes: item.notes || null,
        subscriptionStatus: item.subscriptionStatus || item.subscription?.status || 'trial',
        subscriptionTier: item.subscriptionTier || item.subscription?.tier || 'standard',
        monthlyRate: item.monthlyRate || item.subscription?.monthlyRate || '79.95',
        trialStartDate: toDate(item.trialStartDate || item.subscription?.trialStartDate),
        trialEndDate: toDate(item.trialEndDate || item.subscription?.trialEndDate),
        subscriptionStartDate: toDate(item.subscriptionStartDate),
        subscriptionEndDate: toDate(item.subscriptionEndDate),
        isFreeForever: item.isFreeForever || item.subscription?.isFreeForever || false,
        createdBy: item.createdBy || null,
        createdAt: toDate(item.createdAt) || new Date(),
        updatedAt: toDate(item.updatedAt) || new Date(),
      }).onConflictDoNothing();
    } catch (err: any) {
      console.error(`  [warn] Failed to import strata ${item.id}: ${err.message}`);
    }
  }
  console.log(`  [done] strata: ${data.length} records`);
}

async function importGeneric(
  collectionName: string,
  table: any,
  mapFn: (item: any) => any
) {
  const data = await loadJson(collectionName);
  if (data.length === 0) return;

  let imported = 0;
  for (const item of data) {
    try {
      const mapped = mapFn(item);
      await db.insert(table).values(mapped).onConflictDoNothing();
      imported++;
    } catch (err: any) {
      console.error(`  [warn] Failed to import ${collectionName} ${item.id}: ${err.message}`);
    }
  }
  console.log(`  [done] ${collectionName}: ${imported}/${data.length} records`);
}

async function main() {
  console.log('Importing data to PostgreSQL...\n');

  // 1. Users (no dependencies)
  await importUsers();

  // 2. Strata (no dependencies)
  await importStrata();

  // 3. User Strata Access (depends on users, strata)
  await importGeneric('userStrataAccess', schema.userStrataAccess, (item) => ({
    id: item.id,
    userId: item.userId,
    strataId: item.strataId,
    role: item.role,
    canPostAnnouncements: item.canPostAnnouncements ?? false,
    createdAt: toDate(item.createdAt) || new Date(),
  }));

  // 4. Units (depends on strata)
  await importGeneric('units', schema.units, (item) => ({
    id: item.id,
    strataId: item.strataId,
    unitNumber: item.unitNumber,
    unitType: item.unitType || null,
    feeTierId: item.feeTierId || null,
    ownerId: item.ownerId || null,
    ownerName: item.ownerName || null,
    ownerEmail: item.ownerEmail || null,
    ownerPhone: item.ownerPhone || null,
    squareFootage: item.squareFootage || null,
    balconySize: item.balconySize || null,
    parkingSpaces: item.parkingSpaces || 0,
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  // 5. Vendors (depends on strata)
  await importGeneric('vendors', schema.vendors, (item) => ({
    id: item.id,
    strataId: item.strataId,
    name: item.name,
    contactInfo: item.contactInfo || null,
    serviceCategories: item.serviceCategories || null,
    rating: item.rating || null,
    businessLicense: item.businessLicense || null,
    insurance: item.insurance || null,
    emergencyContact: item.emergencyContact || null,
    isPreferred: item.isPreferred ?? false,
    notes: item.notes || null,
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  // 6. Everything else (depends on strata, users, vendors)
  await importGeneric('expenses', schema.expenses, (item) => ({
    id: item.id,
    strataId: item.strataId,
    vendorId: item.vendorId || null,
    amount: String(item.amount || '0'),
    description: item.description || '',
    category: item.category || null,
    isRecurring: item.isRecurring ?? false,
    expenseDate: toDate(item.expenseDate) || new Date(),
    recurringFrequency: item.recurringFrequency || null,
    status: item.status || 'pending',
    attachedReceipts: item.attachedReceipts || null,
    submittedBy: item.submittedBy,
    approvedBy: item.approvedBy || null,
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  await importGeneric('quotes', schema.quotes, (item) => ({
    id: item.id,
    strataId: item.strataId,
    vendorId: item.vendorId || null,
    requesterId: item.requesterId,
    projectTitle: item.projectTitle || 'Untitled',
    projectType: item.projectType || 'maintenance',
    description: item.description || '',
    amount: String(item.amount || '0'),
    status: item.status || 'submitted',
    priority: item.priority || 'normal',
    vendorName: item.vendorName || null,
    vendorEmail: item.vendorEmail || null,
    vendorPhone: item.vendorPhone || null,
    notes: item.notes || null,
    attachments: item.attachments || null,
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  await importGeneric('meetings', schema.meetings, (item) => ({
    id: item.id,
    strataId: item.strataId,
    title: item.title,
    description: item.description || null,
    meetingType: item.meetingType || item.type || 'board_meeting',
    meetingDate: toDate(item.meetingDate) || new Date(),
    location: item.location || null,
    chairperson: item.chairperson || null,
    agenda: item.agenda || null,
    scheduledAt: toDate(item.scheduledAt || item.meetingDate) || new Date(),
    audioUrl: item.audioUrl || null,
    minutes: item.minutes || null,
    transcription: item.transcription || null,
    status: item.status || 'scheduled',
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  await importGeneric('documentFolders', schema.documentFolders, (item) => ({
    id: item.id,
    strataId: item.strataId,
    name: item.name,
    description: item.description || null,
    parentFolderId: item.parentFolderId || null,
    path: item.path || `/${item.name}`,
    createdBy: item.createdBy,
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  await importGeneric('documents', schema.documents, (item) => ({
    id: item.id,
    strataId: item.strataId,
    folderId: item.folderId || null,
    title: item.title,
    description: item.description || null,
    type: item.type || 'other',
    fileUrl: item.fileUrl || '',
    fileName: item.fileName || item.title || 'unknown',
    fileSize: item.fileSize || null,
    mimeType: item.mimeType || null,
    tags: item.tags || null,
    uploadedBy: item.uploadedBy,
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  await importGeneric('maintenanceRequests', schema.maintenanceRequests, (item) => ({
    id: item.id,
    strataId: item.strataId,
    residentId: item.residentId,
    unitId: item.unitId || null,
    title: item.title,
    description: item.description || '',
    priority: item.priority || 'medium',
    status: item.status || 'submitted',
    assignedTo: item.assignedTo || null,
    photos: item.photos || null,
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  await importGeneric('maintenanceProjects', schema.maintenanceProjects, (item) => ({
    id: item.id,
    strataId: item.strataId,
    title: item.title,
    description: item.description || null,
    category: item.category || 'general',
    priority: item.priority || 'medium',
    status: item.status || 'planned',
    estimatedCost: String(item.estimatedCost || '0'),
    actualCost: item.actualCost ? String(item.actualCost) : null,
    scheduledDate: toDate(item.scheduledDate),
    completedDate: toDate(item.completedDate),
    contractor: item.contractor || null,
    warranty: item.warranty || null,
    notes: item.notes || null,
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  await importGeneric('announcements', schema.announcements, (item) => ({
    id: item.id,
    strataId: item.strataId,
    title: item.title,
    content: item.content || item.message || '',
    priority: item.priority || 'normal',
    publishedBy: item.publishedBy || item.createdBy,
    published: item.published ?? true,
    isRecurring: item.isRecurring ?? false,
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  await importGeneric('messages', schema.messages, (item) => ({
    id: item.id,
    strataId: item.strataId,
    senderId: item.senderId,
    recipientId: item.recipientId || null,
    subject: item.subject || null,
    content: item.content || item.message || '',
    messageType: item.messageType || 'private',
    isRead: item.isRead ?? false,
    readAt: toDate(item.readAt),
    parentMessageId: item.parentMessageId || null,
    conversationId: item.conversationId || null,
    priority: item.priority || 'normal',
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  await importGeneric('notifications', schema.notifications, (item) => ({
    id: item.id,
    userId: item.userId,
    strataId: item.strataId,
    type: item.type,
    title: item.title,
    message: item.message,
    relatedId: item.relatedId || null,
    isRead: item.isRead ?? false,
    createdAt: toDate(item.createdAt) || new Date(),
  }));

  await importGeneric('dismissedNotifications', schema.dismissedNotifications, (item) => ({
    id: item.id,
    userId: item.userId,
    notificationId: item.notificationId,
    notificationType: item.notificationType,
    dismissedAt: toDate(item.dismissedAt) || new Date(),
  }));

  await importGeneric('funds', schema.funds, (item) => ({
    id: item.id,
    strataId: item.strataId,
    name: item.name,
    type: item.type || 'operating',
    balance: String(item.balance || item.currentBalance || '0'),
    target: item.target ? String(item.target) : null,
    interestRate: item.interestRate ? String(item.interestRate) : null,
    institution: item.institution || null,
    accountNumber: item.accountNumber || null,
    notes: item.notes || null,
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  await importGeneric('fundTransactions', schema.fundTransactions, (item) => ({
    id: item.id,
    fundId: item.fundId,
    type: item.type,
    amount: String(item.amount || '0'),
    description: item.description || null,
    processedBy: item.processedBy,
    transactionDate: toDate(item.transactionDate) || new Date(),
    createdAt: toDate(item.createdAt) || new Date(),
  }));

  await importGeneric('paymentReminders', schema.paymentReminders, (item) => ({
    id: item.id,
    strataId: item.strataId,
    unitId: item.unitId || null,
    title: item.title,
    description: item.description || null,
    reminderType: item.reminderType || 'custom',
    amount: item.amount ? String(item.amount) : null,
    dueDate: toDate(item.dueDate),
    isRecurring: item.isRecurring ?? false,
    recurringPattern: item.recurringPattern || null,
    status: item.status || 'active',
    priority: item.priority || 'normal',
    autoSend: item.autoSend ?? false,
    createdBy: item.createdBy,
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  await importGeneric('vendorContracts', schema.vendorContracts, (item) => ({
    id: item.id,
    vendorId: item.vendorId,
    strataId: item.strataId,
    contractName: item.contractName || 'Untitled Contract',
    description: item.description || null,
    startDate: toDate(item.startDate) || new Date(),
    endDate: toDate(item.endDate),
    costAmount: String(item.costAmount || '0'),
    costFrequency: item.costFrequency || 'monthly',
    status: item.status || 'active',
    createdBy: item.createdBy,
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  await importGeneric('vendorHistory', schema.vendorHistory, (item) => ({
    id: item.id,
    vendorId: item.vendorId,
    strataId: item.strataId,
    eventType: item.eventType || 'note_added',
    title: item.title || 'Untitled',
    description: item.description || null,
    rating: item.rating || null,
    cost: item.cost ? String(item.cost) : null,
    attachments: item.attachments || null,
    recordedBy: item.recordedBy,
    eventDate: toDate(item.eventDate) || new Date(),
    createdAt: toDate(item.createdAt) || new Date(),
  }));

  await importGeneric('pendingRegistrations', schema.pendingStrataRegistrations, (item) => ({
    id: item.id,
    strataName: item.strataName,
    address: item.address,
    city: item.city,
    province: item.province,
    postalCode: item.postalCode,
    unitCount: item.unitCount,
    adminFirstName: item.adminFirstName,
    adminLastName: item.adminLastName,
    adminEmail: item.adminEmail,
    adminPhone: item.adminPhone,
    managementType: item.managementType || 'self_managed',
    description: item.description || '',
    specialRequirements: item.specialRequirements || null,
    status: item.status || 'pending',
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  await importGeneric('residentDirectory', schema.residentDirectory, (item) => ({
    id: item.id,
    strataId: item.strataId,
    userId: item.userId,
    dwellingId: item.dwellingId || null,
    primaryPhone: item.primaryPhone || null,
    alternateEmail: item.alternateEmail || null,
    emergencyContactName: item.emergencyContactName || null,
    emergencyContactPhone: item.emergencyContactPhone || null,
    showInDirectory: item.showInDirectory ?? true,
    showContactInfo: item.showContactInfo ?? true,
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  await importGeneric('reports', schema.reports, (item) => ({
    id: item.id,
    strataId: item.strataId,
    reportType: item.reportType || 'financial',
    title: item.title,
    dateRange: item.dateRange || null,
    filters: item.filters || null,
    content: item.content || null,
    format: item.format || 'pdf',
    status: item.status || 'completed',
    generatedBy: item.generatedBy,
    downloadUrl: item.downloadUrl || null,
    createdAt: toDate(item.createdAt) || new Date(),
    generatedAt: toDate(item.generatedAt || item.createdAt) || new Date(),
  }));

  await importGeneric('feeTiers', schema.feeTiers, (item) => ({
    id: item.id,
    strataId: item.strataId,
    name: item.name,
    description: item.description || null,
    monthlyAmount: String(item.monthlyAmount || '0'),
    annualAmount: item.annualAmount ? String(item.annualAmount) : null,
    unitType: item.unitType || null,
    isDefault: item.isDefault ?? false,
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  await importGeneric('repairRequests', schema.repairRequests, (item) => ({
    id: item.id,
    strataId: item.strataId,
    title: item.title,
    description: item.description || '',
    area: item.area || null,
    location: item.location || null,
    severity: item.severity || 'medium',
    status: item.status || 'suggested',
    estimatedCost: item.estimatedCost ? String(item.estimatedCost) : null,
    actualCost: item.actualCost ? String(item.actualCost) : null,
    photos: item.photos || null,
    submittedBy: item.submittedBy || null,
    assignedTo: item.assignedTo || null,
    statusHistory: item.statusHistory || null,
    scheduledDate: toDate(item.scheduledDate),
    completedDate: toDate(item.completedDate),
    notes: item.notes || null,
    createdAt: toDate(item.createdAt) || new Date(),
    updatedAt: toDate(item.updatedAt) || new Date(),
  }));

  console.log('\nImport complete!');
  await pool.end();
}

main().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
