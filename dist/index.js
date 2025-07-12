var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/firebase-db.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
function convertTimestamp(timestamp2) {
  if (!timestamp2) return (/* @__PURE__ */ new Date()).toISOString();
  if (timestamp2.toDate) return timestamp2.toDate().toISOString();
  if (timestamp2 instanceof Date) return timestamp2.toISOString();
  return timestamp2;
}
function convertTimestamps(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (obj.toDate && typeof obj.toDate === "function") {
    return obj.toDate().toISOString();
  }
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(convertTimestamps);
  }
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    converted[key] = convertTimestamps(value);
  }
  return converted;
}
function createDocumentId() {
  return db.collection("temp").doc().id;
}
var app, db, auth, collections;
var init_firebase_db = __esm({
  "server/firebase-db.ts"() {
    "use strict";
    if (getApps().length === 0) {
      const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (!serviceAccountJson) {
        throw new Error("GOOGLE_APPLICATION_CREDENTIALS environment variable is required");
      }
      try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        app = initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || "vibestrat",
          storageBucket: `${serviceAccount.project_id || "vibestrat"}.firebasestorage.app`
        });
        console.log("\u2705 Firebase Admin SDK initialized successfully");
      } catch (error) {
        console.error("\u274C Failed to parse Firebase credentials:", error);
        throw new Error("Invalid Firebase credentials format");
      }
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
    auth = getAuth(app);
    db.settings({
      ignoreUndefinedProperties: true
    });
    collections = {
      users: "users",
      strata: "strata",
      userStrataAccess: "userStrataAccess",
      units: "units",
      expenses: "expenses",
      vendors: "vendors",
      quotes: "quotes",
      meetings: "meetings",
      documents: "documents",
      maintenanceRequests: "maintenanceRequests",
      announcements: "announcements",
      messages: "messages",
      notifications: "notifications",
      funds: "funds",
      paymentReminders: "paymentReminders",
      pendingRegistrations: "pendingRegistrations"
    };
  }
});

// server/firebase-storage.ts
import { FieldValue } from "firebase-admin/firestore";
var FirebaseStorage, firebaseStorage;
var init_firebase_storage = __esm({
  "server/firebase-storage.ts"() {
    "use strict";
    init_firebase_db();
    FirebaseStorage = class {
      async getAllStrata() {
        try {
          const snapshot = await db.collection("strata").get();
          return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error("Firebase connection failed:", error.message);
          throw error;
        }
      }
      async getUserStrata(userId2) {
        try {
          const accessSnapshot = await db.collection("userStrataAccess").where("userId", "==", userId2).get();
          const strataIds = accessSnapshot.docs.map((doc) => doc.data().strataId);
          if (strataIds.length === 0) {
            return [];
          }
          const strataPromises = strataIds.map(
            (id) => db.collection("strata").doc(id).get()
          );
          const strataSnapshots = await Promise.all(strataPromises);
          return strataSnapshots.filter((snap) => snap.exists).map((snap) => ({ id: snap.id, ...snap.data() }));
        } catch (error) {
          console.error("Firebase connection failed:", error.message);
          throw error;
        }
      }
      async getStrataExpenses(strataId) {
        try {
          const snapshot = await db.collection("expenses").where("strataId", "==", strataId).orderBy("createdAt", "desc").get();
          return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error("Error getting strata expenses:", error);
          throw error;
        }
      }
      async createExpense(expenseData) {
        try {
          const docRef = await db.collection("expenses").add(expenseData);
          const doc = await docRef.get();
          return { id: doc.id, ...doc.data() };
        } catch (error) {
          console.error("Error creating expense:", error);
          throw error;
        }
      }
      async updateUser(userId2, updates) {
        try {
          await db.collection("users").doc(userId2).update({
            ...updates,
            updatedAt: /* @__PURE__ */ new Date()
          });
        } catch (error) {
          console.error("Error updating user:", error);
          throw error;
        }
      }
      // User operations
      async getUser(id) {
        const doc = await db.collection(collections.users).doc(id).get();
        if (!doc.exists) return void 0;
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          lastLoginAt: data.lastLoginAt ? convertTimestamp(data.lastLoginAt) : null
        };
      }
      async getUserByEmail(email) {
        const query = await db.collection(collections.users).where("email", "==", email).limit(1).get();
        if (query.empty) return void 0;
        const doc = query.docs[0];
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          lastLoginAt: data.lastLoginAt ? convertTimestamp(data.lastLoginAt) : null
        };
      }
      async createUser(userData) {
        const id = createDocumentId();
        const now = FieldValue.serverTimestamp();
        const docData = {
          ...userData,
          createdAt: now,
          updatedAt: now
        };
        await db.collection(collections.users).doc(id).set(docData);
        return {
          ...userData,
          id,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      async updateUser(id, userData) {
        const updateData = {
          ...userData,
          updatedAt: FieldValue.serverTimestamp()
        };
        await db.collection(collections.users).doc(id).update(updateData);
        const updated = await this.getUser(id);
        if (!updated) throw new Error("User not found after update");
        return updated;
      }
      async deleteUser(id) {
        await db.collection(collections.users).doc(id).delete();
      }
      async getAllUsers() {
        const query = await db.collection(collections.users).get();
        return query.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt),
            lastLoginAt: data.lastLoginAt ? convertTimestamp(data.lastLoginAt) : null
          };
        });
      }
      // Strata operations
      async getStrata(id) {
        const doc = await db.collection(collections.strata).doc(id).get();
        if (!doc.exists) return void 0;
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt)
        };
      }
      async getAllStrata() {
        try {
          const query = await db.collection(collections.strata).get();
          return query.docs.map((doc) => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              createdAt: convertTimestamp(data.createdAt),
              updatedAt: convertTimestamp(data.updatedAt)
            };
          });
        } catch (error) {
          console.error("Firebase connection failed:", error.message);
          throw error;
        }
      }
      async createStrata(strataData) {
        const id = createDocumentId();
        const now = FieldValue.serverTimestamp();
        const docData = {
          ...strataData,
          createdAt: now,
          updatedAt: now
        };
        await db.collection(collections.strata).doc(id).set(docData);
        return {
          ...strataData,
          id,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      async updateStrata(id, strataData) {
        const updateData = {
          ...strataData,
          updatedAt: FieldValue.serverTimestamp()
        };
        await db.collection(collections.strata).doc(id).update(updateData);
        const updated = await this.getStrata(id);
        if (!updated) throw new Error("Strata not found after update");
        return updated;
      }
      async deleteStrata(id) {
        const batch = db.batch();
        batch.delete(db.collection(collections.strata).doc(id));
        const userAccess = await db.collection(collections.userStrataAccess).where("strataId", "==", id).get();
        userAccess.docs.forEach((doc) => batch.delete(doc.ref));
        const relatedCollections = [
          collections.units,
          collections.expenses,
          collections.vendors,
          collections.quotes,
          collections.meetings,
          collections.documents,
          collections.maintenanceRequests,
          collections.announcements,
          collections.messages,
          collections.notifications,
          collections.funds,
          collections.paymentReminders
        ];
        for (const collection of relatedCollections) {
          const docs = await db.collection(collection).where("strataId", "==", id).get();
          docs.docs.forEach((doc) => batch.delete(doc.ref));
        }
        await batch.commit();
      }
      // User Strata Access operations
      async getUserStrataAccess(userId2, strataId) {
        try {
          const query = await db.collection(collections.userStrataAccess).where("userId", "==", userId2).where("strataId", "==", strataId).limit(1).get();
          if (query.empty) return void 0;
          const doc = query.docs[0];
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: convertTimestamp(data.createdAt)
          };
        } catch (error) {
          console.error("Firebase connection failed:", error.message);
          throw error;
        }
      }
      async createUserStrataAccess(accessData) {
        const id = createDocumentId();
        const now = FieldValue.serverTimestamp();
        const docData = {
          ...accessData,
          createdAt: now
        };
        await db.collection(collections.userStrataAccess).doc(id).set(docData);
        return {
          ...accessData,
          id,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      async updateUserStrataRole(userId2, strataId, role) {
        const query = await db.collection(collections.userStrataAccess).where("userId", "==", userId2).where("strataId", "==", strataId).limit(1).get();
        if (query.empty) return void 0;
        const doc = query.docs[0];
        await doc.ref.update({ role });
        return await this.getUserStrataAccess(userId2, strataId);
      }
      async getStrataUsers(strataId) {
        const accessQuery = await db.collection(collections.userStrataAccess).where("strataId", "==", strataId).get();
        const users2 = [];
        for (const accessDoc of accessQuery.docs) {
          const accessData = accessDoc.data();
          const user = await this.getUser(accessData.userId);
          if (user) {
            users2.push({
              ...accessData,
              id: accessDoc.id,
              createdAt: convertTimestamp(accessData.createdAt),
              user
            });
          }
        }
        return users2;
      }
      // Set must change password
      async setMustChangePassword(email) {
        const query = await db.collection(collections.users).where("email", "==", email).limit(1).get();
        if (!query.empty) {
          const doc = query.docs[0];
          await doc.ref.update({
            mustChangePassword: true,
            updatedAt: FieldValue.serverTimestamp()
          });
        }
      }
      // Additional helper methods for existing functionality
      async getUsersByStrata(strataId) {
        const accessQuery = await db.collection(collections.userStrataAccess).where("strataId", "==", strataId).get();
        const users2 = [];
        for (const accessDoc of accessQuery.docs) {
          const accessData = accessDoc.data();
          const user = await this.getUser(accessData.userId);
          if (user) {
            users2.push(user);
          }
        }
        return users2;
      }
      async getUserStrata(userId2) {
        const accessQuery = await db.collection(collections.userStrataAccess).where("userId", "==", userId2).get();
        const strata2 = [];
        for (const accessDoc of accessQuery.docs) {
          const accessData = accessDoc.data();
          const strataDoc = await this.getStrata(accessData.strataId);
          if (strataDoc) {
            strata2.push(strataDoc);
          }
        }
        return strata2;
      }
      // Check admin access
      async checkUserStrataAdminAccess(userId2, strataId) {
        const userAccess = await this.getUserStrataAccess(userId2, strataId);
        if (!userAccess) return false;
        const adminRoles = ["chairperson", "property_manager", "treasurer", "secretary"];
        return adminRoles.includes(userAccess.role);
      }
      // Unit operations
      async createUnit(unitData) {
        try {
          const id = createDocumentId();
          const newUnit = {
            ...unitData,
            id,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          };
          await db.collection(collections.units).doc(id).set(newUnit);
          console.log(`\u{1F4CB} Created unit ${unitData.unitNumber} in strata ${unitData.strataId}`);
          return newUnit;
        } catch (error) {
          console.error("\u274C Error creating unit:", error);
          throw error;
        }
      }
      async getStrataUnits(strataId) {
        try {
          console.log(`\u{1F50D} Getting units for strataId: ${strataId}`);
          const allSnapshot = await db.collection(collections.units).limit(1).get();
          console.log(`\u{1F4CA} Total units in collection: ${allSnapshot.size}`);
          const snapshot = await db.collection(collections.units).where("strataId", "==", strataId).get();
          console.log(`\u{1F4CA} Found ${snapshot.docs.length} units for strata ${strataId}`);
          if (snapshot.empty) {
            console.log(`\u{1F4CB} No units found for strata ${strataId}`);
            return [];
          }
          const units2 = snapshot.docs.map((doc) => {
            const data = doc.data();
            console.log(`\u{1F4CB} Unit found:`, { id: doc.id, unitNumber: data.unitNumber, unitType: data.unitType });
            return {
              id: doc.id,
              ...convertTimestamp(data)
            };
          });
          const sortedUnits = units2.sort((a, b) => {
            const aNum = parseInt(a.unitNumber) || 0;
            const bNum = parseInt(b.unitNumber) || 0;
            return aNum - bNum;
          });
          console.log(`\u2705 Returning ${sortedUnits.length} units for strata ${strataId}`);
          return sortedUnits;
        } catch (error) {
          console.error("\u274C Error getting strata units:", error);
          console.error("\u274C Error details:", error.message);
          console.error("\u274C Error code:", error.code);
          if (error.code === 9) {
            console.log("\u{1F4CB} Index error - returning empty array for now");
            return [];
          }
          throw error;
        }
      }
      async updateUnit(unitId, updates) {
        try {
          const updateData = {
            ...updates,
            updatedAt: /* @__PURE__ */ new Date()
          };
          await db.collection(collections.units).doc(unitId).update(updateData);
          const updatedDoc = await db.collection(collections.units).doc(unitId).get();
          if (!updatedDoc.exists) {
            throw new Error("Unit not found");
          }
          return { id: updatedDoc.id, ...convertTimestamp(updatedDoc.data()) };
        } catch (error) {
          console.error("\u274C Error updating unit:", error);
          throw error;
        }
      }
      async deleteUnit(unitId) {
        try {
          console.log(`\u{1F5D1}\uFE0F Deleting unit ${unitId}`);
          const unitDoc = await db.collection(collections.units).doc(unitId).get();
          if (!unitDoc.exists) {
            throw new Error("Unit not found");
          }
          await db.collection(collections.units).doc(unitId).delete();
          console.log(`\u2705 Successfully deleted unit ${unitId}`);
        } catch (error) {
          console.error("\u274C Error deleting unit:", error);
          throw error;
        }
      }
      async deleteUnit(unitId) {
        try {
          await db.collection(collections.units).doc(unitId).delete();
          console.log(`\u{1F5D1}\uFE0F Deleted unit ${unitId}`);
        } catch (error) {
          console.error("\u274C Error deleting unit:", error);
          throw error;
        }
      }
      // Fee Tier operations
      async getStrataFeeTiers(strataId) {
        try {
          const snapshot = await db.collection("feeTiers").where("strataId", "==", strataId).orderBy("monthlyAmount", "asc").get();
          return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamp(doc.data())
          }));
        } catch (error) {
          console.error("\u274C Error getting strata fee tiers:", error);
          return [];
        }
      }
      async createFeeTier(feeTierData) {
        try {
          const id = createDocumentId();
          const newFeeTier = {
            ...feeTierData,
            id,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          };
          await db.collection("feeTiers").doc(id).set(newFeeTier);
          console.log(`\u{1F4B0} Created fee tier ${feeTierData.name} for strata ${feeTierData.strataId}`);
          return newFeeTier;
        } catch (error) {
          console.error("\u274C Error creating fee tier:", error);
          throw error;
        }
      }
      async updateFeeTier(feeTierId, updates) {
        try {
          const updateData = {
            ...updates,
            updatedAt: /* @__PURE__ */ new Date()
          };
          await db.collection("feeTiers").doc(feeTierId).update(updateData);
          const updatedDoc = await db.collection("feeTiers").doc(feeTierId).get();
          if (!updatedDoc.exists) {
            throw new Error("Fee tier not found");
          }
          return { id: updatedDoc.id, ...convertTimestamp(updatedDoc.data()) };
        } catch (error) {
          console.error("\u274C Error updating fee tier:", error);
          throw error;
        }
      }
      async deleteFeeTier(feeTierId) {
        try {
          await db.collection("feeTiers").doc(feeTierId).delete();
          console.log(`\u{1F5D1}\uFE0F Deleted fee tier ${feeTierId}`);
        } catch (error) {
          console.error("\u274C Error deleting fee tier:", error);
          throw error;
        }
      }
      // Document Folder operations
      async getStrataDocumentFolders(strataId, parentFolderId) {
        try {
          let query = db.collection("documentFolders").where("strataId", "==", strataId);
          if (parentFolderId) {
            query = query.where("parentFolderId", "==", parentFolderId);
          } else {
            query = query.where("parentFolderId", "==", null);
          }
          const snapshot = await query.get();
          const folders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamps(doc.data())
          }));
          folders.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
          console.log(`\u{1F4C1} Found ${folders.length} folders for strata ${strataId}${parentFolderId ? ` in parent ${parentFolderId}` : " (root level)"}`);
          return folders;
        } catch (error) {
          console.error("\u274C Error getting document folders:", error);
          return [];
        }
      }
      async createDocumentFolder(folderData) {
        try {
          const id = createDocumentId();
          const newFolder = {
            ...folderData,
            id,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          };
          await db.collection("documentFolders").doc(id).set(newFolder);
          console.log(`\u{1F4C1} Created folder ${folderData.name} for strata ${folderData.strataId}`);
          return newFolder;
        } catch (error) {
          console.error("\u274C Error creating document folder:", error);
          throw error;
        }
      }
      async updateDocumentFolder(folderId, updates) {
        try {
          const updateData = {
            ...updates,
            updatedAt: /* @__PURE__ */ new Date()
          };
          await db.collection("documentFolders").doc(folderId).update(updateData);
          const updatedDoc = await db.collection("documentFolders").doc(folderId).get();
          if (!updatedDoc.exists) {
            throw new Error("Document folder not found");
          }
          return { id: updatedDoc.id, ...convertTimestamp(updatedDoc.data()) };
        } catch (error) {
          console.error("\u274C Error updating document folder:", error);
          throw error;
        }
      }
      async deleteDocumentFolder(folderId) {
        try {
          await db.collection("documentFolders").doc(folderId).delete();
          console.log(`\u{1F5D1}\uFE0F Deleted document folder ${folderId}`);
        } catch (error) {
          console.error("\u274C Error deleting document folder:", error);
          throw error;
        }
      }
      async getDocumentFolder(folderId) {
        try {
          const doc = await db.collection("documentFolders").doc(folderId).get();
          if (!doc.exists) {
            throw new Error("Document folder not found");
          }
          return { id: doc.id, ...convertTimestamp(doc.data()) };
        } catch (error) {
          console.error("\u274C Error getting document folder:", error);
          throw error;
        }
      }
      async searchDocumentFolders(strataId, searchTerm) {
        try {
          const snapshot = await db.collection("documentFolders").where("strataId", "==", strataId).get();
          const searchLower = searchTerm.toLowerCase();
          const results = snapshot.docs.map((doc) => ({ id: doc.id, ...convertTimestamp(doc.data()) })).filter(
            (folder) => folder.name?.toLowerCase().includes(searchLower) || folder.description?.toLowerCase().includes(searchLower)
          );
          return results;
        } catch (error) {
          console.error("\u274C Error searching document folders:", error);
          return [];
        }
      }
      // Document operations
      async getStrataDocuments(strataId) {
        try {
          const snapshot = await db.collection("documents").where("strataId", "==", strataId).get();
          const documents2 = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamp(doc.data())
          }));
          documents2.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          return documents2;
        } catch (error) {
          console.error("\u274C Error getting documents:", error);
          return [];
        }
      }
      async getFolderDocuments(folderId) {
        try {
          const snapshot = await db.collection("documents").where("folderId", "==", folderId).get();
          const documents2 = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamp(doc.data())
          }));
          documents2.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          return documents2;
        } catch (error) {
          console.error("\u274C Error getting folder documents:", error);
          return [];
        }
      }
      async searchDocuments(strataId, searchTerm) {
        try {
          const snapshot = await db.collection("documents").where("strataId", "==", strataId).get();
          const searchLower = searchTerm.toLowerCase();
          const results = snapshot.docs.map((doc) => ({ id: doc.id, ...convertTimestamp(doc.data()) })).filter(
            (doc) => doc.title?.toLowerCase().includes(searchLower) || doc.description?.toLowerCase().includes(searchLower) || doc.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
          );
          return results;
        } catch (error) {
          console.error("\u274C Error searching documents:", error);
          return [];
        }
      }
      async createDocument(documentData) {
        try {
          const id = createDocumentId();
          const newDocument = {
            ...documentData,
            id,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          };
          await db.collection("documents").doc(id).set(newDocument);
          console.log(`\u{1F4C4} Created document ${documentData.title} for strata ${documentData.strataId}`);
          return newDocument;
        } catch (error) {
          console.error("\u274C Error creating document:", error);
          throw error;
        }
      }
      async updateDocument(documentId, updates) {
        try {
          const updateData = {
            ...updates,
            updatedAt: /* @__PURE__ */ new Date()
          };
          await db.collection("documents").doc(documentId).update(updateData);
          const updatedDoc = await db.collection("documents").doc(documentId).get();
          if (!updatedDoc.exists) {
            throw new Error("Document not found");
          }
          return { id: updatedDoc.id, ...convertTimestamp(updatedDoc.data()) };
        } catch (error) {
          console.error("\u274C Error updating document:", error);
          throw error;
        }
      }
      async deleteDocument(documentId) {
        try {
          await db.collection("documents").doc(documentId).delete();
          console.log(`\u{1F5D1}\uFE0F Deleted document ${documentId}`);
        } catch (error) {
          console.error("\u274C Error deleting document:", error);
          throw error;
        }
      }
      // Message operations
      async getStrataMessages(strataId, userId2) {
        try {
          const snapshot = await db.collection("messages").where("strataId", "==", strataId).orderBy("createdAt", "desc").get();
          return snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error("\u274C Error fetching messages:", error);
          return [];
        }
      }
      async getMessagesByStrata(strataId) {
        try {
          console.log("\u{1F50D} Firebase getMessagesByStrata - strataId:", strataId);
          const snapshot = await db.collection("messages").get();
          console.log("\u{1F50D} Firebase getMessagesByStrata - found ALL docs:", snapshot.docs.length);
          const allMessages = snapshot.docs.map((doc) => {
            const data = convertTimestamps({ id: doc.id, ...doc.data() });
            console.log("\u{1F50D} Firebase message data:", JSON.stringify(data, null, 2));
            return data;
          });
          const strataMessages = allMessages.filter((msg) => msg.strataId === strataId);
          console.log("\u{1F50D} Firebase filtered messages for strata:", strataMessages.length);
          return strataMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (error) {
          console.error("\u274C Error fetching messages by strata:", error);
          return [];
        }
      }
      async createMessage(messageData) {
        try {
          console.log("\u{1F50D} Firebase createMessage - Input data:", JSON.stringify(messageData, null, 2));
          const cleanedData = Object.fromEntries(
            Object.entries(messageData).filter(([_, value]) => value !== void 0)
          );
          console.log("\u{1F50D} Firebase createMessage - Cleaned data:", JSON.stringify(cleanedData, null, 2));
          const finalData = {
            ...cleanedData,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
          };
          console.log("\u{1F50D} Firebase createMessage - Final data before save:", JSON.stringify(finalData, null, 2));
          const messageRef = await db.collection("messages").add(finalData);
          const doc = await messageRef.get();
          return convertTimestamps({ id: doc.id, ...doc.data() });
        } catch (error) {
          console.error("\u274C Error creating message:", error);
          throw error;
        }
      }
      async markMessageAsRead(messageId) {
        try {
          await db.collection("messages").doc(messageId).update({
            isRead: true,
            readAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
          });
          const doc = await db.collection("messages").doc(messageId).get();
          if (!doc.exists) {
            throw new Error("Message not found");
          }
          return convertTimestamps({ id: doc.id, ...doc.data() });
        } catch (error) {
          console.error("\u274C Error marking message as read:", error);
          throw error;
        }
      }
      async deleteConversation(conversationId, userId2) {
        try {
          console.log(`\u{1F5D1}\uFE0F Attempting to delete conversation ${conversationId} for user ${userId2}`);
          const snapshot = await db.collection("messages").get();
          const batch = db.batch();
          let deletedCount = 0;
          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            console.log(`\u{1F50D} Checking message ${doc.id}:`, {
              id: doc.id,
              conversationId: data.conversationId,
              parentMessageId: data.parentMessageId,
              senderId: data.senderId,
              recipientId: data.recipientId,
              subject: data.subject
            });
            const isPartOfConversation = doc.id === conversationId || data.conversationId === conversationId || data.parentMessageId === conversationId;
            const userIsInvolved = data.senderId === userId2 || data.recipientId === userId2;
            if (isPartOfConversation && userIsInvolved) {
              console.log(`\u{1F5D1}\uFE0F Marking message ${doc.id} for deletion`);
              batch.delete(doc.ref);
              deletedCount++;
            }
          });
          if (deletedCount > 0) {
            await batch.commit();
            console.log(`\u{1F5D1}\uFE0F Successfully deleted ${deletedCount} messages from conversation ${conversationId} for user ${userId2}`);
          } else {
            console.log(`\u2139\uFE0F No messages found to delete for conversation ${conversationId} and user ${userId2}`);
          }
        } catch (error) {
          console.error("\u274C Error deleting conversation:", error);
          throw error;
        }
      }
      async markMessageAsRead(messageId, userId2) {
        try {
          console.log(`\u{1F4D6} Marking message ${messageId} as read for user ${userId2}`);
          const messageRef = db.collection("messages").doc(messageId);
          const messageDoc = await messageRef.get();
          if (!messageDoc.exists) {
            throw new Error(`Message ${messageId} not found`);
          }
          const messageData = messageDoc.data();
          if (messageData.recipientId !== userId2) {
            throw new Error(`User ${userId2} is not authorized to mark this message as read`);
          }
          await messageRef.update({
            isRead: true,
            readAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          });
          console.log(`\u2705 Message ${messageId} marked as read for user ${userId2}`);
        } catch (error) {
          console.error("\u274C Error marking message as read:", error);
          throw error;
        }
      }
      // Meeting operations
      async getStrataMeetings(strataId) {
        try {
          console.log("\u{1F50D} Fetching meetings for strata:", strataId);
          const snapshot = await db.collection("meetings").where("strataId", "==", strataId).get();
          const meetings2 = snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
          console.log("\u{1F4CA} Found meetings:", meetings2.length);
          console.log("\u{1F3AF} Meetings data:", meetings2);
          return meetings2.sort((a, b) => {
            const dateA = new Date(a.scheduledAt || a.meetingDate || 0);
            const dateB = new Date(b.scheduledAt || b.meetingDate || 0);
            return dateB.getTime() - dateA.getTime();
          });
        } catch (error) {
          console.error("\u274C Error fetching meetings:", error);
          return [];
        }
      }
      async createMeeting(meetingData) {
        try {
          console.log("\u{1F3AF} Creating meeting with data:", meetingData);
          const meetingRef = await db.collection("meetings").add({
            ...meetingData,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
          });
          const doc = await meetingRef.get();
          const meeting = convertTimestamps({ id: doc.id, ...doc.data() });
          console.log("\u2705 Meeting created successfully:", meeting.id);
          return meeting;
        } catch (error) {
          console.error("\u274C Error creating meeting:", error);
          throw error;
        }
      }
      async getMeeting(meetingId) {
        try {
          const doc = await db.collection("meetings").doc(meetingId).get();
          if (!doc.exists) {
            return void 0;
          }
          return convertTimestamps({ id: doc.id, ...doc.data() });
        } catch (error) {
          console.error("\u274C Error fetching meeting:", error);
          return void 0;
        }
      }
      async updateMeeting(meetingId, updates) {
        try {
          const updateData = {
            ...updates,
            updatedAt: FieldValue.serverTimestamp()
          };
          await db.collection("meetings").doc(meetingId).update(updateData);
          const updatedDoc = await db.collection("meetings").doc(meetingId).get();
          if (!updatedDoc.exists) {
            throw new Error("Meeting not found");
          }
          return convertTimestamps({ id: updatedDoc.id, ...updatedDoc.data() });
        } catch (error) {
          console.error("\u274C Error updating meeting:", error);
          throw error;
        }
      }
      async deleteMeeting(meetingId) {
        try {
          console.log("\u{1F5D1}\uFE0F Firebase: Deleting meeting document:", meetingId);
          await db.collection("meetings").doc(meetingId).delete();
          console.log("\u2705 Firebase: Meeting document deleted successfully");
        } catch (error) {
          console.error("\u274C Error deleting meeting from Firebase:", error);
          throw error;
        }
      }
      // Notification operations
      async getDismissedNotifications(strataId, userId2) {
        try {
          const snapshot = await db.collection("notifications").where("strataId", "==", strataId).where("userId", "==", userId2).where("dismissed", "==", true).get();
          return snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error("\u274C Error fetching dismissed notifications:", error);
          return [];
        }
      }
      async createNotification(notificationData) {
        try {
          const notificationRef = await db.collection("notifications").add({
            ...notificationData,
            dismissed: false,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
          });
          const doc = await notificationRef.get();
          return convertTimestamps({ id: doc.id, ...doc.data() });
        } catch (error) {
          console.error("\u274C Error creating notification:", error);
          throw error;
        }
      }
      async getUserNotifications(userId2, strataId) {
        try {
          const snapshot = await db.collection("notifications").where("userId", "==", userId2).get();
          let notifications2 = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamp(doc.data())
          }));
          if (strataId) {
            notifications2 = notifications2.filter(
              (notification) => notification.strataId === strataId
            );
          }
          notifications2.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
          console.log(`\u2705 Fetched ${notifications2.length} notifications for user ${userId2}${strataId ? ` in strata ${strataId}` : ""}`);
          return notifications2.slice(0, 20);
        } catch (error) {
          console.error("\u274C Error fetching user notifications:", error);
          throw error;
        }
      }
      async markNotificationAsRead(notificationId) {
        try {
          await db.collection("notifications").doc(notificationId).update({
            isRead: true,
            readAt: FieldValue.serverTimestamp()
          });
          console.log(`\u2705 Marked notification ${notificationId} as read`);
          return { success: true, message: "Notification marked as read" };
        } catch (error) {
          console.error("\u274C Error marking notification as read:", error);
          throw error;
        }
      }
      // Report operations
      async getStrataReports(strataId) {
        try {
          const snapshot = await db.collection("reports").where("strataId", "==", strataId).get();
          const reports2 = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamp(doc.data())
          }));
          reports2.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          console.log(`\u2705 Fetched ${reports2.length} reports for strata ${strataId}`);
          return reports2;
        } catch (error) {
          console.error("\u274C Error fetching reports:", error);
          return [];
        }
      }
      async createReport(reportData) {
        try {
          const reportRef = await db.collection("reports").add({
            ...reportData,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
          });
          const doc = await reportRef.get();
          const report = convertTimestamps({ id: doc.id, ...doc.data() });
          console.log(`\u{1F4CA} Created report ${reportData.title} for strata ${reportData.strataId}`);
          return report;
        } catch (error) {
          console.error("\u274C Error creating report:", error);
          throw error;
        }
      }
      async getReport(reportId) {
        try {
          const doc = await db.collection("reports").doc(reportId).get();
          if (!doc.exists) {
            return null;
          }
          return convertTimestamps({ id: doc.id, ...doc.data() });
        } catch (error) {
          console.error("\u274C Error fetching report:", error);
          throw error;
        }
      }
      async updateReport(reportId, updates) {
        try {
          const updateData = {
            ...updates,
            updatedAt: FieldValue.serverTimestamp()
          };
          await db.collection("reports").doc(reportId).update(updateData);
          const updatedDoc = await db.collection("reports").doc(reportId).get();
          if (!updatedDoc.exists) {
            throw new Error("Report not found");
          }
          return convertTimestamps({ id: updatedDoc.id, ...updatedDoc.data() });
        } catch (error) {
          console.error("\u274C Error updating report:", error);
          throw error;
        }
      }
      async deleteReport(reportId) {
        try {
          await db.collection("reports").doc(reportId).delete();
          console.log(`\u{1F5D1}\uFE0F Deleted report ${reportId}`);
        } catch (error) {
          console.error("\u274C Error deleting report:", error);
          throw error;
        }
      }
      async generateFinancialReport(strataId, dateRange) {
        try {
          console.log(`\u{1F4CA} Generating financial report for strata ${strataId} from ${dateRange.start} to ${dateRange.end}`);
          const expenseSnapshot = await db.collection("expenses").where("strataId", "==", strataId).get();
          const expenses2 = expenseSnapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() })).filter((expense) => {
            const expenseDate = new Date(expense.createdAt || expense.date || 0);
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            return expenseDate >= startDate && expenseDate <= endDate;
          });
          const fundSnapshot = await db.collection("funds").where("strataId", "==", strataId).get();
          const funds2 = fundSnapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
          const totalExpenses = expenses2.reduce((sum, expense) => sum + parseFloat(expense.amount || "0"), 0);
          const totalFunds = funds2.reduce((sum, fund) => sum + parseFloat(fund.currentBalance || "0"), 0);
          const reportContent = {
            dateRange,
            summary: {
              totalExpenses,
              totalFunds,
              numberOfExpenses: expenses2.length,
              numberOfFunds: funds2.length
            },
            expenses: expenses2.map((expense) => ({
              id: expense.id,
              description: expense.description,
              amount: expense.amount,
              category: expense.category,
              date: expense.createdAt || expense.date,
              vendor: expense.vendor
            })),
            funds: funds2.map((fund) => ({
              id: fund.id,
              name: fund.name,
              type: fund.type,
              currentBalance: fund.currentBalance,
              targetAmount: fund.targetAmount
            }))
          };
          console.log(`\u2705 Generated financial report with ${expenses2.length} expenses and ${funds2.length} funds`);
          return reportContent;
        } catch (error) {
          console.error("\u274C Error generating financial report:", error);
          throw error;
        }
      }
      async generateMeetingMinutesReport(strataId, dateRange) {
        try {
          console.log(`\u{1F4CA} Generating meeting minutes report for strata ${strataId}`);
          const snapshot = await db.collection("meetings").where("strataId", "==", strataId).get();
          let meetings2 = snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
          if (dateRange) {
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            meetings2 = meetings2.filter((meeting) => {
              const meetingDate = new Date(meeting.scheduledAt || meeting.meetingDate || 0);
              return meetingDate >= startDate && meetingDate <= endDate;
            });
          }
          const reportContent = {
            dateRange: dateRange || { start: "All time", end: "All time" },
            summary: {
              totalMeetings: meetings2.length,
              meetingTypes: meetings2.reduce((acc, meeting) => {
                const type = meeting.type || "general_meeting";
                acc[type] = (acc[type] || 0) + 1;
                return acc;
              }, {})
            },
            meetings: meetings2.map((meeting) => ({
              id: meeting.id,
              title: meeting.title,
              type: meeting.type,
              date: meeting.scheduledAt || meeting.meetingDate,
              location: meeting.location,
              agenda: meeting.agenda,
              minutes: meeting.minutes,
              attendees: meeting.invitees || [],
              transcription: meeting.transcription
            }))
          };
          console.log(`\u2705 Generated meeting minutes report with ${meetings2.length} meetings`);
          return reportContent;
        } catch (error) {
          console.error("\u274C Error generating meeting minutes report:", error);
          throw error;
        }
      }
      async generateHomeSalePackage(strataId) {
        try {
          console.log(`\u{1F4CA} Generating home sale package for strata ${strataId}`);
          const expenseSnapshot = await db.collection("expenses").where("strataId", "==", strataId).get();
          const expenses2 = expenseSnapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
          const meetingSnapshot = await db.collection("meetings").where("strataId", "==", strataId).get();
          const meetings2 = meetingSnapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
          const documentSnapshot = await db.collection("documents").where("strataId", "==", strataId).get();
          const documents2 = documentSnapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
          const reportContent = {
            generatedDate: (/* @__PURE__ */ new Date()).toISOString(),
            summary: {
              totalDocuments: documents2.length,
              recentMeetings: meetings2.slice(0, 5),
              recentExpenses: expenses2.slice(0, 10)
            },
            documents: documents2.map((doc) => ({
              id: doc.id,
              title: doc.title,
              type: doc.type,
              category: doc.category,
              uploadDate: doc.createdAt
            })),
            financialSummary: {
              recentExpenses: expenses2.slice(0, 20).map((expense) => ({
                description: expense.description,
                amount: expense.amount,
                date: expense.createdAt || expense.date,
                category: expense.category
              }))
            },
            meetingSummary: {
              recentMeetings: meetings2.slice(0, 10).map((meeting) => ({
                title: meeting.title,
                date: meeting.scheduledAt || meeting.meetingDate,
                type: meeting.type
              }))
            }
          };
          console.log(`\u2705 Generated home sale package with ${documents2.length} documents`);
          return reportContent;
        } catch (error) {
          console.error("\u274C Error generating home sale package:", error);
          throw error;
        }
      }
    };
    firebaseStorage = new FirebaseStorage();
  }
});

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  announcements: () => announcements,
  announcementsRelations: () => announcementsRelations,
  dismissedNotifications: () => dismissedNotifications,
  dismissedNotificationsRelations: () => dismissedNotificationsRelations,
  documentFolders: () => documentFolders,
  documentFoldersRelations: () => documentFoldersRelations,
  documents: () => documents,
  documentsRelations: () => documentsRelations,
  expenses: () => expenses,
  expensesRelations: () => expensesRelations,
  fundTransactions: () => fundTransactions,
  fundTransactionsRelations: () => fundTransactionsRelations,
  funds: () => funds,
  fundsRelations: () => fundsRelations,
  insertAnnouncementSchema: () => insertAnnouncementSchema,
  insertDismissedNotificationSchema: () => insertDismissedNotificationSchema,
  insertDocumentFolderSchema: () => insertDocumentFolderSchema,
  insertDocumentSchema: () => insertDocumentSchema,
  insertExpenseSchema: () => insertExpenseSchema,
  insertFundSchema: () => insertFundSchema,
  insertFundTransactionSchema: () => insertFundTransactionSchema,
  insertMaintenanceProjectSchema: () => insertMaintenanceProjectSchema,
  insertMaintenanceRequestSchema: () => insertMaintenanceRequestSchema,
  insertMeetingInviteeSchema: () => insertMeetingInviteeSchema,
  insertMeetingSchema: () => insertMeetingSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPaymentReminderSchema: () => insertPaymentReminderSchema,
  insertPendingStrataRegistrationSchema: () => insertPendingStrataRegistrationSchema,
  insertQuoteSchema: () => insertQuoteSchema,
  insertReportSchema: () => insertReportSchema,
  insertResidentDirectorySchema: () => insertResidentDirectorySchema,
  insertStrataSchema: () => insertStrataSchema,
  insertUnitSchema: () => insertUnitSchema,
  insertUserStrataAccessSchema: () => insertUserStrataAccessSchema,
  insertVendorContractSchema: () => insertVendorContractSchema,
  insertVendorHistorySchema: () => insertVendorHistorySchema,
  insertVendorSchema: () => insertVendorSchema,
  maintenanceProjects: () => maintenanceProjects,
  maintenanceProjectsRelations: () => maintenanceProjectsRelations,
  maintenanceRequests: () => maintenanceRequests,
  maintenanceRequestsRelations: () => maintenanceRequestsRelations,
  meetingInvitees: () => meetingInvitees,
  meetingInviteesRelations: () => meetingInviteesRelations,
  meetings: () => meetings,
  meetingsRelations: () => meetingsRelations,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  paymentReminders: () => paymentReminders,
  paymentRemindersRelations: () => paymentRemindersRelations,
  pendingStrataRegistrations: () => pendingStrataRegistrations,
  quotes: () => quotes,
  quotesRelations: () => quotesRelations,
  reports: () => reports,
  reportsRelations: () => reportsRelations,
  residentDirectory: () => residentDirectory,
  residentDirectoryRelations: () => residentDirectoryRelations,
  sessions: () => sessions,
  strata: () => strata,
  strataRelations: () => strataRelations,
  units: () => units,
  unitsRelations: () => unitsRelations,
  userStrataAccess: () => userStrataAccess,
  userStrataAccessRelations: () => userStrataAccessRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  vendorContracts: () => vendorContracts,
  vendorContractsRelations: () => vendorContractsRelations,
  vendorHistory: () => vendorHistory,
  vendorHistoryRelations: () => vendorHistoryRelations,
  vendors: () => vendors,
  vendorsRelations: () => vendorsRelations
});
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  decimal,
  boolean,
  uuid
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions, users, strata, units, userStrataAccess, vendors, vendorContracts, vendorHistory, expenses, quotes, meetings, meetingInvitees, documentFolders, documents, maintenanceRequests, maintenanceProjects, announcements, funds, fundTransactions, pendingStrataRegistrations, messages, residentDirectory, notifications, dismissedNotifications, usersRelations, strataRelations, meetingsRelations, meetingInviteesRelations, unitsRelations, userStrataAccessRelations, vendorsRelations, expensesRelations, quotesRelations, maintenanceRequestsRelations, maintenanceProjectsRelations, announcementsRelations, fundsRelations, fundTransactionsRelations, vendorContractsRelations, vendorHistoryRelations, documentFoldersRelations, documentsRelations, messagesRelations, residentDirectoryRelations, notificationsRelations, dismissedNotificationsRelations, paymentReminders, paymentRemindersRelations, reports, reportsRelations, insertStrataSchema, insertUnitSchema, insertVendorSchema, insertExpenseSchema, insertQuoteSchema, insertMeetingSchema, insertMaintenanceRequestSchema, insertMaintenanceProjectSchema, insertAnnouncementSchema, insertUserStrataAccessSchema, insertVendorContractSchema, insertVendorHistorySchema, insertFundSchema, insertFundTransactionSchema, insertPendingStrataRegistrationSchema, insertDocumentFolderSchema, insertDocumentSchema, insertMessageSchema, insertResidentDirectorySchema, insertPaymentReminderSchema, insertReportSchema, insertNotificationSchema, insertDismissedNotificationSchema, insertMeetingInviteeSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
      id: varchar("id").primaryKey().notNull(),
      email: varchar("email").unique(),
      firstName: varchar("first_name"),
      lastName: varchar("last_name"),
      profileImageUrl: varchar("profile_image_url"),
      passwordHash: varchar("password_hash"),
      isActive: boolean("is_active").default(true),
      lastLoginAt: timestamp("last_login_at"),
      role: varchar("role").notNull().default("resident"),
      mustChangePassword: boolean("must_change_password").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    strata = pgTable("strata", {
      id: uuid("id").primaryKey().defaultRandom(),
      name: varchar("name", { length: 255 }).notNull(),
      address: text("address").notNull(),
      city: varchar("city", { length: 100 }),
      province: varchar("province", { length: 50 }),
      postalCode: varchar("postal_code", { length: 20 }),
      country: varchar("country", { length: 50 }).default("Canada"),
      phoneNumber: varchar("phone_number", { length: 20 }),
      email: varchar("email", { length: 255 }),
      unitCount: integer("unit_count").notNull(),
      corporationNumber: varchar("corporation_number", { length: 100 }),
      incorporationDate: timestamp("incorporation_date"),
      managementCompany: varchar("management_company", { length: 255 }),
      managementContactName: varchar("management_contact_name", { length: 255 }),
      managementContactEmail: varchar("management_contact_email", { length: 255 }),
      managementContactPhone: varchar("management_contact_phone", { length: 20 }),
      bylawsUrl: varchar("bylaws_url"),
      feeStructure: jsonb("fee_structure"),
      status: varchar("status", { length: 50 }).notNull().default("active"),
      // active, inactive, archived
      notes: text("notes"),
      // Subscription fields
      subscriptionStatus: varchar("subscription_status", { length: 50 }).notNull().default("trial"),
      // trial, active, cancelled, expired, free
      subscriptionTier: varchar("subscription_tier", { length: 50 }).notNull().default("standard"),
      // standard, premium, free
      monthlyRate: decimal("monthly_rate", { precision: 10, scale: 2 }).default("79.95"),
      trialStartDate: timestamp("trial_start_date"),
      trialEndDate: timestamp("trial_end_date"),
      subscriptionStartDate: timestamp("subscription_start_date"),
      subscriptionEndDate: timestamp("subscription_end_date"),
      lastPaymentDate: timestamp("last_payment_date"),
      nextPaymentDate: timestamp("next_payment_date"),
      isFreeForever: boolean("is_free_forever").default(false),
      createdBy: varchar("created_by"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    units = pgTable("units", {
      id: uuid("id").primaryKey().defaultRandom(),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      unitNumber: varchar("unit_number", { length: 50 }).notNull(),
      unitType: varchar("unit_type", { length: 50 }),
      // Studio, One Bedroom, Two Bedroom, etc.
      feeTierId: varchar("fee_tier_id", { length: 255 }),
      // Reference to fee tier ID
      ownerId: varchar("owner_id").references(() => users.id),
      ownerName: varchar("owner_name", { length: 255 }),
      ownerEmail: varchar("owner_email", { length: 255 }),
      ownerPhone: varchar("owner_phone", { length: 50 }),
      squareFootage: integer("square_footage"),
      balconySize: integer("balcony_size"),
      parkingSpaces: integer("parking_spaces").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    userStrataAccess = pgTable("user_strata_access", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: varchar("user_id").notNull().references(() => users.id),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      role: varchar("role").notNull(),
      // chairperson, treasurer, secretary, council_member, property_manager, resident
      canPostAnnouncements: boolean("can_post_announcements").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    vendors = pgTable("vendors", {
      id: uuid("id").primaryKey().defaultRandom(),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      name: varchar("name", { length: 255 }).notNull(),
      contactInfo: jsonb("contact_info"),
      // {email, phone, address, website}
      serviceCategories: text("service_categories").array(),
      rating: decimal("rating", { precision: 3, scale: 2 }),
      businessLicense: varchar("business_license"),
      insurance: jsonb("insurance"),
      // {provider, policyNumber, expiryDate, coverageAmount}
      emergencyContact: varchar("emergency_contact"),
      isPreferred: boolean("is_preferred").default(false),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    vendorContracts = pgTable("vendor_contracts", {
      id: uuid("id").primaryKey().defaultRandom(),
      vendorId: uuid("vendor_id").notNull().references(() => vendors.id),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      contractName: varchar("contract_name", { length: 255 }).notNull(),
      description: text("description"),
      contractDocument: varchar("contract_document"),
      // file path/URL to uploaded contract
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date"),
      autoRenew: boolean("auto_renew").default(false),
      renewalTerms: text("renewal_terms"),
      costAmount: decimal("cost_amount", { precision: 10, scale: 2 }).notNull(),
      costFrequency: varchar("cost_frequency", { length: 20 }).notNull(),
      // 'monthly', 'quarterly', 'annually', 'one-time'
      paymentTerms: varchar("payment_terms", { length: 100 }),
      serviceScope: text("service_scope"),
      status: varchar("status", { length: 50 }).notNull().default("active"),
      // 'active', 'expired', 'cancelled', 'pending'
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    vendorHistory = pgTable("vendor_history", {
      id: uuid("id").primaryKey().defaultRandom(),
      vendorId: uuid("vendor_id").notNull().references(() => vendors.id),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      eventType: varchar("event_type", { length: 50 }).notNull(),
      // 'service_completed', 'issue_reported', 'contract_signed', 'payment_made', 'note_added'
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      rating: integer("rating"),
      // 1-5 stars for service quality
      cost: decimal("cost", { precision: 10, scale: 2 }),
      attachments: text("attachments").array(),
      // photos, documents related to the event
      recordedBy: varchar("recorded_by").notNull().references(() => users.id),
      eventDate: timestamp("event_date").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    expenses = pgTable("expenses", {
      id: uuid("id").primaryKey().defaultRandom(),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      vendorId: uuid("vendor_id").references(() => vendors.id),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      description: text("description").notNull(),
      category: varchar("category", { length: 100 }),
      isRecurring: boolean("is_recurring").notNull().default(false),
      expenseDate: timestamp("expense_date").defaultNow().notNull(),
      recurringFrequency: varchar("recurring_frequency", { length: 20 }),
      // 'weekly', 'monthly', 'annually'
      status: varchar("status", { length: 50 }).notNull().default("pending"),
      attachedReceipts: text("attached_receipts").array(),
      submittedBy: varchar("submitted_by").notNull().references(() => users.id),
      approvedBy: varchar("approved_by").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    quotes = pgTable("quotes", {
      id: uuid("id").primaryKey().defaultRandom(),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      vendorId: uuid("vendor_id").references(() => vendors.id),
      // Made optional for new vendor quotes
      expenseId: uuid("expense_id").references(() => expenses.id),
      requesterId: varchar("requester_id").notNull().references(() => users.id),
      // Quote details
      projectTitle: varchar("project_title", { length: 255 }).notNull(),
      projectType: varchar("project_type", { length: 100 }).notNull(),
      // maintenance, renovation, emergency, inspection, etc.
      description: text("description").notNull(),
      scope: text("scope"),
      // Detailed scope of work
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      // Vendor information (for new vendors not yet in our vendor database)
      vendorName: varchar("vendor_name", { length: 255 }),
      vendorEmail: varchar("vendor_email", { length: 255 }),
      vendorPhone: varchar("vendor_phone", { length: 50 }),
      vendorAddress: text("vendor_address"),
      vendorWebsite: varchar("vendor_website", { length: 255 }),
      vendorLicense: varchar("vendor_license", { length: 100 }),
      vendorInsurance: boolean("vendor_insurance").default(false),
      // Quote lifecycle
      status: varchar("status", { length: 50 }).notNull().default("submitted"),
      // submitted, under_review, approved, rejected, expired
      priority: varchar("priority", { length: 20 }).notNull().default("normal"),
      // low, normal, high, urgent
      submittedAt: timestamp("submitted_at").defaultNow(),
      reviewedAt: timestamp("reviewed_at"),
      approvedAt: timestamp("approved_at"),
      rejectedAt: timestamp("rejected_at"),
      approvedBy: varchar("approved_by").references(() => users.id),
      rejectedBy: varchar("rejected_by").references(() => users.id),
      rejectionReason: text("rejection_reason"),
      // Quote validity
      validUntil: timestamp("valid_until"),
      startDate: timestamp("start_date"),
      estimatedCompletion: timestamp("estimated_completion"),
      // Additional details
      warranty: varchar("warranty", { length: 255 }),
      paymentTerms: text("payment_terms"),
      notes: text("notes"),
      internalNotes: text("internal_notes"),
      // Private notes for strata management
      // Files and attachments
      attachments: text("attachments").array(),
      contractDocument: varchar("contract_document"),
      // Contract file if approved
      documentFolderId: uuid("document_folder_id").references(() => documentFolders.id),
      // Auto-created project folder
      // Conversion tracking
      convertedToVendor: boolean("converted_to_vendor").default(false),
      createdVendorId: uuid("created_vendor_id").references(() => vendors.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    meetings = pgTable("meetings", {
      id: uuid("id").primaryKey().defaultRandom(),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      meetingType: varchar("meeting_type", { length: 50 }).notNull().default("board_meeting"),
      meetingDate: timestamp("meeting_date").notNull(),
      location: varchar("location", { length: 255 }),
      chairperson: varchar("chairperson", { length: 255 }),
      agenda: text("agenda"),
      scheduledAt: timestamp("scheduled_at").notNull(),
      audioUrl: varchar("audio_url"),
      transcriptUrl: varchar("transcript_url"),
      minutesUrl: varchar("minutes_url"),
      minutes: text("minutes"),
      transcription: text("transcription"),
      reviewerId: varchar("reviewer_id").references(() => users.id),
      status: varchar("status", { length: 50 }).notNull().default("scheduled"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    meetingInvitees = pgTable("meeting_invitees", {
      id: uuid("id").primaryKey().defaultRandom(),
      meetingId: uuid("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
      userId: varchar("user_id").notNull().references(() => users.id),
      invitedBy: varchar("invited_by").notNull().references(() => users.id),
      responseStatus: varchar("response_status", { length: 20 }).notNull().default("pending"),
      // pending, accepted, declined
      respondedAt: timestamp("responded_at"),
      notificationSent: boolean("notification_sent").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    documentFolders = pgTable("document_folders", {
      id: uuid("id").primaryKey().defaultRandom(),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      parentFolderId: uuid("parent_folder_id"),
      path: varchar("path", { length: 500 }).notNull(),
      // e.g., "/Financial/2024/Budgets"
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    documents = pgTable("documents", {
      id: uuid("id").primaryKey().defaultRandom(),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      folderId: uuid("folder_id").references(() => documentFolders.id),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      type: varchar("type", { length: 100 }).notNull(),
      fileUrl: varchar("file_url").notNull(),
      fileName: varchar("file_name", { length: 255 }).notNull(),
      fileSize: integer("file_size"),
      mimeType: varchar("mime_type", { length: 100 }),
      version: varchar("version", { length: 50 }).default("1.0"),
      tags: text("tags").array(),
      eSignatureStatus: varchar("e_signature_status", { length: 50 }),
      uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    maintenanceRequests = pgTable("maintenance_requests", {
      id: uuid("id").primaryKey().defaultRandom(),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      residentId: varchar("resident_id").notNull().references(() => users.id),
      unitId: uuid("unit_id").references(() => units.id),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description").notNull(),
      priority: varchar("priority", { length: 50 }).notNull().default("medium"),
      status: varchar("status", { length: 50 }).notNull().default("submitted"),
      assignedTo: varchar("assigned_to").references(() => users.id),
      photos: text("photos").array(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    maintenanceProjects = pgTable("maintenance_projects", {
      id: uuid("id").primaryKey().defaultRandom(),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      category: varchar("category", { length: 100 }).notNull(),
      priority: varchar("priority", { length: 50 }).notNull().default("medium"),
      status: varchar("status", { length: 50 }).notNull().default("planned"),
      estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }).notNull().default("0.00"),
      actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
      scheduledDate: timestamp("scheduled_date"),
      completedDate: timestamp("completed_date"),
      nextServiceDate: timestamp("next_service_date"),
      contractor: varchar("contractor", { length: 255 }),
      warranty: varchar("warranty", { length: 255 }),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    announcements = pgTable("announcements", {
      id: uuid("id").primaryKey().defaultRandom(),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      title: varchar("title", { length: 255 }).notNull(),
      content: text("content").notNull(),
      priority: varchar("priority", { length: 50 }).notNull().default("normal"),
      publishedBy: varchar("published_by").notNull().references(() => users.id),
      published: boolean("published").notNull().default(false),
      isRecurring: boolean("is_recurring").notNull().default(false),
      recurringPattern: varchar("recurring_pattern", { length: 50 }),
      // daily, weekly, monthly, yearly
      recurringInterval: integer("recurring_interval").default(1),
      // every X days/weeks/months
      recurringEndDate: timestamp("recurring_end_date"),
      parentAnnouncementId: uuid("parent_announcement_id"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    funds = pgTable("funds", {
      id: uuid("id").primaryKey().defaultRandom(),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      name: varchar("name", { length: 255 }).notNull(),
      type: varchar("type", { length: 50 }).notNull(),
      // reserve, operating, special_levy, investment
      balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
      target: decimal("target", { precision: 10, scale: 2 }),
      interestRate: decimal("interest_rate", { precision: 5, scale: 4 }),
      // Annual interest rate as decimal
      compoundingFrequency: varchar("compounding_frequency", { length: 20 }).default("monthly"),
      // monthly, quarterly, annually
      institution: varchar("institution", { length: 255 }),
      accountNumber: varchar("account_number", { length: 100 }),
      maturityDate: timestamp("maturity_date"),
      autoRenewal: boolean("auto_renewal").default(false),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    fundTransactions = pgTable("fund_transactions", {
      id: uuid("id").primaryKey().defaultRandom(),
      fundId: uuid("fund_id").notNull().references(() => funds.id),
      type: varchar("type", { length: 50 }).notNull(),
      // deposit, withdrawal, interest, transfer_in, transfer_out
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      description: varchar("description", { length: 500 }),
      relatedExpenseId: uuid("related_expense_id").references(() => expenses.id),
      processedBy: varchar("processed_by").notNull().references(() => users.id),
      transactionDate: timestamp("transaction_date").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    pendingStrataRegistrations = pgTable("pending_strata_registrations", {
      id: uuid("id").primaryKey().defaultRandom(),
      strataName: varchar("strata_name", { length: 255 }).notNull(),
      address: varchar("address", { length: 500 }).notNull(),
      city: varchar("city", { length: 100 }).notNull(),
      province: varchar("province", { length: 50 }).notNull(),
      postalCode: varchar("postal_code", { length: 20 }).notNull(),
      unitCount: integer("unit_count").notNull(),
      adminFirstName: varchar("admin_first_name", { length: 100 }).notNull(),
      adminLastName: varchar("admin_last_name", { length: 100 }).notNull(),
      adminEmail: varchar("admin_email", { length: 255 }).notNull(),
      adminPhone: varchar("admin_phone", { length: 20 }).notNull(),
      managementType: varchar("management_type", { length: 50 }).notNull(),
      // self_managed, professional_managed
      managementCompany: varchar("management_company", { length: 255 }),
      description: text("description").notNull(),
      specialRequirements: text("special_requirements"),
      status: varchar("status", { length: 50 }).notNull().default("pending"),
      // pending, approved, rejected
      approvedBy: varchar("approved_by").references(() => users.id),
      approvedAt: timestamp("approved_at"),
      rejectionReason: text("rejection_reason"),
      createdStrataId: uuid("created_strata_id").references(() => strata.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    messages = pgTable("messages", {
      id: uuid("id").primaryKey().defaultRandom(),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      senderId: varchar("sender_id").notNull().references(() => users.id),
      recipientId: varchar("recipient_id").references(() => users.id),
      // null for broadcast messages
      subject: varchar("subject", { length: 255 }),
      content: text("content").notNull(),
      messageType: varchar("message_type", { length: 50 }).notNull().default("private"),
      // private, broadcast, announcement
      isRead: boolean("is_read").default(false),
      readAt: timestamp("read_at"),
      parentMessageId: uuid("parent_message_id"),
      // for replies - self-reference handled in relations
      conversationId: uuid("conversation_id"),
      // for grouping messages into conversations
      priority: varchar("priority", { length: 20 }).default("normal"),
      // low, normal, high, urgent
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    residentDirectory = pgTable("resident_directory", {
      id: uuid("id").primaryKey().defaultRandom(),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      userId: varchar("user_id").notNull().references(() => users.id),
      dwellingId: uuid("dwelling_id").references(() => units.id),
      // Contact Information
      primaryPhone: varchar("primary_phone", { length: 20 }),
      secondaryPhone: varchar("secondary_phone", { length: 20 }),
      workPhone: varchar("work_phone", { length: 20 }),
      alternateEmail: varchar("alternate_email", { length: 255 }),
      // Emergency Contact
      emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
      emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
      emergencyContactRelationship: varchar("emergency_contact_relationship", { length: 100 }),
      emergencyContactEmail: varchar("emergency_contact_email", { length: 255 }),
      // Additional Details
      moveInDate: timestamp("move_in_date"),
      occupancyType: varchar("occupancy_type", { length: 50 }).default("owner"),
      // owner, tenant, authorized_occupant
      vehicleInfo: text("vehicle_info"),
      // JSON string for multiple vehicles
      petInfo: text("pet_info"),
      // JSON string for pet details
      specialNotes: text("special_notes"),
      // Accessibility needs, delivery instructions, etc.
      // Privacy Settings
      showInDirectory: boolean("show_in_directory").default(true),
      showContactInfo: boolean("show_contact_info").default(true),
      showEmergencyContact: boolean("show_emergency_contact").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    notifications = pgTable("notifications", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: varchar("user_id").notNull().references(() => users.id),
      strataId: uuid("strata_id").notNull().references(() => strata.id),
      type: varchar("type", { length: 50 }).notNull(),
      // message, announcement, meeting, quote, maintenance
      title: varchar("title", { length: 255 }).notNull(),
      message: text("message").notNull(),
      relatedId: varchar("related_id"),
      // ID of the related entity (message, announcement, etc.)
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    dismissedNotifications = pgTable("dismissed_notifications", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: varchar("user_id").notNull().references(() => users.id),
      notificationId: varchar("notification_id").notNull(),
      // The ID of the notification (e.g., "announcement-123", "meeting-456")
      notificationType: varchar("notification_type", { length: 50 }).notNull(),
      // announcement, meeting, quote
      dismissedAt: timestamp("dismissed_at").defaultNow()
    });
    usersRelations = relations(users, ({ many }) => ({
      strataAccess: many(userStrataAccess),
      expenses: many(expenses),
      quotes: many(quotes),
      maintenanceRequests: many(maintenanceRequests),
      announcements: many(announcements),
      sentMessages: many(messages, { relationName: "MessageSender" }),
      receivedMessages: many(messages, { relationName: "MessageRecipient" }),
      residentDirectory: many(residentDirectory),
      notifications: many(notifications),
      dismissedNotifications: many(dismissedNotifications)
    }));
    strataRelations = relations(strata, ({ many }) => ({
      units: many(units),
      userAccess: many(userStrataAccess),
      expenses: many(expenses),
      quotes: many(quotes),
      meetings: many(meetings),
      documents: many(documents),
      documentFolders: many(documentFolders),
      maintenanceRequests: many(maintenanceRequests),
      announcements: many(announcements),
      funds: many(funds),
      messages: many(messages),
      residentDirectory: many(residentDirectory)
    }));
    meetingsRelations = relations(meetings, ({ one, many }) => ({
      strata: one(strata, {
        fields: [meetings.strataId],
        references: [strata.id]
      }),
      reviewer: one(users, {
        fields: [meetings.reviewerId],
        references: [users.id]
      }),
      invitees: many(meetingInvitees)
    }));
    meetingInviteesRelations = relations(meetingInvitees, ({ one }) => ({
      meeting: one(meetings, {
        fields: [meetingInvitees.meetingId],
        references: [meetings.id]
      }),
      invitee: one(users, {
        fields: [meetingInvitees.userId],
        references: [users.id],
        relationName: "MeetingInvitee"
      }),
      inviter: one(users, {
        fields: [meetingInvitees.invitedBy],
        references: [users.id],
        relationName: "MeetingInviter"
      })
    }));
    unitsRelations = relations(units, ({ one, many }) => ({
      strata: one(strata, {
        fields: [units.strataId],
        references: [strata.id]
      }),
      owner: one(users, {
        fields: [units.ownerId],
        references: [users.id]
      }),
      maintenanceRequests: many(maintenanceRequests)
    }));
    userStrataAccessRelations = relations(userStrataAccess, ({ one }) => ({
      user: one(users, {
        fields: [userStrataAccess.userId],
        references: [users.id]
      }),
      strata: one(strata, {
        fields: [userStrataAccess.strataId],
        references: [strata.id]
      })
    }));
    vendorsRelations = relations(vendors, ({ many }) => ({
      expenses: many(expenses),
      quotes: many(quotes),
      contracts: many(vendorContracts),
      history: many(vendorHistory)
    }));
    expensesRelations = relations(expenses, ({ one, many }) => ({
      strata: one(strata, {
        fields: [expenses.strataId],
        references: [strata.id]
      }),
      vendor: one(vendors, {
        fields: [expenses.vendorId],
        references: [vendors.id]
      }),
      submitter: one(users, {
        fields: [expenses.submittedBy],
        references: [users.id]
      }),
      approver: one(users, {
        fields: [expenses.approvedBy],
        references: [users.id]
      }),
      quotes: many(quotes)
    }));
    quotesRelations = relations(quotes, ({ one }) => ({
      strata: one(strata, {
        fields: [quotes.strataId],
        references: [strata.id]
      }),
      vendor: one(vendors, {
        fields: [quotes.vendorId],
        references: [vendors.id]
      }),
      expense: one(expenses, {
        fields: [quotes.expenseId],
        references: [expenses.id]
      }),
      requester: one(users, {
        fields: [quotes.requesterId],
        references: [users.id]
      })
    }));
    maintenanceRequestsRelations = relations(maintenanceRequests, ({ one }) => ({
      strata: one(strata, {
        fields: [maintenanceRequests.strataId],
        references: [strata.id]
      }),
      resident: one(users, {
        fields: [maintenanceRequests.residentId],
        references: [users.id]
      }),
      unit: one(units, {
        fields: [maintenanceRequests.unitId],
        references: [units.id]
      }),
      assignee: one(users, {
        fields: [maintenanceRequests.assignedTo],
        references: [users.id]
      })
    }));
    maintenanceProjectsRelations = relations(maintenanceProjects, ({ one }) => ({
      strata: one(strata, {
        fields: [maintenanceProjects.strataId],
        references: [strata.id]
      })
    }));
    announcementsRelations = relations(announcements, ({ one }) => ({
      strata: one(strata, {
        fields: [announcements.strataId],
        references: [strata.id]
      }),
      publisher: one(users, {
        fields: [announcements.publishedBy],
        references: [users.id]
      })
    }));
    fundsRelations = relations(funds, ({ one, many }) => ({
      strata: one(strata, {
        fields: [funds.strataId],
        references: [strata.id]
      }),
      transactions: many(fundTransactions)
    }));
    fundTransactionsRelations = relations(fundTransactions, ({ one }) => ({
      fund: one(funds, {
        fields: [fundTransactions.fundId],
        references: [funds.id]
      }),
      processor: one(users, {
        fields: [fundTransactions.processedBy],
        references: [users.id]
      }),
      relatedExpense: one(expenses, {
        fields: [fundTransactions.relatedExpenseId],
        references: [expenses.id]
      })
    }));
    vendorContractsRelations = relations(vendorContracts, ({ one }) => ({
      vendor: one(vendors, {
        fields: [vendorContracts.vendorId],
        references: [vendors.id]
      }),
      strata: one(strata, {
        fields: [vendorContracts.strataId],
        references: [strata.id]
      }),
      creator: one(users, {
        fields: [vendorContracts.createdBy],
        references: [users.id]
      })
    }));
    vendorHistoryRelations = relations(vendorHistory, ({ one }) => ({
      vendor: one(vendors, {
        fields: [vendorHistory.vendorId],
        references: [vendors.id]
      }),
      strata: one(strata, {
        fields: [vendorHistory.strataId],
        references: [strata.id]
      }),
      recorder: one(users, {
        fields: [vendorHistory.recordedBy],
        references: [users.id]
      })
    }));
    documentFoldersRelations = relations(documentFolders, ({ one, many }) => ({
      strata: one(strata, {
        fields: [documentFolders.strataId],
        references: [strata.id]
      }),
      creator: one(users, {
        fields: [documentFolders.createdBy],
        references: [users.id]
      }),
      parentFolder: one(documentFolders, {
        fields: [documentFolders.parentFolderId],
        references: [documentFolders.id],
        relationName: "FolderParent"
      }),
      subFolders: many(documentFolders, {
        relationName: "FolderParent"
      }),
      documents: many(documents)
    }));
    documentsRelations = relations(documents, ({ one }) => ({
      strata: one(strata, {
        fields: [documents.strataId],
        references: [strata.id]
      }),
      folder: one(documentFolders, {
        fields: [documents.folderId],
        references: [documentFolders.id]
      }),
      uploader: one(users, {
        fields: [documents.uploadedBy],
        references: [users.id]
      })
    }));
    messagesRelations = relations(messages, ({ one, many }) => ({
      strata: one(strata, {
        fields: [messages.strataId],
        references: [strata.id]
      }),
      sender: one(users, {
        fields: [messages.senderId],
        references: [users.id],
        relationName: "MessageSender"
      }),
      recipient: one(users, {
        fields: [messages.recipientId],
        references: [users.id],
        relationName: "MessageRecipient"
      }),
      parentMessage: one(messages, {
        fields: [messages.parentMessageId],
        references: [messages.id],
        relationName: "MessageThread"
      }),
      replies: many(messages, {
        relationName: "MessageThread"
      })
    }));
    residentDirectoryRelations = relations(residentDirectory, ({ one }) => ({
      strata: one(strata, {
        fields: [residentDirectory.strataId],
        references: [strata.id]
      }),
      user: one(users, {
        fields: [residentDirectory.userId],
        references: [users.id]
      }),
      dwelling: one(units, {
        fields: [residentDirectory.dwellingId],
        references: [units.id]
      })
    }));
    notificationsRelations = relations(notifications, ({ one }) => ({
      user: one(users, {
        fields: [notifications.userId],
        references: [users.id]
      }),
      strata: one(strata, {
        fields: [notifications.strataId],
        references: [strata.id]
      })
    }));
    dismissedNotificationsRelations = relations(dismissedNotifications, ({ one }) => ({
      user: one(users, {
        fields: [dismissedNotifications.userId],
        references: [users.id]
      })
    }));
    paymentReminders = pgTable("payment_reminders", {
      id: uuid("id").primaryKey().defaultRandom(),
      strataId: uuid("strata_id").notNull(),
      unitId: uuid("unit_id"),
      // Optional - for unit-specific reminders
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      reminderType: varchar("reminder_type").notNull(),
      // 'fee_overdue', 'monthly_fee', 'special_assessment', 'maintenance_fee', 'custom'
      amount: decimal("amount", { precision: 10, scale: 2 }),
      dueDate: timestamp("due_date"),
      isRecurring: boolean("is_recurring").default(false),
      recurringPattern: varchar("recurring_pattern"),
      // 'daily', 'weekly', 'monthly', 'yearly'
      recurringInterval: integer("recurring_interval").default(1),
      // every X days/weeks/months
      // Advanced recurring options (Outlook-style)
      monthlyType: varchar("monthly_type"),
      // 'date' (specific date), 'day' (e.g., first Monday), 'last_day' (last day of month)
      monthlyDate: integer("monthly_date"),
      // Day of month (1-31) when monthlyType is 'date'
      monthlyWeekday: varchar("monthly_weekday"),
      // Day of week (monday, tuesday, etc.) when monthlyType is 'day'
      monthlyWeekPosition: varchar("monthly_week_position"),
      // 'first', 'second', 'third', 'fourth', 'last' when monthlyType is 'day'
      weeklyDays: text("weekly_days"),
      // JSON array of weekdays for weekly patterns
      yearlyMonth: integer("yearly_month"),
      // Month (1-12) for yearly patterns
      recurringEndDate: timestamp("recurring_end_date"),
      nextReminderDate: timestamp("next_reminder_date"),
      lastSentDate: timestamp("last_sent_date"),
      remindersSentCount: integer("reminders_sent_count").default(0),
      status: varchar("status").default("active"),
      // 'active', 'paused', 'completed', 'cancelled'
      priority: varchar("priority").default("normal"),
      // 'low', 'normal', 'high', 'urgent'
      autoSend: boolean("auto_send").default(false),
      reminderTime: varchar("reminder_time").default("09:00"),
      // Time to send reminder (HH:MM format)
      emailTemplate: text("email_template"),
      createdBy: varchar("created_by").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    paymentRemindersRelations = relations(paymentReminders, ({ one }) => ({
      strata: one(strata, {
        fields: [paymentReminders.strataId],
        references: [strata.id]
      }),
      unit: one(units, {
        fields: [paymentReminders.unitId],
        references: [units.id]
      }),
      creator: one(users, {
        fields: [paymentReminders.createdBy],
        references: [users.id]
      })
    }));
    reports = pgTable("reports", {
      id: uuid("id").primaryKey().defaultRandom(),
      strataId: uuid("strata_id").notNull(),
      reportType: varchar("report_type").notNull(),
      // 'financial', 'meeting-minutes', 'communications', 'maintenance', 'home-sale-package'
      title: varchar("title").notNull(),
      dateRange: jsonb("date_range"),
      // { start: string, end: string }
      filters: jsonb("filters"),
      // Additional filters specific to report type
      content: jsonb("content"),
      // Generated report content
      format: varchar("format").default("pdf"),
      // 'pdf', 'excel', 'html'
      status: varchar("status").default("pending"),
      // 'pending', 'generating', 'completed', 'failed'
      generatedBy: varchar("generated_by").notNull(),
      generatedAt: timestamp("generated_at").defaultNow(),
      downloadUrl: varchar("download_url"),
      emailedTo: text("emailed_to").array(),
      // Array of email addresses
      createdAt: timestamp("created_at").defaultNow()
    });
    reportsRelations = relations(reports, ({ one }) => ({
      strata: one(strata, {
        fields: [reports.strataId],
        references: [strata.id]
      }),
      generator: one(users, {
        fields: [reports.generatedBy],
        references: [users.id]
      })
    }));
    insertStrataSchema = createInsertSchema(strata).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertUnitSchema = createInsertSchema(units).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertVendorSchema = createInsertSchema(vendors).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertExpenseSchema = createInsertSchema(expenses).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertQuoteSchema = createInsertSchema(quotes).omit({
      id: true,
      submittedAt: true,
      reviewedAt: true,
      approvedAt: true,
      rejectedAt: true,
      convertedToVendor: true,
      createdVendorId: true,
      documentFolderId: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      validUntil: z.string().optional().transform((val) => val ? new Date(val) : void 0),
      startDate: z.string().optional().transform((val) => val ? new Date(val) : void 0),
      estimatedCompletion: z.string().optional().transform((val) => val ? new Date(val) : void 0)
    });
    insertMeetingSchema = createInsertSchema(meetings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertMaintenanceProjectSchema = createInsertSchema(maintenanceProjects).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertAnnouncementSchema = createInsertSchema(announcements).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertUserStrataAccessSchema = createInsertSchema(userStrataAccess).omit({
      id: true,
      createdAt: true
    });
    insertVendorContractSchema = createInsertSchema(vendorContracts).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertVendorHistorySchema = createInsertSchema(vendorHistory).omit({
      id: true,
      createdAt: true
    });
    insertFundSchema = createInsertSchema(funds).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertFundTransactionSchema = createInsertSchema(fundTransactions).omit({
      id: true,
      createdAt: true
    });
    insertPendingStrataRegistrationSchema = createInsertSchema(pendingStrataRegistrations).omit({
      id: true,
      status: true,
      approvedBy: true,
      approvedAt: true,
      rejectionReason: true,
      createdStrataId: true,
      createdAt: true,
      updatedAt: true
    });
    insertDocumentFolderSchema = createInsertSchema(documentFolders).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertDocumentSchema = createInsertSchema(documents).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertMessageSchema = createInsertSchema(messages).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertResidentDirectorySchema = createInsertSchema(residentDirectory).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPaymentReminderSchema = createInsertSchema(paymentReminders).omit({
      id: true,
      remindersSentCount: true,
      lastSentDate: true,
      nextReminderDate: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      dueDate: z.string().optional().transform((val) => val ? new Date(val) : void 0),
      recurringEndDate: z.string().optional().transform((val) => val ? new Date(val) : void 0),
      weeklyDays: z.array(z.string()).optional()
    });
    insertReportSchema = createInsertSchema(reports).omit({
      id: true,
      createdAt: true,
      generatedAt: true
    });
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      createdAt: true
    });
    insertDismissedNotificationSchema = createInsertSchema(dismissedNotifications).omit({
      id: true,
      dismissedAt: true
    });
    insertMeetingInviteeSchema = createInsertSchema(meetingInvitees).omit({
      id: true,
      createdAt: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db2;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db2 = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { eq, and, desc, count, sql, or, lt, inArray } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      // User operations (required for Replit Auth)
      async getUser(id) {
        const [user] = await db2.select().from(users).where(eq(users.id, id));
        return user;
      }
      async getUserByEmail(email) {
        const [user] = await db2.select().from(users).where(eq(users.email, email));
        return user;
      }
      async createUser(userData) {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const [user] = await db2.insert(users).values({
          id,
          ...userData
        }).returning();
        return user;
      }
      async updateUser(id, userData) {
        const [user] = await db2.update(users).set({
          ...userData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, id)).returning();
        return user;
      }
      async deleteUser(id) {
        await db2.delete(userStrataAccess).where(eq(userStrataAccess.userId, id));
        await db2.delete(users).where(eq(users.id, id));
      }
      async upsertUser(userData) {
        const [user] = await db2.insert(users).values(userData).onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: /* @__PURE__ */ new Date()
          }
        }).returning();
        return user;
      }
      // Admin operations
      async getAllUsers() {
        const allUsers = await db2.select().from(users);
        return allUsers;
      }
      async getAllStrata() {
        const allStrata = await db2.select().from(strata);
        return allStrata;
      }
      // Strata operations
      async getUserStrata(userId2) {
        const result = await db2.select({ strata }).from(strata).innerJoin(userStrataAccess, eq(strata.id, userStrataAccess.strataId)).where(eq(userStrataAccess.userId, userId2));
        return result.map((r) => r.strata);
      }
      async getStrata(id) {
        const [result] = await db2.select().from(strata).where(eq(strata.id, id));
        return result;
      }
      async createStrata(strataData) {
        const [result] = await db2.insert(strata).values(strataData).returning();
        return result;
      }
      async updateStrata(id, strataData) {
        const [result] = await db2.update(strata).set({ ...strataData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(strata.id, id)).returning();
        return result;
      }
      async deleteStrata(id) {
        const strataNotifications = await db2.select({ id: notifications.id }).from(notifications).where(eq(notifications.strataId, id));
        if (strataNotifications.length > 0) {
          const notificationIds = strataNotifications.map((n) => n.id);
          await db2.delete(dismissedNotifications).where(inArray(dismissedNotifications.notificationId, notificationIds));
        }
        await db2.delete(notifications).where(eq(notifications.strataId, id));
        await db2.delete(messages).where(eq(messages.strataId, id));
        await db2.delete(paymentReminders).where(eq(paymentReminders.strataId, id));
        await db2.delete(reports).where(eq(reports.strataId, id));
        await db2.delete(residentDirectory).where(eq(residentDirectory.strataId, id));
        const strataFunds = await db2.select({ id: funds.id }).from(funds).where(eq(funds.strataId, id));
        if (strataFunds.length > 0) {
          const fundIds = strataFunds.map((f) => f.id);
          await db2.delete(fundTransactions).where(inArray(fundTransactions.fundId, fundIds));
        }
        await db2.delete(funds).where(eq(funds.strataId, id));
        await db2.delete(announcements).where(eq(announcements.strataId, id));
        await db2.delete(maintenanceRequests).where(eq(maintenanceRequests.strataId, id));
        await db2.delete(maintenanceProjects).where(eq(maintenanceProjects.strataId, id));
        await db2.delete(documents).where(eq(documents.strataId, id));
        await db2.delete(documentFolders).where(eq(documentFolders.strataId, id));
        await db2.delete(meetings).where(eq(meetings.strataId, id));
        await db2.delete(quotes).where(eq(quotes.strataId, id));
        await db2.delete(expenses).where(eq(expenses.strataId, id));
        await db2.delete(vendorHistory).where(eq(vendorHistory.strataId, id));
        await db2.delete(vendorContracts).where(eq(vendorContracts.strataId, id));
        await db2.delete(units).where(eq(units.strataId, id));
        const usersInStrata = await db2.select({ userId: userStrataAccess.userId }).from(userStrataAccess).where(eq(userStrataAccess.strataId, id));
        await db2.delete(userStrataAccess).where(eq(userStrataAccess.strataId, id));
        for (const user of usersInStrata) {
          const otherAssociations = await db2.select().from(userStrataAccess).where(eq(userStrataAccess.userId, user.userId));
          if (otherAssociations.length === 0) {
            await db2.delete(users).where(eq(users.id, user.userId));
          }
        }
        await db2.delete(strata).where(eq(strata.id, id));
      }
      // Unit operations
      async getStrataUnits(strataId) {
        return await db2.select().from(units).where(eq(units.strataId, strataId));
      }
      async createUnit(unitData) {
        const [result] = await db2.insert(units).values(unitData).returning();
        return result;
      }
      async updateUnit(id, unitData) {
        const [result] = await db2.update(units).set({ ...unitData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(units.id, id)).returning();
        return result;
      }
      // User access management
      async getUserStrataAccess(userId2, strataId) {
        const [result] = await db2.select().from(userStrataAccess).where(and(eq(userStrataAccess.userId, userId2), eq(userStrataAccess.strataId, strataId)));
        return result;
      }
      async getAllUserStrataAccess(userId2) {
        const results = await db2.select().from(userStrataAccess).where(eq(userStrataAccess.userId, userId2));
        return results;
      }
      async createUserStrataAccess(accessData) {
        const [result] = await db2.insert(userStrataAccess).values(accessData).returning();
        return result;
      }
      async getStrataUsers(strataId) {
        const results = await db2.select().from(userStrataAccess).leftJoin(users, eq(userStrataAccess.userId, users.id)).where(eq(userStrataAccess.strataId, strataId)).orderBy(desc(userStrataAccess.createdAt));
        return results.map((result) => ({
          ...result.user_strata_access,
          user: result.users
        }));
      }
      async updateUserStrataAccess(id, accessData) {
        const [result] = await db2.update(userStrataAccess).set(accessData).where(eq(userStrataAccess.id, id)).returning();
        return result;
      }
      async deleteUserStrataAccess(id) {
        await db2.delete(userStrataAccess).where(eq(userStrataAccess.id, id));
      }
      // Vendor operations
      async getAllVendors() {
        return await db2.select().from(vendors).orderBy(desc(vendors.createdAt));
      }
      async getVendorsByStrata(strataId) {
        return await db2.select().from(vendors).where(eq(vendors.strataId, strataId)).orderBy(desc(vendors.createdAt));
      }
      async getVendor(id) {
        const [result] = await db2.select().from(vendors).where(eq(vendors.id, id));
        return result;
      }
      async createVendor(vendorData) {
        const [result] = await db2.insert(vendors).values(vendorData).returning();
        return result;
      }
      async updateVendor(id, vendorData) {
        const [result] = await db2.update(vendors).set({ ...vendorData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(vendors.id, id)).returning();
        return result;
      }
      async deleteVendor(id) {
        await db2.delete(vendors).where(eq(vendors.id, id));
      }
      // Vendor contract operations
      async getVendorContracts(vendorId) {
        return await db2.select().from(vendorContracts).where(eq(vendorContracts.vendorId, vendorId)).orderBy(desc(vendorContracts.createdAt));
      }
      async getStrataVendorContracts(strataId) {
        return await db2.select().from(vendorContracts).where(eq(vendorContracts.strataId, strataId)).orderBy(desc(vendorContracts.createdAt));
      }
      async getVendorContract(id) {
        const [result] = await db2.select().from(vendorContracts).where(eq(vendorContracts.id, id));
        return result;
      }
      async createVendorContract(contractData) {
        const [result] = await db2.insert(vendorContracts).values(contractData).returning();
        return result;
      }
      async updateVendorContract(id, contractData) {
        const [result] = await db2.update(vendorContracts).set({ ...contractData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(vendorContracts.id, id)).returning();
        return result;
      }
      async deleteVendorContract(id) {
        await db2.delete(vendorContracts).where(eq(vendorContracts.id, id));
      }
      // Vendor history operations
      async getVendorHistory(vendorId) {
        return await db2.select().from(vendorHistory).where(eq(vendorHistory.vendorId, vendorId)).orderBy(desc(vendorHistory.eventDate));
      }
      async getStrataVendorHistory(strataId) {
        return await db2.select().from(vendorHistory).where(eq(vendorHistory.strataId, strataId)).orderBy(desc(vendorHistory.eventDate));
      }
      async createVendorHistory(historyData) {
        const [result] = await db2.insert(vendorHistory).values(historyData).returning();
        return result;
      }
      async updateVendorHistory(id, historyData) {
        const [result] = await db2.update(vendorHistory).set(historyData).where(eq(vendorHistory.id, id)).returning();
        return result;
      }
      async deleteVendorHistory(id) {
        await db2.delete(vendorHistory).where(eq(vendorHistory.id, id));
      }
      // Expense operations
      async getStrataExpenses(strataId) {
        return await db2.select().from(expenses).where(eq(expenses.strataId, strataId)).orderBy(desc(expenses.createdAt));
      }
      async getExpense(id) {
        const [result] = await db2.select().from(expenses).where(eq(expenses.id, id));
        return result;
      }
      async createExpense(expenseData) {
        const [result] = await db2.insert(expenses).values(expenseData).returning();
        return result;
      }
      async updateExpense(id, expenseData) {
        const [result] = await db2.update(expenses).set({ ...expenseData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(expenses.id, id)).returning();
        return result;
      }
      async deleteExpense(id) {
        await db2.delete(expenses).where(eq(expenses.id, id));
      }
      async getPendingApprovals(strataId) {
        const pendingQuotes = await db2.select().from(quotes).where(and(eq(quotes.strataId, strataId), eq(quotes.status, "pending"))).orderBy(desc(quotes.createdAt));
        const pendingExpenses = await db2.select().from(expenses).where(and(eq(expenses.strataId, strataId), eq(expenses.status, "pending"))).orderBy(desc(expenses.createdAt));
        return [...pendingQuotes, ...pendingExpenses];
      }
      // Meeting operations
      async getStrataMeetings(strataId) {
        return await db2.select().from(meetings).where(eq(meetings.strataId, strataId)).orderBy(desc(meetings.scheduledAt));
      }
      async getMeeting(id) {
        const [result] = await db2.select().from(meetings).where(eq(meetings.id, id));
        return result;
      }
      async createMeeting(meetingData) {
        const [result] = await db2.insert(meetings).values(meetingData).returning();
        return result;
      }
      async updateMeeting(id, meetingData) {
        const [result] = await db2.update(meetings).set({ ...meetingData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(meetings.id, id)).returning();
        return result;
      }
      // Document folder operations
      async getStrataDocumentFolders(strataId) {
        return await db2.select().from(documentFolders).where(eq(documentFolders.strataId, strataId)).orderBy(documentFolders.path);
      }
      async getRootDocumentFolders(strataId) {
        return await db2.select().from(documentFolders).where(and(
          eq(documentFolders.strataId, strataId),
          sql`${documentFolders.parentFolderId} IS NULL`
        )).orderBy(documentFolders.name);
      }
      async getSubFolders(parentFolderId) {
        return await db2.select().from(documentFolders).where(eq(documentFolders.parentFolderId, parentFolderId)).orderBy(documentFolders.name);
      }
      async getDocumentFolder(id) {
        const [result] = await db2.select().from(documentFolders).where(eq(documentFolders.id, id));
        return result;
      }
      async createDocumentFolder(folderData) {
        const [result] = await db2.insert(documentFolders).values(folderData).returning();
        return result;
      }
      async updateDocumentFolder(id, folderData) {
        const [result] = await db2.update(documentFolders).set({ ...folderData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(documentFolders.id, id)).returning();
        return result;
      }
      async deleteDocumentFolder(id) {
        await db2.delete(documentFolders).where(eq(documentFolders.id, id));
      }
      async searchDocumentFolders(strataId, searchTerm) {
        return await db2.select().from(documentFolders).where(and(
          eq(documentFolders.strataId, strataId),
          sql`${documentFolders.name} ILIKE ${`%${searchTerm}%`}`
        )).orderBy(documentFolders.path);
      }
      async createQuoteProjectFolder(strataId, projectTitle, createdBy) {
        let quotesFolder = await db2.select().from(documentFolders).where(and(
          eq(documentFolders.strataId, strataId),
          eq(documentFolders.name, "Quotes"),
          sql`${documentFolders.parentFolderId} IS NULL`
        ));
        if (quotesFolder.length === 0) {
          const [newQuotesFolder] = await db2.insert(documentFolders).values({
            strataId,
            name: "Quotes",
            description: "Quote documents and related files",
            path: "/Quotes",
            createdBy
          }).returning();
          quotesFolder = [newQuotesFolder];
        }
        const projectFolderName = projectTitle.replace(/[^\w\s-]/g, "").replace(/\s+/g, " ").trim();
        const timestamp2 = (/* @__PURE__ */ new Date()).getFullYear();
        const folderName = `${projectFolderName} (${timestamp2})`;
        const [projectFolder] = await db2.insert(documentFolders).values({
          strataId,
          parentFolderId: quotesFolder[0].id,
          name: folderName,
          description: `Documents for ${projectTitle} quote project`,
          path: `/Quotes/${folderName}`,
          createdBy
        }).returning();
        return projectFolder;
      }
      // Document operations
      async getStrataDocuments(strataId) {
        return await db2.select().from(documents).where(eq(documents.strataId, strataId)).orderBy(desc(documents.createdAt));
      }
      async getFolderDocuments(folderId) {
        return await db2.select().from(documents).where(eq(documents.folderId, folderId)).orderBy(desc(documents.createdAt));
      }
      async getDocument(id) {
        const [result] = await db2.select().from(documents).where(eq(documents.id, id));
        return result;
      }
      async createDocument(documentData) {
        const [result] = await db2.insert(documents).values(documentData).returning();
        return result;
      }
      async updateDocument(id, documentData) {
        const [result] = await db2.update(documents).set({ ...documentData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(documents.id, id)).returning();
        return result;
      }
      async deleteDocument(id) {
        await db2.delete(documents).where(eq(documents.id, id));
      }
      async searchDocuments(strataId, searchTerm) {
        return await db2.select().from(documents).where(and(
          eq(documents.strataId, strataId),
          sql`(${documents.title} ILIKE ${`%${searchTerm}%`} OR ${documents.description} ILIKE ${`%${searchTerm}%`} OR ${documents.fileName} ILIKE ${`%${searchTerm}%`})`
        )).orderBy(desc(documents.createdAt));
      }
      // Maintenance operations
      async getStrataMaintenanceRequests(strataId) {
        return await db2.select().from(maintenanceRequests).where(eq(maintenanceRequests.strataId, strataId)).orderBy(desc(maintenanceRequests.createdAt));
      }
      async getMaintenanceRequest(id) {
        const [result] = await db2.select().from(maintenanceRequests).where(eq(maintenanceRequests.id, id));
        return result;
      }
      async createMaintenanceRequest(requestData) {
        const [result] = await db2.insert(maintenanceRequests).values(requestData).returning();
        return result;
      }
      async updateMaintenanceRequest(id, requestData) {
        const [result] = await db2.update(maintenanceRequests).set({ ...requestData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(maintenanceRequests.id, id)).returning();
        return result;
      }
      // Maintenance Project operations
      async getStrataMaintenanceProjects(strataId) {
        return await db2.select().from(maintenanceProjects).where(eq(maintenanceProjects.strataId, strataId)).orderBy(desc(maintenanceProjects.createdAt));
      }
      async getMaintenanceProject(id) {
        const [result] = await db2.select().from(maintenanceProjects).where(eq(maintenanceProjects.id, id));
        return result;
      }
      async createMaintenanceProject(projectData) {
        const [result] = await db2.insert(maintenanceProjects).values(projectData).returning();
        return result;
      }
      async updateMaintenanceProject(id, projectData) {
        const [result] = await db2.update(maintenanceProjects).set({ ...projectData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(maintenanceProjects.id, id)).returning();
        return result;
      }
      async deleteMaintenanceProject(id) {
        await db2.delete(maintenanceProjects).where(eq(maintenanceProjects.id, id));
      }
      // Communication operations
      async getStrataAnnouncements(strataId) {
        return await db2.select().from(announcements).where(and(eq(announcements.strataId, strataId), eq(announcements.published, true))).orderBy(desc(announcements.createdAt));
      }
      async getAnnouncement(id) {
        const [result] = await db2.select().from(announcements).where(eq(announcements.id, id));
        return result;
      }
      async createAnnouncement(announcementData) {
        const [result] = await db2.insert(announcements).values(announcementData).returning();
        return result;
      }
      async updateAnnouncement(id, announcementData) {
        const [result] = await db2.update(announcements).set({ ...announcementData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(announcements.id, id)).returning();
        return result;
      }
      async deleteAnnouncement(id) {
        await db2.delete(announcements).where(eq(announcements.id, id));
      }
      // Dashboard metrics
      async getStrataMetrics(strataId) {
        const unitCountResult = await db2.select({ count: count() }).from(units).where(eq(units.strataId, strataId));
        const totalProperties = unitCountResult[0]?.count || 0;
        const [strataData] = await db2.select().from(strata).where(eq(strata.id, strataId));
        const strataUnits = await db2.select().from(units).where(eq(units.strataId, strataId));
        const feeStructure = strataData?.feeStructure || {};
        let monthlyRevenue = 0;
        let feeTiers = [];
        if (feeStructure.tiers && Array.isArray(feeStructure.tiers)) {
          feeTiers = feeStructure.tiers;
        } else {
          feeTiers = Object.entries(feeStructure).map(([id, amount]) => ({
            id,
            amount: typeof amount === "number" ? amount : 0
          }));
        }
        feeTiers.forEach((tier) => {
          const unitsInTier = strataUnits.filter((unit) => unit.feeTierId === tier.id);
          const tierAmount = tier.amount || 0;
          monthlyRevenue += unitsInTier.length * tierAmount;
        });
        const outstandingAmount = monthlyRevenue * 0.1;
        const outstandingFees = `$${outstandingAmount.toLocaleString()}`;
        const pendingQuotesResult = await db2.select({ count: count() }).from(quotes).where(and(eq(quotes.strataId, strataId), eq(quotes.status, "pending")));
        const pendingExpensesResult = await db2.select({ count: count() }).from(expenses).where(and(eq(expenses.strataId, strataId), eq(expenses.status, "pending")));
        const pendingApprovals = (pendingQuotesResult[0]?.count || 0) + (pendingExpensesResult[0]?.count || 0);
        const maintenanceResult = await db2.select({ count: count() }).from(maintenanceRequests).where(and(
          eq(maintenanceRequests.strataId, strataId),
          sql`${maintenanceRequests.status} != 'completed'`
        ));
        const openMaintenance = maintenanceResult[0]?.count || 0;
        return {
          totalProperties,
          outstandingFees,
          pendingApprovals,
          openMaintenance
        };
      }
      // Payment Reminder operations
      async getStrataPaymentReminders(strataId) {
        const reminders = await db2.select().from(paymentReminders).where(eq(paymentReminders.strataId, strataId)).orderBy(desc(paymentReminders.createdAt));
        return reminders.map((reminder) => ({
          ...reminder,
          weeklyDays: reminder.weeklyDays ? JSON.parse(reminder.weeklyDays) : null
        }));
      }
      async getPaymentReminder(id) {
        const [result] = await db2.select().from(paymentReminders).where(eq(paymentReminders.id, id));
        return result;
      }
      async createPaymentReminder(reminderData) {
        const dataToInsert = {
          ...reminderData,
          weeklyDays: reminderData.weeklyDays ? JSON.stringify(reminderData.weeklyDays) : null
        };
        const [result] = await db2.insert(paymentReminders).values(dataToInsert).returning();
        return result;
      }
      async updatePaymentReminder(id, reminderData) {
        const dataToUpdate = {
          ...reminderData,
          weeklyDays: reminderData.weeklyDays ? JSON.stringify(reminderData.weeklyDays) : void 0,
          updatedAt: /* @__PURE__ */ new Date()
        };
        const [result] = await db2.update(paymentReminders).set(dataToUpdate).where(eq(paymentReminders.id, id)).returning();
        return result;
      }
      async deletePaymentReminder(id) {
        await db2.delete(paymentReminders).where(eq(paymentReminders.id, id));
      }
      async getActiveRecurringReminders(strataId) {
        return await db2.select().from(paymentReminders).where(
          and(
            eq(paymentReminders.strataId, strataId),
            eq(paymentReminders.isRecurring, true),
            eq(paymentReminders.status, "active")
          )
        ).orderBy(desc(paymentReminders.nextReminderDate));
      }
      async getOverdueReminders(strataId) {
        return await db2.select().from(paymentReminders).where(
          and(
            eq(paymentReminders.strataId, strataId),
            eq(paymentReminders.status, "active"),
            lt(paymentReminders.dueDate, /* @__PURE__ */ new Date())
          )
        ).orderBy(desc(paymentReminders.dueDate));
      }
      // Fund operations
      async getStrataFunds(strataId) {
        return await db2.select().from(funds).where(eq(funds.strataId, strataId)).orderBy(desc(funds.createdAt));
      }
      async getFund(id) {
        const [result] = await db2.select().from(funds).where(eq(funds.id, id));
        return result;
      }
      async createFund(fundData) {
        const [result] = await db2.insert(funds).values(fundData).returning();
        return result;
      }
      async updateFund(id, fundData) {
        const [result] = await db2.update(funds).set({ ...fundData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(funds.id, id)).returning();
        return result;
      }
      async deleteFund(id) {
        await db2.delete(funds).where(eq(funds.id, id));
      }
      // Fund transaction operations
      async getFundTransactions(fundId) {
        return await db2.select().from(fundTransactions).where(eq(fundTransactions.fundId, fundId)).orderBy(desc(fundTransactions.transactionDate));
      }
      async createFundTransaction(transactionData) {
        const [result] = await db2.insert(fundTransactions).values(transactionData).returning();
        return result;
      }
      async updateFundTransaction(id, transactionData) {
        const [result] = await db2.update(fundTransactions).set(transactionData).where(eq(fundTransactions.id, id)).returning();
        return result;
      }
      async deleteFundTransaction(id) {
        await db2.delete(fundTransactions).where(eq(fundTransactions.id, id));
      }
      // Fund calculations
      async calculateFundProjections(fundId, years) {
        const fund = await this.getFund(fundId);
        if (!fund) {
          throw new Error("Fund not found");
        }
        const currentBalance = parseFloat(fund.balance);
        const annualRate = fund.interestRate ? parseFloat(fund.interestRate) : 0;
        const monthlyRate = annualRate / 12;
        const totalMonths = years * 12;
        const monthlyProjections = [];
        let balance = currentBalance;
        let totalInterest = 0;
        for (let month = 1; month <= totalMonths; month++) {
          const interestEarned = balance * monthlyRate;
          balance += interestEarned;
          totalInterest += interestEarned;
          monthlyProjections.push({
            month,
            balance: Math.round(balance * 100) / 100,
            interest: Math.round(interestEarned * 100) / 100
          });
        }
        return {
          currentBalance,
          projectedBalance: Math.round(balance * 100) / 100,
          totalInterest: Math.round(totalInterest * 100) / 100,
          monthlyProjections
        };
      }
      // Pending strata registration operations
      async getAllPendingRegistrations() {
        return await db2.select().from(pendingStrataRegistrations).orderBy(desc(pendingStrataRegistrations.createdAt));
      }
      async getPendingRegistration(id) {
        const [registration] = await db2.select().from(pendingStrataRegistrations).where(eq(pendingStrataRegistrations.id, id));
        return registration;
      }
      async createPendingRegistration(registration) {
        const [created] = await db2.insert(pendingStrataRegistrations).values(registration).returning();
        return created;
      }
      async getPendingRegistrations() {
        return await db2.select().from(pendingStrataRegistrations).where(eq(pendingStrataRegistrations.status, "pending")).orderBy(desc(pendingStrataRegistrations.createdAt));
      }
      async approveStrataRegistration(id, subscriptionData) {
        const result = await this.approvePendingRegistration(id, "admin");
        if (subscriptionData && result.strata) {
          await this.updateStrata(result.strata.id, subscriptionData);
        }
        return result;
      }
      async rejectStrataRegistration(id) {
        return await this.rejectPendingRegistration(id, "admin", "Rejected by administrator");
      }
      // Strata admin helper methods
      async checkUserStrataAdminAccess(userId2, strataId) {
        const userAccess = await db2.select().from(userStrataAccess).where(
          and(
            eq(userStrataAccess.userId, userId2),
            eq(userStrataAccess.strataId, strataId)
          )
        );
        if (userAccess.length === 0) return false;
        const adminRoles = ["chairperson", "property_manager", "treasurer", "secretary"];
        return adminRoles.includes(userAccess[0].role);
      }
      async getUserStrataAccessById(accessId) {
        const [access] = await db2.select().from(userStrataAccess).where(eq(userStrataAccess.id, accessId));
        return access;
      }
      async getUserStrataAssignments(userId2) {
        const assignments = await db2.select({
          id: userStrataAccess.id,
          userId: userStrataAccess.userId,
          strataId: userStrataAccess.strataId,
          role: userStrataAccess.role,
          canPostAnnouncements: userStrataAccess.canPostAnnouncements,
          createdAt: userStrataAccess.createdAt,
          strata: {
            id: strata.id,
            name: strata.name
          }
        }).from(userStrataAccess).leftJoin(strata, eq(userStrataAccess.strataId, strata.id)).where(eq(userStrataAccess.userId, userId2));
        return assignments;
      }
      async removeUserFromAllStrata(userId2) {
        await db2.delete(userStrataAccess).where(eq(userStrataAccess.userId, userId2));
      }
      async updateUserStrataRole(userId2, strataId, role) {
        const updated = await db2.update(userStrataAccess).set({ role }).where(and(eq(userStrataAccess.userId, userId2), eq(userStrataAccess.strataId, strataId))).returning();
        return updated[0];
      }
      async removeUserStrataAccess(accessId) {
        await db2.delete(userStrataAccess).where(eq(userStrataAccess.id, accessId));
      }
      async updateStrataSubscription(strataId, subscriptionData) {
        await db2.update(strata).set(subscriptionData).where(eq(strata.id, strataId));
      }
      async updatePendingRegistration(id, updates) {
        const [updated] = await db2.update(pendingStrataRegistrations).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(pendingStrataRegistrations.id, id)).returning();
        return updated;
      }
      async approvePendingRegistration(id, approvedBy) {
        const registration = await this.getPendingRegistration(id);
        if (!registration) {
          throw new Error("Registration not found");
        }
        const subscriptionTier = registration.unitCount <= 100 ? "standard" : "premium";
        const monthlyRate = registration.unitCount <= 100 ? "79.95" : "129.95";
        const trialStartDate = /* @__PURE__ */ new Date();
        const trialEndDate = /* @__PURE__ */ new Date();
        trialEndDate.setDate(trialStartDate.getDate() + 30);
        const strataData = {
          name: registration.strataName,
          address: registration.address,
          city: registration.city,
          province: registration.province,
          postalCode: registration.postalCode,
          unitCount: registration.unitCount,
          managementCompany: registration.managementCompany,
          notes: registration.description,
          status: "active",
          subscriptionStatus: "trial",
          subscriptionTier,
          monthlyRate,
          trialStartDate,
          trialEndDate,
          isFreeForever: false,
          createdBy: approvedBy
        };
        const strata2 = await this.createStrata(strataData);
        const userData = {
          email: registration.adminEmail,
          firstName: registration.adminFirstName,
          lastName: registration.adminLastName,
          role: "chairperson",
          isActive: true
        };
        const user = await this.createUser(userData);
        await this.createUserStrataAccess({
          userId: user.id,
          strataId: strata2.id,
          role: "chairperson",
          canPostAnnouncements: true
        });
        await this.updatePendingRegistration(id, {
          status: "approved",
          approvedBy,
          approvedAt: /* @__PURE__ */ new Date(),
          createdStrataId: strata2.id
        });
        return { strata: strata2, user };
      }
      async rejectPendingRegistration(id, rejectedBy, reason) {
        return await this.updatePendingRegistration(id, {
          status: "rejected",
          approvedBy: rejectedBy,
          approvedAt: /* @__PURE__ */ new Date(),
          rejectionReason: reason
        });
      }
      // Quote operations
      async getStrataQuotes(strataId) {
        return await db2.select().from(quotes).where(eq(quotes.strataId, strataId)).orderBy(desc(quotes.createdAt));
      }
      async getQuote(id) {
        const [result] = await db2.select().from(quotes).where(eq(quotes.id, id));
        return result;
      }
      async createQuote(quoteData) {
        const [result] = await db2.insert(quotes).values({
          ...quoteData,
          submittedAt: /* @__PURE__ */ new Date(),
          status: "submitted"
        }).returning();
        return result;
      }
      async updateQuote(id, updates) {
        const [result] = await db2.update(quotes).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(quotes.id, id)).returning();
        return result;
      }
      async deleteQuote(id) {
        await db2.delete(quotes).where(eq(quotes.id, id));
      }
      // Message operations
      async getStrataMessages(strataId, userId2) {
        const messageList = await db2.select({
          id: messages.id,
          strataId: messages.strataId,
          senderId: messages.senderId,
          recipientId: messages.recipientId,
          subject: messages.subject,
          content: messages.content,
          messageType: messages.messageType,
          isRead: messages.isRead,
          readAt: messages.readAt,
          parentMessageId: messages.parentMessageId,
          conversationId: messages.conversationId,
          priority: messages.priority,
          createdAt: messages.createdAt,
          updatedAt: messages.updatedAt,
          senderName: users.firstName,
          senderEmail: users.email
        }).from(messages).leftJoin(users, eq(messages.senderId, users.id)).where(
          and(
            eq(messages.strataId, strataId),
            // Show messages where user is sender, recipient, or it's a broadcast
            sql`(${messages.senderId} = ${userId2} OR ${messages.recipientId} = ${userId2} OR ${messages.recipientId} IS NULL)`
          )
        ).orderBy(desc(messages.createdAt));
        return messageList;
      }
      async createMessage(messageData) {
        const [message] = await db2.insert(messages).values(messageData).returning();
        return message;
      }
      async markMessageAsRead(messageId) {
        const [message] = await db2.update(messages).set({
          isRead: true,
          readAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(messages.id, messageId)).returning();
        return message;
      }
      async deleteConversation(conversationId, userId2) {
        await db2.delete(messages).where(
          and(
            or(
              eq(messages.conversationId, conversationId),
              eq(messages.id, conversationId)
              // In case conversationId is the original message ID
            ),
            or(
              eq(messages.senderId, userId2),
              eq(messages.recipientId, userId2)
            )
          )
        );
      }
      // Notification operations
      async getUserNotifications(userId2, strataId) {
        const userNotifications = await db2.select().from(notifications).where(and(
          eq(notifications.userId, userId2),
          eq(notifications.strataId, strataId)
        )).orderBy(desc(notifications.createdAt));
        return userNotifications;
      }
      async createNotification(notificationData) {
        const [notification] = await db2.insert(notifications).values(notificationData).returning();
        return notification;
      }
      async markNotificationAsRead(notificationId) {
        const [notification] = await db2.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId)).returning();
        return notification;
      }
      // Resident Directory operations
      async getStrataResidentDirectory(strataId) {
        const directory = await db2.select({
          id: residentDirectory.id,
          strataId: residentDirectory.strataId,
          userId: residentDirectory.userId,
          dwellingId: residentDirectory.dwellingId,
          primaryPhone: residentDirectory.primaryPhone,
          secondaryPhone: residentDirectory.secondaryPhone,
          workPhone: residentDirectory.workPhone,
          alternateEmail: residentDirectory.alternateEmail,
          emergencyContactName: residentDirectory.emergencyContactName,
          emergencyContactPhone: residentDirectory.emergencyContactPhone,
          emergencyContactRelationship: residentDirectory.emergencyContactRelationship,
          emergencyContactEmail: residentDirectory.emergencyContactEmail,
          moveInDate: residentDirectory.moveInDate,
          occupancyType: residentDirectory.occupancyType,
          vehicleInfo: residentDirectory.vehicleInfo,
          petInfo: residentDirectory.petInfo,
          specialNotes: residentDirectory.specialNotes,
          showInDirectory: residentDirectory.showInDirectory,
          showContactInfo: residentDirectory.showContactInfo,
          showEmergencyContact: residentDirectory.showEmergencyContact,
          createdAt: residentDirectory.createdAt,
          updatedAt: residentDirectory.updatedAt,
          userName: users.firstName,
          userEmail: users.email,
          unitNumber: units.unitNumber
        }).from(residentDirectory).leftJoin(users, eq(residentDirectory.userId, users.id)).leftJoin(units, eq(residentDirectory.dwellingId, units.id)).where(
          and(
            eq(residentDirectory.strataId, strataId),
            eq(residentDirectory.showInDirectory, true)
          )
        ).orderBy(units.unitNumber);
        return directory;
      }
      async createResidentDirectoryEntry(entryData) {
        const [entry] = await db2.insert(residentDirectory).values(entryData).returning();
        return entry;
      }
      async updateResidentDirectoryEntry(id, updates) {
        const [entry] = await db2.update(residentDirectory).set({
          ...updates,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(residentDirectory.id, id)).returning();
        return entry;
      }
      // Dismissed Notifications operations
      async getUserDismissedNotifications(userId2) {
        const dismissed = await db2.select().from(dismissedNotifications).where(eq(dismissedNotifications.userId, userId2));
        return dismissed;
      }
      async dismissNotification(notificationData) {
        const [dismissed] = await db2.insert(dismissedNotifications).values(notificationData).returning();
        return dismissed;
      }
      // Reports operations
      async getStrataReports(strataId) {
        const reportsList = await db2.select().from(reports).where(eq(reports.strataId, strataId)).orderBy(desc(reports.createdAt));
        return reportsList;
      }
      async getReport(id) {
        const [report] = await db2.select().from(reports).where(eq(reports.id, id));
        return report;
      }
      async createReport(reportData) {
        const [report] = await db2.insert(reports).values(reportData).returning();
        return report;
      }
      async updateReport(id, updates) {
        const [report] = await db2.update(reports).set(updates).where(eq(reports.id, id)).returning();
        return report;
      }
      async deleteReport(id) {
        await db2.delete(reports).where(eq(reports.id, id));
      }
      async generateFinancialReport(strataId, dateRange) {
        const expensesList = await db2.select().from(expenses).where(
          and(
            eq(expenses.strataId, strataId),
            sql`${expenses.createdAt} >= ${dateRange.start}`,
            sql`${expenses.createdAt} <= ${dateRange.end}`
          )
        );
        const strataFunds = await db2.select().from(funds).where(eq(funds.strataId, strataId));
        const transactions = [];
        for (const fund of strataFunds) {
          const fundTransactions_results = await db2.select().from(fundTransactions).where(
            and(
              eq(fundTransactions.fundId, fund.id),
              sql`${fundTransactions.transactionDate} >= ${dateRange.start}`,
              sql`${fundTransactions.transactionDate} <= ${dateRange.end}`
            )
          );
          transactions.push(...fundTransactions_results);
        }
        const unitsList = await db2.select().from(units).where(eq(units.strataId, strataId));
        const [strataData] = await db2.select().from(strata).where(eq(strata.id, strataId));
        const feeStructure = strataData?.feeStructure || {};
        let monthlyIncome = 0;
        let feeTiers = [];
        if (feeStructure.tiers && Array.isArray(feeStructure.tiers)) {
          feeTiers = feeStructure.tiers;
        } else {
          feeTiers = Object.entries(feeStructure).map(([id, amount]) => ({
            id,
            amount: typeof amount === "number" ? amount : 0
          }));
        }
        feeTiers.forEach((tier) => {
          const unitsInTier = unitsList.filter((unit) => unit.feeTierId === tier.id);
          const tierAmount = tier.amount || 0;
          monthlyIncome += unitsInTier.length * tierAmount;
        });
        return {
          dateRange,
          expenses: expensesList,
          transactions,
          funds: strataFunds,
          monthlyIncome,
          totalExpenses: expensesList.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
          totalTransactions: transactions.reduce((sum, trans) => sum + parseFloat(trans.amount), 0)
        };
      }
      async generateMeetingMinutesReport(strataId, dateRange) {
        let meetingsList;
        if (dateRange) {
          meetingsList = await db2.select().from(meetings).where(
            and(
              eq(meetings.strataId, strataId),
              sql`${meetings.scheduledAt} >= ${dateRange.start}`,
              sql`${meetings.scheduledAt} <= ${dateRange.end}`
            )
          ).orderBy(desc(meetings.scheduledAt));
        } else {
          meetingsList = await db2.select().from(meetings).where(eq(meetings.strataId, strataId)).orderBy(desc(meetings.scheduledAt));
        }
        return {
          dateRange,
          meetings: meetingsList,
          totalMeetings: meetingsList.length
        };
      }
      async generateHomeSalePackage(strataId) {
        const meetingsList = await db2.select().from(meetings).where(eq(meetings.strataId, strataId)).orderBy(desc(meetings.scheduledAt));
        const oneYearAgo = /* @__PURE__ */ new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const recentExpenses = await db2.select().from(expenses).where(
          and(
            eq(expenses.strataId, strataId),
            sql`${expenses.createdAt} >= ${oneYearAgo.toISOString()}`
          )
        );
        const currentFunds = await db2.select().from(funds).where(eq(funds.strataId, strataId));
        const documentsList = await db2.select().from(documents).where(eq(documents.strataId, strataId));
        return {
          meetings: meetingsList,
          recentExpenses,
          funds: currentFunds,
          documents: documentsList,
          generatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      // Password management operations
      async markPasswordChanged(email) {
        await db2.update(users).set({
          mustChangePassword: false,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.email, email));
      }
      async setMustChangePassword(email) {
        await db2.update(users).set({
          mustChangePassword: true,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.email, email));
      }
      async getUserByEmail(email) {
        const [user] = await db2.select().from(users).where(eq(users.email, email));
        return user;
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/openai.ts
var openai_exports = {};
__export(openai_exports, {
  extractQuoteDataFromDocument: () => extractQuoteDataFromDocument,
  extractQuoteDataFromText: () => extractQuoteDataFromText,
  generateMeetingMinutes: () => generateMeetingMinutes,
  transcribeAudio: () => transcribeAudio
});
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { fromPath } from "pdf2pic";
async function transcribeAudio(audioBuffer, filename) {
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const timestamp2 = Date.now();
  const tempAudioPath = path.join(tempDir, `audio_${timestamp2}_${filename}`);
  try {
    fs.writeFileSync(tempAudioPath, audioBuffer);
    console.log(`Audio file size: ${(audioBuffer.length / 1024).toFixed(2)} KB`);
    const audioStream = fs.createReadStream(tempAudioPath);
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1",
      language: "en",
      // You can make this configurable if needed
      response_format: "text"
    });
    return transcription;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio");
  } finally {
    if (fs.existsSync(tempAudioPath)) {
      fs.unlinkSync(tempAudioPath);
    }
  }
}
async function generateMeetingMinutes(transcription, meetingTitle, meetingType, chairperson, agenda) {
  try {
    const prompt = `
You are a professional meeting secretary. Please create formal, well-structured meeting minutes from the following transcription.

Meeting Information:
- Title: ${meetingTitle}
- Type: ${meetingType}
- Chairperson: ${chairperson || "Not specified"}
- Agenda: ${agenda || "Not specified"}

Transcription:
${transcription}

Please format the minutes professionally with the following structure:
1. Meeting Header (Title, Date, Type, Chairperson)
2. Attendees (extract from transcription if mentioned)
3. Agenda Items Discussed
4. Key Decisions Made
5. Action Items (with responsible parties if mentioned)
6. Next Steps/Follow-up
7. Meeting Adjournment

Make the minutes clear, concise, and professionally formatted. Focus on key decisions, action items, and important discussions. Avoid including filler words or casual conversation.
`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a professional meeting secretary with expertise in creating formal meeting minutes for strata/condominium board meetings."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      // Lower temperature for more consistent, professional output
      max_tokens: 2e3
    });
    return response.choices[0].message.content || "Failed to generate meeting minutes";
  } catch (error) {
    console.error("Error generating meeting minutes:", error);
    throw new Error("Failed to generate meeting minutes with AI");
  }
}
async function convertPdfToImage(base64Data) {
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const timestamp2 = Date.now();
  const tempPdfPath = path.join(tempDir, `temp_${timestamp2}.pdf`);
  try {
    const pdfBuffer = Buffer.from(base64Data, "base64");
    console.log(`PDF size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    fs.writeFileSync(tempPdfPath, pdfBuffer);
    console.log("Attempting PDF conversion with pdf2pic...");
    try {
      const options = {
        density: 100,
        // DPI
        saveFilename: "page",
        // Output filename
        savePath: tempDir,
        // Output directory
        format: "jpeg",
        // Output format
        width: 800,
        // Width
        height: 1e3,
        // Height
        quality: 70
        // JPEG quality
      };
      const convert = fromPath(tempPdfPath, options);
      const result = await convert(1, { responseType: "buffer" });
      if (result && result.buffer && result.buffer.length > 100) {
        const base64Image = result.buffer.toString("base64");
        console.log(`PDF converted successfully: ${(result.buffer.length / 1024).toFixed(2)} KB`);
        fs.unlinkSync(tempPdfPath);
        return base64Image;
      }
    } catch (pdf2picError) {
      console.log("pdf2pic failed, trying system command...");
    }
    console.log("Attempting PDF conversion with pdftoppm...");
    try {
      const outputPrefix = path.join(tempDir, `page_${timestamp2}`);
      const outputPath = `${outputPrefix}-01.jpg`;
      const command = `pdftoppm -f 1 -l 1 -jpeg -r 100 -scale-to-x 800 -scale-to-y 1000 "${tempPdfPath}" "${outputPrefix}"`;
      await execAsync(command);
      if (fs.existsSync(outputPath)) {
        const imageBuffer = fs.readFileSync(outputPath);
        if (imageBuffer.length > 100) {
          const base64Image = imageBuffer.toString("base64");
          console.log(`PDF converted with pdftoppm: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
          fs.unlinkSync(tempPdfPath);
          fs.unlinkSync(outputPath);
          return base64Image;
        }
      }
    } catch (pdftoppmError) {
      console.log("pdftoppm failed, trying ImageMagick...");
    }
    console.log("Attempting PDF conversion with ImageMagick...");
    try {
      const outputImagePath = path.join(tempDir, `converted_${timestamp2}.jpg`);
      const command = `convert -density 100 -quality 70 -resize 800x1000 "${tempPdfPath}[0]" "${outputImagePath}"`;
      await execAsync(command);
      if (fs.existsSync(outputImagePath)) {
        const imageBuffer = fs.readFileSync(outputImagePath);
        if (imageBuffer.length > 100) {
          const base64Image = imageBuffer.toString("base64");
          console.log(`PDF converted with ImageMagick: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
          fs.unlinkSync(tempPdfPath);
          fs.unlinkSync(outputImagePath);
          return base64Image;
        }
      }
    } catch (imageMagickError) {
      console.log("ImageMagick failed");
    }
    throw new Error("All PDF conversion methods failed");
  } catch (error) {
    console.error("PDF conversion error:", error);
    if (fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
    }
    throw new Error(`PDF conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
async function extractQuoteDataFromDocument(base64Data, mimeType) {
  try {
    let imageData = base64Data;
    let imageMimeType = mimeType;
    if (mimeType === "application/pdf") {
      console.log("Converting PDF to image for AI analysis...");
      try {
        imageData = await convertPdfToImage(base64Data);
        imageMimeType = "image/jpeg";
        console.log("PDF conversion successful, proceeding with AI analysis...");
      } catch (pdfError) {
        console.error("PDF conversion failed:", pdfError);
        throw new Error("PDF conversion failed. Please convert your PDF to an image (JPG/PNG) and try again, or fill out the form manually.");
      }
    }
    if (!imageMimeType.startsWith("image/")) {
      throw new Error("Unsupported file type. Only images and PDFs are supported.");
    }
    const imageSizeKB = imageData.length * 3 / 4 / 1024;
    console.log(`Image size: ${imageSizeKB.toFixed(2)} KB`);
    if (!imageData || imageData.length === 0) {
      throw new Error("No image data available for analysis. PDF conversion may have failed.");
    }
    if (imageSizeKB > 5e3) {
      throw new Error("Image too large for AI analysis. Please use a smaller image or lower resolution PDF.");
    }
    if (imageSizeKB < 1) {
      throw new Error("Image appears to be empty or corrupted. Please try a different file.");
    }
    console.log("Sending image to OpenAI for analysis...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting structured information from construction and service quotes/estimates. 
          Analyze the document and extract relevant information for a quote management system.
          
          Return a JSON object with the following fields (only include fields if information is clearly present):
          - projectTitle: Brief title of the project/work
          - projectType: Category like "Maintenance", "Repair", "Installation", "Construction", etc.
          - description: Detailed description of work to be performed
          - scope: Specific scope of work, materials, specifications
          - amount: Total estimated cost (extract numbers and currency)
          - vendorName: Company/contractor name
          - vendorEmail: Contact email
          - vendorPhone: Phone number
          - vendorAddress: Business address
          - vendorWebsite: Website URL
          - licenseNumber: License or certification number
          - hasLiabilityInsurance: true/false if insurance is mentioned
          - startDate: Proposed start date (YYYY-MM-DD format)
          - estimatedCompletion: Expected completion date (YYYY-MM-DD format)
          - validUntil: Quote expiration date (YYYY-MM-DD format)
          - warranty: Warranty terms/period
          - paymentTerms: Payment schedule or terms
          - notes: Additional important details or conditions
          
          Be conservative - only extract information that is clearly stated. Don't make assumptions.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this quote/estimate document and extract the structured information in JSON format."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageMimeType};base64,${imageData}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2e3
    });
    console.log("OpenAI analysis completed successfully");
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error extracting quote data:", error);
    if (error.status === 429) {
      if (error.error?.code === "insufficient_quota") {
        throw new Error("OpenAI API quota exceeded. Please check your billing details at https://platform.openai.com/account/billing");
      } else {
        throw new Error("Too many requests to OpenAI API. Please wait a moment and try again.");
      }
    } else if (error.status === 401) {
      throw new Error("Invalid OpenAI API key. Please check your API key configuration.");
    } else if (error.status === 413) {
      throw new Error("Image file is too large for AI analysis. Please use a smaller file.");
    } else {
      throw new Error(`Failed to analyze document with AI: ${error.message || "Unknown error"}`);
    }
  }
}
async function extractQuoteDataFromText(text2) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting structured information from construction and service quotes/estimates text. 
          Analyze the text and extract relevant information for a quote management system.
          
          Return a JSON object with the following fields (only include fields if information is clearly present):
          - projectTitle: Brief title of the project/work
          - projectType: Category like "Maintenance", "Repair", "Installation", "Construction", etc.
          - description: Detailed description of work to be performed
          - scope: Specific scope of work, materials, specifications
          - amount: Total estimated cost (extract numbers and currency)
          - vendorName: Company/contractor name
          - vendorEmail: Contact email
          - vendorPhone: Phone number
          - vendorAddress: Business address
          - vendorWebsite: Website URL
          - licenseNumber: License or certification number
          - hasLiabilityInsurance: true/false if insurance is mentioned
          - startDate: Proposed start date (YYYY-MM-DD format)
          - estimatedCompletion: Expected completion date (YYYY-MM-DD format)
          - validUntil: Quote expiration date (YYYY-MM-DD format)
          - warranty: Warranty terms/period
          - paymentTerms: Payment schedule or terms
          - notes: Additional important details or conditions
          
          Be conservative - only extract information that is clearly stated. Don't make assumptions.`
        },
        {
          role: "user",
          content: `Please analyze this quote/estimate text and extract the structured information in JSON format:

${text2}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2e3
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error extracting quote data from text:", error);
    throw new Error("Failed to analyze text with AI");
  }
}
var execAsync, openai;
var init_openai = __esm({
  "server/openai.ts"() {
    "use strict";
    execAsync = promisify(exec);
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
});

// server/email-service.ts
var email_service_exports = {};
__export(email_service_exports, {
  generateMeetingInviteEmail: () => generateMeetingInviteEmail,
  sendMeetingInviteEmails: () => sendMeetingInviteEmails
});
async function sendFirebaseEmail(emailData) {
  try {
    console.log(`\u{1F4E7} Sending Firebase email to: ${emailData.to}`);
    console.log(`\u{1F4E7} Subject: ${emailData.subject}`);
    const emailDoc = await db.collection("mail").add({
      to: emailData.to,
      message: {
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      },
      // Template and delivery settings
      template: {
        name: "meeting-invitation",
        data: {
          subject: emailData.subject,
          content: emailData.html
        }
      },
      // Metadata for tracking
      delivery: {
        startTime: (/* @__PURE__ */ new Date()).toISOString(),
        state: "PENDING",
        attempts: 0,
        info: {
          messageId: null
        }
      },
      // Custom tracking fields
      vibestrat: {
        type: "meeting_invitation",
        source: "vibestrat-system",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
    console.log(`\u{1F4E7} Email queued in Firebase with ID: ${emailDoc.id}`);
    await db.collection("email_logs").add({
      to: emailData.to,
      subject: emailData.subject,
      firebaseDocId: emailDoc.id,
      sentAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "queued_firebase",
      type: "meeting_invitation",
      source: "vibestrat"
    });
    console.log(`\u2705 Firebase email successfully queued for: ${emailData.to}`);
  } catch (error) {
    console.error("\u274C Failed to queue Firebase email:", error);
    await db.collection("email_logs").add({
      to: emailData.to,
      subject: emailData.subject,
      sentAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "failed",
      error: error.message,
      type: "meeting_invitation",
      source: "vibestrat"
    });
    throw error;
  }
}
function generateMeetingInviteEmail(data) {
  const { meeting, strata: strata2, organizer } = data;
  const meetingDate = new Date(meeting.scheduledAt);
  const formattedDate = meetingDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const formattedTime = meetingDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
  const subject = `\u{1F4C5} Meeting Invitation: ${meeting.title} - ${formattedDate}`;
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Invitation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8fafc;
    }
    .email-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
      font-size: 16px;
    }
    .content {
      padding: 30px;
    }
    .meeting-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .meeting-title {
      font-size: 22px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 15px 0;
    }
    .meeting-details {
      display: grid;
      gap: 12px;
    }
    .detail-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .detail-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
    .detail-label {
      font-weight: 600;
      color: #4a5568;
      min-width: 80px;
    }
    .detail-value {
      color: #2d3748;
    }
    .agenda-section {
      margin-top: 25px;
    }
    .agenda-title {
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 10px;
    }
    .agenda-content {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 15px;
      white-space: pre-wrap;
      line-height: 1.5;
    }
    .cta-section {
      text-align: center;
      margin: 30px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: transform 0.2s ease;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .footer {
      background: #f7fafc;
      padding: 25px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 5px 0;
      color: #718096;
      font-size: 14px;
    }
    .organizer-info {
      background: #edf2f7;
      border-radius: 6px;
      padding: 15px;
      margin-top: 20px;
    }
    .organizer-title {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 8px;
    }
    @media (max-width: 600px) {
      body {
        padding: 10px;
      }
      .header, .content, .footer {
        padding: 20px;
      }
      .meeting-title {
        font-size: 20px;
      }
      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>\u{1F4C5} Meeting Invitation</h1>
      <p>You're invited to an upcoming meeting</p>
    </div>
    
    <div class="content">
      <div class="meeting-card">
        <h2 class="meeting-title">${meeting.title}</h2>
        
        <div class="meeting-details">
          <div class="detail-row">
            <div class="detail-icon">\u{1F4C5}</div>
            <span class="detail-label">Date:</span>
            <span class="detail-value">${formattedDate}</span>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">\u{1F550}</div>
            <span class="detail-label">Time:</span>
            <span class="detail-value">${formattedTime}</span>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">\u{1F4CD}</div>
            <span class="detail-label">Location:</span>
            <span class="detail-value">${meeting.location || "To be determined"}</span>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">\u{1F3E2}</div>
            <span class="detail-label">Strata:</span>
            <span class="detail-value">${strata2.name}</span>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">\u{1F4CB}</div>
            <span class="detail-label">Type:</span>
            <span class="detail-value">${meeting.meetingType?.replace("_", " ").toUpperCase() || "General Meeting"}</span>
          </div>
        </div>
        
        ${meeting.agenda ? `
        <div class="agenda-section">
          <h3 class="agenda-title">\u{1F4DD} Meeting Agenda</h3>
          <div class="agenda-content">${meeting.agenda}</div>
        </div>
        ` : ""}
      </div>
      
      <div class="cta-section">
        <a href="${process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000"}/meetings" class="cta-button">
          View Meeting Details
        </a>
      </div>
      
      <div class="organizer-info">
        <div class="organizer-title">\u{1F464} Meeting Organizer</div>
        <p><strong>${organizer.firstName} ${organizer.lastName}</strong></p>
        <p>${organizer.email}</p>
      </div>
      
      <p style="margin-top: 25px; color: #718096;">
        <strong>Important:</strong> Please mark your calendar and confirm your attendance. 
        If you cannot attend, please notify the organizer as soon as possible.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>VibeStrat</strong> - Strata Management Platform</p>
      <p>${strata2.address}</p>
      <p style="margin-top: 15px;">
        This is an automated message from VibeStrat. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>`;
  const textBody = `
MEETING INVITATION

${meeting.title}

Date: ${formattedDate}
Time: ${formattedTime}
Location: ${meeting.location || "To be determined"}
Strata: ${strata2.name}
Type: ${meeting.meetingType?.replace("_", " ").toUpperCase() || "General Meeting"}

${meeting.agenda ? `
AGENDA:
${meeting.agenda}
` : ""}

ORGANIZER:
${organizer.firstName} ${organizer.lastName}
${organizer.email}

Please mark your calendar and confirm your attendance. If you cannot attend, please notify the organizer as soon as possible.

View meeting details: ${process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000"}/meetings

---
VibeStrat - Strata Management Platform
${strata2.address}

This is an automated message from VibeStrat. Please do not reply to this email.
`;
  return {
    subject,
    htmlBody,
    textBody
  };
}
async function sendMeetingInviteEmails(emailData) {
  const { subject, htmlBody, textBody } = generateMeetingInviteEmail(emailData);
  for (const invitee of emailData.invitees) {
    try {
      console.log(`\u{1F4E7} Creating meeting invitation notification for: ${invitee.email}`);
      const notificationData = {
        userId: invitee.id,
        strataId: emailData.meeting.strataId,
        type: "meeting_invitation",
        title: `\u{1F4C5} Meeting Invitation: ${emailData.meeting.title}`,
        message: `You're invited to ${emailData.meeting.title} on ${new Date(emailData.meeting.scheduledAt).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        })} at ${new Date(emailData.meeting.scheduledAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        })}. Click to view details.`,
        priority: "high",
        metadata: {
          meetingId: emailData.meeting.id,
          meetingTitle: emailData.meeting.title,
          meetingDate: emailData.meeting.scheduledAt,
          organizer: `${emailData.organizer.firstName} ${emailData.organizer.lastName}`,
          location: emailData.meeting.location || "TBD",
          type: emailData.meeting.meetingType || "general_meeting"
        }
      };
      await firebaseStorage.createNotification(notificationData);
      try {
        await sendFirebaseEmail({
          to: invitee.email,
          subject,
          html: htmlBody,
          text: textBody
        });
        console.log(`\u2705 Meeting invitation email sent to ${invitee.email}`);
      } catch (emailError) {
        console.error(`\u274C Failed to send email to ${invitee.email}:`, emailError);
      }
      console.log(`\u2705 Meeting invitation notification created for ${invitee.email}`);
    } catch (error) {
      console.error(`\u274C Failed to create meeting invite notification for ${invitee.email}:`, error);
    }
  }
  console.log(`\u{1F4E7} Meeting invitation notifications sent to ${emailData.invitees.length} recipients`);
}
var init_email_service = __esm({
  "server/email-service.ts"() {
    "use strict";
    init_firebase_storage();
    init_firebase_db();
  }
});

// server/firebase-user-migration.ts
var firebase_user_migration_exports = {};
__export(firebase_user_migration_exports, {
  FirebaseUserMigration: () => FirebaseUserMigration,
  userMigration: () => userMigration
});
var FirebaseUserMigration, userMigration;
var init_firebase_user_migration = __esm({
  "server/firebase-user-migration.ts"() {
    "use strict";
    init_storage();
    FirebaseUserMigration = class {
      temporaryPassword = "VibeStrat2025!";
      // Temporary password for all migrated users
      // Helper method to convert JavaScript object to Firestore fields format
      convertToFirestoreFields(obj) {
        const fields = {};
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === "string") {
            fields[key] = { stringValue: value };
          } else if (typeof value === "boolean") {
            fields[key] = { booleanValue: value };
          } else if (typeof value === "object" && value !== null) {
            fields[key] = { mapValue: { fields: this.convertToFirestoreFields(value) } };
          }
        }
        return fields;
      }
      // Get all users from PostgreSQL
      async getAllPostgreSQLUsers() {
        try {
          const users2 = await storage.getAllUsers();
          return users2.map((user) => ({
            id: user.id,
            email: user.email || "",
            first_name: user.firstName || null,
            last_name: user.lastName || null,
            role: user.role,
            is_active: user.isActive !== false,
            created_at: user.createdAt || (/* @__PURE__ */ new Date()).toISOString()
          }));
        } catch (error) {
          console.error("Error fetching PostgreSQL users:", error);
          return [];
        }
      }
      // Create or update Firebase user password using REST API
      async createFirebaseUser(pgUser, newPassword) {
        try {
          const apiKey = process.env.VITE_FIREBASE_API_KEY;
          const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
          if (!apiKey || !projectId) {
            throw new Error("Firebase API key or project ID not configured");
          }
          const passwordToUse = newPassword || this.temporaryPassword;
          const authResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: pgUser.email,
              password: passwordToUse,
              returnSecureToken: true
            })
          });
          let firebaseUid;
          let isNewUser = true;
          if (!authResponse.ok) {
            const error = await authResponse.json();
            if (error.error?.message === "EMAIL_EXISTS") {
              console.log(`Firebase user ${pgUser.email} already exists, updating password...`);
              const lookupResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  email: [pgUser.email]
                })
              });
              if (!lookupResponse.ok) {
                throw new Error("Failed to lookup existing user");
              }
              const lookupData = await lookupResponse.json();
              if (!lookupData.users || lookupData.users.length === 0) {
                throw new Error("User not found in Firebase");
              }
              firebaseUid = lookupData.users[0].localId;
              isNewUser = false;
              const updateResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  localId: firebaseUid,
                  password: passwordToUse,
                  returnSecureToken: true
                })
              });
              if (!updateResponse.ok) {
                const updateError = await updateResponse.json();
                throw new Error(updateError.error?.message || "Failed to update Firebase user password");
              }
              console.log(`Successfully updated password for Firebase user: ${pgUser.email}`);
            } else {
              throw new Error(error.error?.message || "Failed to create Firebase user");
            }
          } else {
            const authData = await authResponse.json();
            firebaseUid = authData.localId;
          }
          const userData = {
            id: pgUser.id,
            firebaseUid,
            email: pgUser.email,
            firstName: pgUser.first_name || "",
            lastName: pgUser.last_name || "",
            role: pgUser.role,
            isActive: pgUser.is_active,
            isMigrated: true,
            needsPasswordUpdate: true,
            migratedAt: (/* @__PURE__ */ new Date()).toISOString(),
            originalCreatedAt: pgUser.created_at,
            preferences: {
              notifications: true,
              emailAlerts: true,
              theme: "system"
            }
          };
          const firestoreResponse = await fetch(
            `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${pgUser.id}?key=${apiKey}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                fields: this.convertToFirestoreFields(userData)
              })
            }
          );
          if (!firestoreResponse.ok) {
            console.warn("Failed to create Firestore document, but Firebase Auth user created successfully");
          }
          return {
            email: pgUser.email,
            status: isNewUser ? "success" : "updated",
            firebaseUid,
            tempPassword: passwordToUse
          };
        } catch (error) {
          return {
            email: pgUser.email,
            status: "error",
            error: error.message
          };
        }
      }
      // Migrate all users from PostgreSQL to Firebase
      async migrateAllUsers() {
        console.log("\u{1F680} Starting Firebase user migration...\n");
        const pgUsers = await this.getAllPostgreSQLUsers();
        const results = [];
        console.log(`Found ${pgUsers.length} users to migrate:
`);
        for (const user of pgUsers) {
          console.log(`Migrating: ${user.email} (${user.role})`);
          const result = await this.createFirebaseUser(user);
          results.push(result);
          if (result.status === "success") {
            console.log(`\u2705 Success: ${user.email} -> Firebase UID: ${result.firebaseUid}`);
          } else if (result.status === "exists") {
            console.log(`\u2139\uFE0F  Already exists: ${user.email}`);
          } else {
            console.log(`\u274C Failed: ${user.email} - ${result.error}`);
          }
        }
        const summary = {
          total: results.length,
          successful: results.filter((r) => r.status === "success").length,
          existing: results.filter((r) => r.status === "exists").length,
          failed: results.filter((r) => r.status === "error").length,
          temporaryPassword: this.temporaryPassword
        };
        console.log("\n\u{1F4CA} Migration Summary:");
        console.log(`Total users: ${summary.total}`);
        console.log(`Successfully migrated: ${summary.successful}`);
        console.log(`Already existed: ${summary.existing}`);
        console.log(`Failed: ${summary.failed}`);
        console.log(`
\u{1F511} Temporary password for all users: ${this.temporaryPassword}`);
        console.log("\n\u{1F4CB} Next Steps:");
        console.log("1. Users can log in with their email and temporary password");
        console.log("2. Prompt users to change their password on first login");
        console.log("3. Update frontend to handle migrated users");
        return { results, summary };
      }
      // Check if a specific user exists in Firebase
      async checkUserExists(email) {
        try {
          const pgUsers = await this.getAllPostgreSQLUsers();
          const user = pgUsers.find((u) => u.email === email);
          if (!user) return false;
          const apiKey = process.env.VITE_FIREBASE_API_KEY;
          const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
          if (!apiKey || !projectId) return false;
          const response = await fetch(
            `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${user.id}?key=${apiKey}`,
            { method: "GET" }
          );
          return response.ok;
        } catch (error) {
          console.error("Error checking user existence:", error);
          return false;
        }
      }
      // Get migration status for all users
      async getMigrationStatus() {
        const pgUsers = await this.getAllPostgreSQLUsers();
        const status = [];
        for (const user of pgUsers) {
          const exists = await this.checkUserExists(user.email);
          status.push({
            email: user.email,
            role: user.role,
            isActive: user.is_active,
            migratedToFirebase: exists
          });
        }
        return {
          totalUsers: pgUsers.length,
          migrated: status.filter((s) => s.migratedToFirebase).length,
          pending: status.filter((s) => !s.migratedToFirebase).length,
          users: status
        };
      }
    };
    userMigration = new FirebaseUserMigration();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_firebase_storage();
import { createServer } from "http";

// server/firebase-auth.ts
init_storage();
var authenticateFirebase = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.substring(7);
    try {
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
      const email = payload.email;
      if (!email) {
        return res.status(401).json({ message: "Invalid token format" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.firebaseUser = {
        uid: payload.user_id || payload.sub,
        email
      };
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// server/firebase-storage-bucket.ts
init_firebase_db();
import { getStorage } from "firebase-admin/storage";
var bucket = getStorage(app).bucket();
async function uploadFileToStorage(fileName, fileBuffer, contentType, folder = "uploads") {
  try {
    console.log("\u{1F50D} Attempting Firebase Storage upload...");
    console.log("\u{1F4CA} Bucket info:", { name: bucket.name, exists: await bucket.exists() });
    const file = bucket.file(`${folder}/${fileName}`);
    await file.save(fileBuffer, {
      metadata: {
        contentType
      },
      public: true
      // Make file publicly accessible
    });
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${folder}/${fileName}`;
    console.log("\u2705 Firebase Storage upload successful:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("\u274C Firebase Storage upload failed:", error);
    console.log("\u{1F504} Falling back to base64 storage in Firestore...");
    const base64Data = fileBuffer.toString("base64");
    const fileUrl = `data:${contentType};base64,${base64Data}`;
    console.log("\u2705 Fallback base64 storage successful");
    return fileUrl;
  }
}

// server/routes.ts
init_openai();
init_schema();
import bcrypt from "bcryptjs";
import multer from "multer";
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
    // 50MB limit
    fieldSize: 50 * 1024 * 1024,
    // 50MB for individual fields
    fields: 10,
    // Maximum number of fields
    files: 1
    // Maximum number of files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "audio/",
      "image/",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv"
    ];
    const isAllowed = allowedTypes.some((type) => file.mimetype.startsWith(type));
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  }
});
var isAuthenticatedUnified = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("\u{1F510} Auth check:", {
      hasAuthHeader: !!authHeader,
      authHeaderValue: authHeader ? `${authHeader.substring(0, 20)}...` : "none",
      allHeaders: Object.keys(req.headers),
      method: req.method,
      path: req.path
    });
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      console.log("\u{1F3AB} Token extracted:", {
        tokenLength: token.length,
        tokenStart: token.substring(0, 20),
        hasToken: !!token
      });
      try {
        const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
        const email = payload.email;
        if (email) {
          if (email === "rfinnbogason@gmail.com") {
            req.authenticatedUser = {
              id: "master-admin",
              email,
              firstName: "Master",
              lastName: "Admin",
              role: "master_admin",
              isActive: true
            };
            req.firebaseUser = {
              uid: payload.user_id || payload.sub,
              email
            };
            return next();
          }
          const user = await firebaseStorage.getUserByEmail(email);
          if (user) {
            req.authenticatedUser = user;
            req.firebaseUser = {
              uid: payload.user_id || payload.sub,
              email
            };
            return next();
          }
        }
      } catch (tokenError) {
        console.log("Firebase token verification failed:", tokenError.message);
      }
    }
    return res.status(401).json({ message: "Firebase authentication required" });
  } catch (error) {
    console.error("Error checking Firebase authentication:", error);
    return res.status(500).json({ message: "Firebase authentication error" });
  }
};
function registerFirebaseMigrationRoutes(app3) {
  app3.post("/api/migration/check-user", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const user = await firebaseStorage.getUserByEmail(email);
      if (user) {
        const isFirebaseNative = user.firebaseUid || user.createdAt > /* @__PURE__ */ new Date("2025-07-01");
        res.json({
          exists: true,
          needsMigration: !isFirebaseNative,
          // Only migrate legacy PostgreSQL users
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            role: user.role,
            isActive: user.isActive !== false
          },
          temporaryPassword: isFirebaseNative ? null : "VibeStrat2025!"
          // No temp password for Firebase users
        });
      } else {
        res.json({ exists: false });
      }
    } catch (error) {
      console.error("Error checking user:", error);
      res.status(500).json({ error: "Failed to check user" });
    }
  });
  app3.get("/api/migration/postgresql-users", async (req, res) => {
    try {
      const users2 = await firebaseStorage.getAllUsers();
      const userList = users2.map((user) => ({
        id: user.id,
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        role: user.role,
        isActive: user.isActive !== false
      }));
      res.json({
        totalUsers: userList.length,
        users: userList,
        temporaryPassword: "VibeStrat2025!",
        instructions: [
          "All existing users can log in with their email and the temporary password: VibeStrat2025!",
          "Users should change their password after first login",
          "Admin users retain their existing roles and permissions"
        ]
      });
    } catch (error) {
      console.error("Error fetching PostgreSQL users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
}
async function registerRoutes(app3) {
  app3.post("/api/test-upload", (req, res) => {
    console.log("\u{1F9EA} Test upload route reached");
    console.log(`\u{1F4CB} Content-Type: ${req.headers["content-type"]}`);
    console.log(`\u{1F4CB} Content-Length: ${req.headers["content-length"]}`);
    res.json({ message: "Test upload route working" });
  });
  app3.post("/api/simple-upload-test", (req, res) => {
    console.log("\u{1F3AF} SIMPLE UPLOAD TEST ROUTE REACHED");
    res.json({ message: "Simple upload route working", method: req.method, path: req.path });
  });
  app3.post("/api/emergency-upload/:strataId", upload.single("file"), async (req, res) => {
    console.log("\u{1F6A8} EMERGENCY UPLOAD ROUTE REACHED \u{1F6A8}");
    console.log("File details:", {
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      strataId: req.params.strataId
    });
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const fileName = `${Date.now()}_${req.file.originalname}`;
      const folder = `documents/${req.params.strataId}`;
      const fileUrl = await uploadFileToStorage(fileName, req.file.buffer, req.file.mimetype, folder);
      console.log("\u2705 File uploaded to Firebase Storage:", fileUrl);
      const documentData = {
        title: req.body.title || req.file.originalname,
        description: req.body.description || "",
        type: req.body.type || "general",
        tags: req.body.tags ? req.body.tags.split(",").map((tag) => tag.trim()) : [],
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        fileUrl,
        folderId: req.body.folderId || null,
        strataId: req.params.strataId,
        uploadedBy: "master-admin"
      };
      const document = await firebaseStorage.createDocument(documentData);
      console.log("\u2705 Document created successfully");
      res.json(document);
    } catch (error) {
      console.error("\u274C Emergency upload failed:", error);
      res.status(500).json({ message: "Emergency upload failed: " + error.message });
    }
  });
  const isAdmin = async (req, res, next) => {
    console.log("Admin check - Firebase user:", req.firebaseUser);
    console.log("Admin check - Authenticated user:", req.authenticatedUser);
    console.log("Admin check - Replit user:", req.user);
    if (req.firebaseUser?.email === "rfinnbogason@gmail.com") {
      console.log("Admin access granted via Firebase email");
      return next();
    }
    if (req.authenticatedUser?.email === "rfinnbogason@gmail.com") {
      console.log("Admin access granted via authenticated email");
      return next();
    }
    if (req.authenticatedUser?.role === "master_admin") {
      console.log("Admin access granted via master_admin role");
      return next();
    }
    const userEmail = req.user?.claims?.email;
    if (userEmail === "rfinnbogason@gmail.com") {
      console.log("Admin access granted via Replit email");
      return next();
    }
    console.log("Admin access denied - no matching criteria");
    return res.status(403).json({ message: "Admin access required" });
  };
  app3.get("/api/auth/user", isAuthenticatedUnified, async (req, res) => {
    try {
      const userId2 = req.user.claims.sub;
      const user = await firebaseStorage.getUser(userId2);
      const userStrata = await firebaseStorage.getUserStrata(userId2);
      if (userStrata.length === 0) {
        console.log(`Creating sample strata for new user: ${userId2}`);
        const sampleStrata = await firebaseStorage.createStrata({
          name: "Sunset Gardens Strata",
          address: "123 Maple Street, Vancouver, BC V6K 2P4",
          unitCount: 6,
          createdBy: userId2,
          feeStructure: {
            studio: 280,
            one_bedroom: 350,
            two_bedroom: 420
          }
        });
        await firebaseStorage.createUserStrataAccess({
          userId: userId2,
          strataId: sampleStrata.id,
          role: "property_manager"
        });
        for (let i = 1; i <= 6; i++) {
          await firebaseStorage.createUnit({
            strataId: sampleStrata.id,
            unitNumber: `${i}0${i}`,
            feeTierId: i <= 2 ? "studio" : i <= 4 ? "one_bedroom" : "two_bedroom"
          });
        }
        console.log(`Sample strata created successfully for user: ${userId2}`);
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app3.get("/api/auth/session", async (req, res) => {
    try {
      let user = null;
      if (req.isAuthenticatedUnified() && req.user?.claims?.sub) {
        const userId2 = req.user.claims.sub;
        user = await firebaseStorage.getUser(userId2);
      }
      if (!user && req.session && req.session.userId) {
        user = await firebaseStorage.getUser(req.session.userId);
      }
      if (user) {
        const strataAssignments = await firebaseStorage.getAllUserStrataAccess(user.id);
        return res.json({
          ...user,
          strataAssignments
        });
      }
      res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
      console.error("Error checking session:", error);
      res.status(500).json({ message: "Failed to check authentication" });
    }
  });
  app3.post("/api/auth/setup-password", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await firebaseStorage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.passwordHash) {
        return res.status(400).json({ message: "Password already set" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      await firebaseStorage.updateUser(user.id, { passwordHash });
      res.json({ message: "Password set successfully" });
    } catch (error) {
      console.error("Error setting password:", error);
      res.status(500).json({ message: "Failed to set password" });
    }
  });
  app3.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await firebaseStorage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }
      await firebaseStorage.updateUser(user.id, { lastLoginAt: /* @__PURE__ */ new Date() });
      req.session.userId = user.id;
      res.json({ message: "Login successful", user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app3.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logout successful" });
    });
  });
  app3.get("/api/strata", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.authenticatedUser;
      console.log("\u{1F3E2} Fetching strata for user:", user.email);
      if (user.email === "rfinnbogason@gmail.com") {
        console.log("\u{1F451} Master admin access - fetching all strata");
        const allStrata = await firebaseStorage.getAllStrata();
        console.log(`\u{1F4CA} Found ${allStrata.length} strata organizations`);
        if (allStrata.length === 0) {
          console.error("\u26A0\uFE0F No strata found in Firestore - run migration script");
        }
        return res.json(allStrata);
      }
      console.log("\u{1F464} Regular user access - fetching user strata");
      const userStrata = await firebaseStorage.getUserStrata(user.id);
      console.log(`\u{1F4CA} Found ${userStrata.length} strata for user ${user.id}`);
      if (userStrata.length === 0) {
        console.error("\u26A0\uFE0F No strata found for user - check userStrataAccess collection");
      }
      res.json(userStrata);
    } catch (error) {
      console.error("\u274C Error fetching strata:", error);
      res.status(500).json({ message: "Failed to fetch strata" });
    }
  });
  app3.get("/api/strata/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const strata2 = await firebaseStorage.getStrata(id);
      if (!strata2) {
        return res.status(404).json({ message: "Strata not found" });
      }
      res.json(strata2);
    } catch (error) {
      console.error("Error fetching strata:", error);
      res.status(500).json({ message: "Failed to fetch strata" });
    }
  });
  app3.post("/api/strata", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.authenticatedUser;
      console.log("\u{1F3D7}\uFE0F Creating new strata for user:", user.email);
      const strataData = req.body;
      console.log("\u{1F4CB} Strata data:", JSON.stringify(strataData, null, 2));
      const newStrata = await firebaseStorage.createStrata({
        ...strataData,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      console.log("\u2705 Created strata:", newStrata.id);
      await firebaseStorage.createUserStrataAccess({
        id: `${user.id}_${newStrata.id}`,
        userId: user.id,
        strataId: newStrata.id,
        role: "chairperson",
        canPostAnnouncements: true,
        createdAt: /* @__PURE__ */ new Date()
      });
      console.log("\u2705 Created user access for chairperson");
      res.status(201).json({ id: newStrata.id, ...newStrata });
      const strata2 = await firebaseStorage.createStrata(strataData);
      await firebaseStorage.createUserStrataAccess({
        userId,
        strataId: strata2.id,
        role: "property_manager"
      });
      res.json(strata2);
    } catch (error) {
      console.error("Error creating strata:", error);
      res.status(500).json({ message: "Failed to create strata" });
    }
  });
  app3.post("/api/strata/register", async (req, res) => {
    try {
      const { insertPendingStrataRegistrationSchema: insertPendingStrataRegistrationSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const registrationData = insertPendingStrataRegistrationSchema2.parse(req.body);
      const pendingRegistration = await firebaseStorage.createPendingRegistration(registrationData);
      res.json({
        message: "Registration submitted successfully",
        registrationId: pendingRegistration.id
      });
    } catch (error) {
      console.error("Error submitting registration:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid registration data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to submit registration" });
    }
  });
  app3.get("/api/strata/:id/units", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`\u{1F4CB} Fetching units for strata ${id}`);
      const units2 = await firebaseStorage.getStrataUnits(id);
      console.log(`\u2705 Found ${units2.length} units for strata ${id}`);
      console.log(`\u{1F3E0} Units data:`, units2);
      res.json(units2);
    } catch (error) {
      console.error("\u274C Error fetching units:", error);
      console.error("\u274C Error details:", error.message);
      console.error("\u274C Error stack:", error.stack);
      res.status(500).json({ message: "Failed to fetch units", error: error.message });
    }
  });
  app3.post("/api/strata/:id/units", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`\u{1F4CB} Creating unit for strata ${id}:`, req.body);
      const unitData = insertUnitSchema.parse({
        ...req.body,
        strataId: id
      });
      console.log(`\u2705 Validated unit data:`, unitData);
      const unit = await firebaseStorage.createUnit(unitData);
      console.log(`\u{1F389} Successfully created unit:`, unit);
      res.json(unit);
    } catch (error) {
      console.error("\u274C Error creating unit:", error);
      console.error("\u274C Error details:", error.message);
      console.error("\u274C Error stack:", error.stack);
      res.status(500).json({ message: "Failed to create unit", error: error.message });
    }
  });
  app3.patch("/api/units/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const unit = await firebaseStorage.updateUnit(id, req.body);
      res.json(unit);
    } catch (error) {
      console.error("Error updating unit:", error);
      res.status(500).json({ message: "Failed to update unit" });
    }
  });
  app3.delete("/api/units/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`\u{1F5D1}\uFE0F Deleting unit ${id}`);
      await firebaseStorage.deleteUnit(id);
      console.log(`\u2705 Successfully deleted unit ${id}`);
      res.json({ message: "Unit deleted successfully" });
    } catch (error) {
      console.error("\u274C Error deleting unit:", error);
      res.status(500).json({ message: "Failed to delete unit", error: error.message });
    }
  });
  app3.get("/api/strata/:id/metrics", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const metrics = await firebaseStorage.getStrataMetrics(id);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });
  app3.get("/api/strata/:id/expenses", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const expenses2 = await firebaseStorage.getStrataExpenses(id);
      res.json(expenses2);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });
  app3.post("/api/strata/:id/expenses", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId2 = req.authenticatedUser.id;
      const expenseData = insertExpenseSchema.parse({
        ...req.body,
        strataId: id,
        submittedBy: userId2
      });
      const expense = await firebaseStorage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });
  app3.patch("/api/expenses/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId2 = req.authenticatedUser.id;
      const updateData = { ...req.body };
      console.log("Received update data:", updateData);
      if (req.body.status === "approved") {
        updateData.approvedBy = userId2;
      }
      if (updateData.expenseDate && typeof updateData.expenseDate === "string") {
        updateData.expenseDate = new Date(updateData.expenseDate);
        console.log("Converted expenseDate to:", updateData.expenseDate);
      }
      const expense = await firebaseStorage.updateExpense(id, updateData);
      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(500).json({ message: "Failed to update expense" });
    }
  });
  app3.delete("/api/expenses/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteExpense(id);
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });
  app3.get("/api/strata/:id/quotes", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const quotes2 = await firebaseStorage.getStrataQuotes(id);
      res.json(quotes2);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });
  app3.post("/api/strata/:id/quotes", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId2 = req.authenticatedUser.id;
      const { quoteDocument, ...quoteBodyData } = req.body;
      const quoteData = insertQuoteSchema.parse({
        ...quoteBodyData,
        strataId: id,
        requesterId: userId2
      });
      const projectFolder = await firebaseStorage.createQuoteProjectFolder(id, quoteData.projectTitle, userId2);
      const quoteWithFolder = {
        ...quoteData,
        documentFolderId: projectFolder.id
      };
      const quote = await firebaseStorage.createQuote(quoteWithFolder);
      if (quoteDocument) {
        const documentData = {
          strataId: id,
          folderId: projectFolder.id,
          title: `${quoteData.projectTitle} - Quote Document`,
          description: `Quote document for ${quoteData.projectTitle}`,
          type: "quote",
          fileUrl: quoteDocument.fileUrl,
          fileName: quoteDocument.fileName,
          fileSize: quoteDocument.fileSize,
          mimeType: quoteDocument.mimeType,
          uploadedBy: userId2
        };
        await firebaseStorage.createDocument(documentData);
      }
      res.json(quote);
    } catch (error) {
      console.error("Error creating quote:", error);
      res.status(500).json({ message: "Failed to create quote" });
    }
  });
  app3.patch("/api/quotes/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId2 = req.authenticatedUser.id;
      const { quoteDocument, ...updateBodyData } = req.body;
      const updateData = { ...updateBodyData };
      if (updateData.approvedAt && typeof updateData.approvedAt === "string") {
        updateData.approvedAt = new Date(updateData.approvedAt);
      }
      if (updateData.rejectedAt && typeof updateData.rejectedAt === "string") {
        updateData.rejectedAt = new Date(updateData.rejectedAt);
      }
      if (updateData.reviewedAt && typeof updateData.reviewedAt === "string") {
        updateData.reviewedAt = new Date(updateData.reviewedAt);
      }
      const quote = await firebaseStorage.updateQuote(id, updateData);
      if (quoteDocument && quote.documentFolderId) {
        const documentData = {
          strataId: quote.strataId,
          folderId: quote.documentFolderId,
          title: `${quote.projectTitle} - Additional Document`,
          description: `Additional document for ${quote.projectTitle}`,
          type: "quote",
          fileUrl: quoteDocument.fileUrl,
          fileName: quoteDocument.fileName,
          fileSize: quoteDocument.fileSize,
          mimeType: quoteDocument.mimeType,
          uploadedBy: userId2
        };
        await firebaseStorage.createDocument(documentData);
      }
      res.json(quote);
    } catch (error) {
      console.error("Error updating quote:", error);
      res.status(500).json({ message: "Failed to update quote" });
    }
  });
  app3.get("/api/quotes/:id/documents", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const quote = await firebaseStorage.getQuote(id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      if (!quote.documentFolderId) {
        return res.json([]);
      }
      const documents2 = await firebaseStorage.getFolderDocuments(quote.documentFolderId);
      res.json(documents2);
    } catch (error) {
      console.error("Error fetching quote documents:", error);
      res.status(500).json({ message: "Failed to fetch quote documents" });
    }
  });
  app3.post("/api/quotes/analyze-document", isAuthenticatedUnified, async (req, res) => {
    try {
      const { fileData, mimeType, text: text2 } = req.body;
      if (!fileData && !text2) {
        return res.status(400).json({ message: "Either fileData or text is required" });
      }
      let extractedData;
      if (fileData) {
        const base64Data = fileData.split(",")[1] || fileData;
        if (!mimeType.startsWith("image/") && mimeType !== "application/pdf") {
          return res.status(400).json({
            message: "Only image files (JPG, PNG, GIF, WebP) and PDF files are supported for AI analysis."
          });
        }
        extractedData = await extractQuoteDataFromDocument(base64Data, mimeType);
      } else {
        extractedData = await extractQuoteDataFromText(text2);
      }
      res.json(extractedData);
    } catch (error) {
      console.error("Error analyzing quote document:", error);
      res.status(500).json({
        message: error.message || "Failed to analyze document"
      });
    }
  });
  app3.get("/api/strata/:id/pending-approvals", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const approvals = await firebaseStorage.getPendingApprovals(id);
      res.json(approvals);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      res.status(500).json({ message: "Failed to fetch pending approvals" });
    }
  });
  app3.get("/api/strata/:strataId/vendors", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      const vendors2 = await firebaseStorage.getVendorsByStrata(strataId);
      res.json(vendors2);
    } catch (error) {
      console.error("Error fetching strata vendors:", error);
      res.status(500).json({ message: "Failed to fetch strata vendors" });
    }
  });
  app3.post("/api/strata/:strataId/vendors", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      const vendorData = insertVendorSchema.parse({ ...req.body, strataId });
      const vendor = await firebaseStorage.createVendor(vendorData);
      res.json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });
  app3.get("/api/vendors", isAuthenticatedUnified, async (req, res) => {
    try {
      const vendors2 = await firebaseStorage.getAllVendors();
      res.json(vendors2);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });
  app3.post("/api/vendors", isAuthenticatedUnified, async (req, res) => {
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await firebaseStorage.createVendor(vendorData);
      res.json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });
  app3.get("/api/vendors/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const vendor = await firebaseStorage.getVendor(id);
      res.json(vendor);
    } catch (error) {
      console.error("Error fetching vendor:", error);
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });
  app3.patch("/api/vendors/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const vendor = await firebaseStorage.updateVendor(id, req.body);
      res.json(vendor);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });
  app3.delete("/api/vendors/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteVendor(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });
  app3.get("/api/vendors/:id/contracts", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const contracts = await firebaseStorage.getVendorContracts(id);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching vendor contracts:", error);
      res.status(500).json({ message: "Failed to fetch vendor contracts" });
    }
  });
  app3.get("/api/strata/:id/vendor-contracts", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const contracts = await firebaseStorage.getStrataVendorContracts(id);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching strata vendor contracts:", error);
      res.status(500).json({ message: "Failed to fetch strata vendor contracts" });
    }
  });
  app3.post("/api/vendors/:vendorId/contracts", isAuthenticatedUnified, async (req, res) => {
    try {
      const { vendorId } = req.params;
      const userId2 = req.user.claims.sub;
      const contractData = insertVendorContractSchema.parse({
        ...req.body,
        vendorId,
        createdBy: userId2
      });
      const contract = await firebaseStorage.createVendorContract(contractData);
      res.json(contract);
    } catch (error) {
      console.error("Error creating vendor contract:", error);
      res.status(500).json({ message: "Failed to create vendor contract" });
    }
  });
  app3.get("/api/vendor-contracts/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const contract = await firebaseStorage.getVendorContract(id);
      res.json(contract);
    } catch (error) {
      console.error("Error fetching vendor contract:", error);
      res.status(500).json({ message: "Failed to fetch vendor contract" });
    }
  });
  app3.patch("/api/vendor-contracts/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const contract = await firebaseStorage.updateVendorContract(id, req.body);
      res.json(contract);
    } catch (error) {
      console.error("Error updating vendor contract:", error);
      res.status(500).json({ message: "Failed to update vendor contract" });
    }
  });
  app3.delete("/api/vendor-contracts/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteVendorContract(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vendor contract:", error);
      res.status(500).json({ message: "Failed to delete vendor contract" });
    }
  });
  app3.get("/api/vendors/:id/history", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const history = await firebaseStorage.getVendorHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching vendor history:", error);
      res.status(500).json({ message: "Failed to fetch vendor history" });
    }
  });
  app3.get("/api/strata/:id/vendor-history", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const history = await firebaseStorage.getStrataVendorHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching strata vendor history:", error);
      res.status(500).json({ message: "Failed to fetch strata vendor history" });
    }
  });
  app3.post("/api/vendors/:vendorId/history", isAuthenticatedUnified, async (req, res) => {
    try {
      const { vendorId } = req.params;
      const userId2 = req.user.claims.sub;
      const historyData = insertVendorHistorySchema.parse({
        ...req.body,
        vendorId,
        recordedBy: userId2
      });
      const history = await firebaseStorage.createVendorHistory(historyData);
      res.json(history);
    } catch (error) {
      console.error("Error creating vendor history:", error);
      res.status(500).json({ message: "Failed to create vendor history" });
    }
  });
  app3.patch("/api/vendor-history/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const history = await firebaseStorage.updateVendorHistory(id, req.body);
      res.json(history);
    } catch (error) {
      console.error("Error updating vendor history:", error);
      res.status(500).json({ message: "Failed to update vendor history" });
    }
  });
  app3.delete("/api/vendor-history/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteVendorHistory(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vendor history:", error);
      res.status(500).json({ message: "Failed to delete vendor history" });
    }
  });
  app3.get("/api/strata/:id/meetings", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const meetings2 = await firebaseStorage.getStrataMeetings(id);
      res.json(meetings2);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });
  app3.post("/api/strata/:id/meetings", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const meetingData = insertMeetingSchema.parse({
        ...req.body,
        strataId: id,
        meetingDate: new Date(req.body.meetingDate),
        // Convert string to Date
        scheduledAt: new Date(req.body.scheduledAt)
        // Convert string to Date
      });
      console.log("\u{1F3AF} Creating new meeting:", meetingData.title);
      const meeting = await firebaseStorage.createMeeting(meetingData);
      if (req.body.invitees && req.body.invitees.length > 0) {
        try {
          console.log("\u{1F4E7} Sending meeting invitations to invitees...");
          const strata2 = await firebaseStorage.getStrata(id);
          if (!strata2) {
            console.warn("\u26A0\uFE0F Strata not found for meeting invitations");
          } else {
            const organizerEmail = req.firebaseUser?.email;
            let organizer = null;
            if (organizerEmail) {
              organizer = await firebaseStorage.getUserByEmail(organizerEmail);
            }
            if (!organizer) {
              console.warn("\u26A0\uFE0F Organizer not found for meeting invitations");
              organizer = {
                id: "unknown",
                email: organizerEmail || "unknown@email.com",
                firstName: "Meeting",
                lastName: "Organizer"
              };
            }
            const allUsers = await firebaseStorage.getStrataUsers(id);
            const invitees = req.body.invitees.map(
              (inviteeId) => allUsers.find((user) => user.id === inviteeId)
            ).filter(Boolean);
            if (invitees.length > 0) {
              const { sendMeetingInviteEmails: sendMeetingInviteEmails2 } = await Promise.resolve().then(() => (init_email_service(), email_service_exports));
              await sendMeetingInviteEmails2({
                meeting,
                strata: {
                  name: strata2.name,
                  address: strata2.address || "Address not specified"
                },
                invitees,
                organizer
              });
              console.log(`\u2705 Meeting invitations sent to ${invitees.length} recipients`);
              for (const invitee of invitees) {
                try {
                  const notificationData = {
                    userId: invitee.id,
                    strataId: id,
                    type: "meeting_invitation",
                    title: `\u{1F4C5} Meeting Invitation: ${meeting.title}`,
                    message: `You're invited to ${meeting.title} on ${new Date(meeting.scheduledAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })} at ${new Date(meeting.scheduledAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true
                    })}. Click to view details.`,
                    priority: "high",
                    isRead: false,
                    metadata: {
                      meetingId: meeting.id,
                      meetingTitle: meeting.title,
                      meetingDate: meeting.scheduledAt,
                      organizer: organizer ? `${organizer.firstName} ${organizer.lastName}` : "Meeting Organizer",
                      location: meeting.location || "TBD",
                      type: meeting.meetingType || "general_meeting"
                    },
                    createdAt: (/* @__PURE__ */ new Date()).toISOString()
                  };
                  await firebaseStorage.createNotification(notificationData);
                  console.log(`\u2705 Created notification for ${invitee.email}`);
                } catch (notifError) {
                  console.error(`\u274C Failed to create notification for ${invitee.email}:`, notifError);
                }
              }
            } else {
              console.warn("\u26A0\uFE0F No valid invitees found for meeting invitations");
            }
          }
        } catch (emailError) {
          console.error("\u274C Failed to send meeting invitations:", emailError);
        }
      }
      res.json(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });
  app3.post("/api/meetings/:meetingId/upload-audio", isAuthenticatedUnified, upload.single("audio"), async (req, res) => {
    try {
      const { meetingId } = req.params;
      console.log("\u{1F399}\uFE0F Processing audio upload for meeting:", meetingId);
      if (!req.file) {
        console.log("\u274C No audio file provided in request");
        return res.status(400).json({ message: "No audio file provided" });
      }
      console.log("\u{1F4CA} Audio file details:", {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      });
      console.log("\u{1F50D} Verifying meeting exists...");
      const existingMeeting = await firebaseStorage.getMeeting(meetingId);
      if (!existingMeeting) {
        console.log("\u274C Meeting not found:", meetingId);
        return res.status(404).json({
          message: "Meeting not found. Please refresh the page and try again.",
          meetingId
        });
      }
      console.log("\u2705 Meeting found:", existingMeeting.title);
      const timestamp2 = Date.now();
      const fileName = `meeting_${meetingId}_${timestamp2}.wav`;
      console.log("\u{1F4E4} Uploading audio to Firebase Storage...");
      const audioUrl = await uploadFileToStorage(
        fileName,
        req.file.buffer,
        req.file.mimetype,
        "audio-recordings"
      );
      console.log("\u2705 Audio uploaded to Firebase Storage:", audioUrl);
      console.log("\u{1F4DD} Updating meeting with audio URL...");
      await firebaseStorage.updateMeeting(meetingId, { audioUrl });
      console.log("\u{1F3AF} Starting audio transcription...");
      const { transcribeAudio: transcribeAudio2 } = await Promise.resolve().then(() => (init_openai(), openai_exports));
      const transcription = await transcribeAudio2(req.file.buffer, req.file.originalname);
      console.log("\u2705 Audio transcription completed:", transcription.length, "characters");
      console.log("\u{1F4DD} Updating meeting with transcription...");
      await firebaseStorage.updateMeeting(meetingId, {
        audioUrl,
        transcription,
        status: "completed"
        // Mark meeting as completed after transcription
      });
      console.log("\u{1F389} Audio upload and transcription completed successfully");
      res.json({
        message: "Audio uploaded and transcribed successfully",
        audioUrl,
        transcription
      });
    } catch (error) {
      console.error("\u274C Error uploading/transcribing audio:", error);
      console.error("\u274C Error stack:", error.stack);
      res.status(500).json({
        message: "Failed to upload and transcribe audio",
        error: error.message
      });
    }
  });
  app3.post("/api/meetings/:meetingId/generate-minutes", isAuthenticatedUnified, async (req, res) => {
    try {
      const { meetingId } = req.params;
      const meeting = await firebaseStorage.getMeeting(meetingId);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      if (!meeting.transcription) {
        return res.status(400).json({ message: "No transcription available for this meeting" });
      }
      const { generateMeetingMinutes: generateMeetingMinutes2 } = await Promise.resolve().then(() => (init_openai(), openai_exports));
      const minutes = await generateMeetingMinutes2(
        meeting.transcription,
        meeting.title,
        meeting.meetingType || "board_meeting",
        meeting.chairperson ? meeting.chairperson : void 0,
        meeting.agenda ? meeting.agenda : void 0
      );
      await firebaseStorage.updateMeeting(meetingId, { minutes });
      res.json({
        message: "Meeting minutes generated successfully",
        minutes
      });
    } catch (error) {
      console.error("Error generating meeting minutes:", error);
      res.status(500).json({ message: "Failed to generate meeting minutes" });
    }
  });
  app3.patch("/api/meetings/:meetingId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { meetingId } = req.params;
      const updateData = req.body;
      await firebaseStorage.updateMeeting(meetingId, updateData);
      res.json({ message: "Meeting updated successfully" });
    } catch (error) {
      console.error("Error updating meeting:", error);
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });
  app3.get("/api/strata/:id/documents", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const documents2 = await firebaseStorage.getStrataDocuments(id);
      res.json(documents2);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  app3.post("/api/strata/:id/documents", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId2 = req.user.claims.sub;
      const documentData = insertDocumentSchema.parse({
        ...req.body,
        strataId: id,
        uploadedBy: userId2
      });
      const document = await firebaseStorage.createDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });
  app3.get("/api/strata/:id/maintenance", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const requests = await firebaseStorage.getStrataMaintenanceRequests(id);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      res.status(500).json({ message: "Failed to fetch maintenance requests" });
    }
  });
  app3.post("/api/strata/:id/maintenance", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId2 = req.user.claims.sub;
      const requestData = insertMaintenanceRequestSchema.parse({
        ...req.body,
        strataId: id,
        residentId: userId2
      });
      const request = await firebaseStorage.createMaintenanceRequest(requestData);
      res.json(request);
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      res.status(500).json({ message: "Failed to create maintenance request" });
    }
  });
  app3.patch("/api/maintenance/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const request = await firebaseStorage.updateMaintenanceRequest(id, req.body);
      res.json(request);
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      res.status(500).json({ message: "Failed to update maintenance request" });
    }
  });
  app3.get("/api/strata/:id/maintenance", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const projects = await firebaseStorage.getStrataMaintenanceProjects(id);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching maintenance projects:", error);
      res.status(500).json({ message: "Failed to fetch maintenance projects" });
    }
  });
  app3.post("/api/strata/:id/maintenance", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const projectData = insertMaintenanceProjectSchema.parse({
        ...req.body,
        strataId: id,
        scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : void 0,
        completedDate: req.body.completedDate ? new Date(req.body.completedDate) : void 0,
        nextServiceDate: req.body.nextServiceDate ? new Date(req.body.nextServiceDate) : void 0
      });
      const project = await firebaseStorage.createMaintenanceProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating maintenance project:", error);
      res.status(500).json({ message: "Failed to create maintenance project" });
    }
  });
  app3.get("/api/maintenance/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const project = await firebaseStorage.getMaintenanceProject(id);
      if (!project) {
        return res.status(404).json({ message: "Maintenance project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching maintenance project:", error);
      res.status(500).json({ message: "Failed to fetch maintenance project" });
    }
  });
  app3.patch("/api/maintenance/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : void 0,
        completedDate: req.body.completedDate ? new Date(req.body.completedDate) : void 0,
        nextServiceDate: req.body.nextServiceDate ? new Date(req.body.nextServiceDate) : void 0
      };
      const project = await firebaseStorage.updateMaintenanceProject(id, updateData);
      res.json(project);
    } catch (error) {
      console.error("Error updating maintenance project:", error);
      res.status(500).json({ message: "Failed to update maintenance project" });
    }
  });
  app3.delete("/api/maintenance/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteMaintenanceProject(id);
      res.json({ message: "Maintenance project deleted successfully" });
    } catch (error) {
      console.error("Error deleting maintenance project:", error);
      res.status(500).json({ message: "Failed to delete maintenance project" });
    }
  });
  app3.get("/api/strata/:id/announcements", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const announcements2 = await firebaseStorage.getStrataAnnouncements(id);
      res.json(announcements2);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });
  app3.post("/api/strata/:id/announcements", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId2 = req.authenticatedUser.id;
      const announcementData = insertAnnouncementSchema.parse({
        ...req.body,
        strataId: id,
        publishedBy: userId2,
        recurringEndDate: req.body.recurringEndDate ? new Date(req.body.recurringEndDate) : void 0
      });
      const announcement = await firebaseStorage.createAnnouncement(announcementData);
      res.json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });
  app3.patch("/api/announcements/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId2 = req.authenticatedUser.id;
      const announcement = await firebaseStorage.getAnnouncement(id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      const userAccess = await firebaseStorage.getUserStrataAccess(userId2, announcement.strataId);
      const canEdit = announcement.publishedBy === userId2 || userAccess?.role === "admin" || userAccess?.role === "chairperson";
      if (!canEdit) {
        return res.status(403).json({ message: "Permission denied" });
      }
      const updatedAnnouncement = await firebaseStorage.updateAnnouncement(id, req.body);
      res.json(updatedAnnouncement);
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });
  app3.delete("/api/announcements/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId2 = req.user.claims.sub;
      const announcement = await firebaseStorage.getAnnouncement(id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      const userAccess = await firebaseStorage.getUserStrataAccess(userId2, announcement.strataId);
      const canDelete = announcement.publishedBy === userId2 || userAccess?.role === "admin" || userAccess?.role === "chairperson";
      if (!canDelete) {
        return res.status(403).json({ message: "Permission denied" });
      }
      await firebaseStorage.deleteAnnouncement(id);
      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });
  app3.get("/api/strata/:id/users", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const users2 = await firebaseStorage.getStrataUsers(id);
      console.log(`Fetched strata users:`, JSON.stringify(users2, null, 2));
      res.json(users2);
    } catch (error) {
      console.error("Error fetching strata users:", error);
      res.status(500).json({ message: "Failed to fetch strata users" });
    }
  });
  app3.get("/api/strata/:id/user-role", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userEmail = req.firebaseUser?.email || req.authenticatedUser?.email || req.user?.email;
      console.log("\u{1F50D} User role check:", {
        strataId: id,
        userEmail,
        firebaseUser: req.firebaseUser?.email,
        authenticatedUser: req.authenticatedUser?.email,
        pgUser: req.user?.email
      });
      if (!userEmail) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      if (userEmail === "rfinnbogason@gmail.com") {
        console.log("\u2705 Master admin detected, returning master_admin role");
        return res.json({ role: "master_admin" });
      }
      let user;
      let userAccess;
      try {
        const pgUser = await firebaseStorage.getUserByEmail(userEmail);
        if (pgUser) {
          let firebaseUser;
          try {
            firebaseUser = await firebaseStorage.getUserByEmail(userEmail);
          } catch (err) {
            console.log("\u{1F504} User not in Firebase, migrating from PostgreSQL...");
          }
          if (!firebaseUser) {
            firebaseUser = await firebaseStorage.createUser({
              email: pgUser.email,
              firstName: pgUser.firstName,
              lastName: pgUser.lastName,
              profileImageUrl: pgUser.profileImageUrl,
              passwordHash: pgUser.passwordHash,
              isActive: pgUser.isActive,
              lastLoginAt: pgUser.lastLoginAt,
              role: pgUser.role,
              mustChangePassword: pgUser.mustChangePassword || false
            });
            console.log("\u2705 Migrated user to Firebase:", firebaseUser.email);
          }
          try {
            let firebaseAccess = await firebaseStorage.getUserStrataAccess(firebaseUser.id, id);
            if (!firebaseAccess) {
              const pgAccess = await firebaseStorage.getUserStrataAccess(pgUser.id, id);
              if (pgAccess) {
                firebaseAccess = await firebaseStorage.createUserStrataAccess({
                  userId: firebaseUser.id,
                  strataId: pgAccess.strataId,
                  role: pgAccess.role,
                  canPostAnnouncements: pgAccess.canPostAnnouncements || false
                });
                console.log("\u2705 Migrated user access to Firebase:", firebaseAccess.role);
              }
            }
            userAccess = firebaseAccess;
          } catch (err) {
            console.log("\u26A0\uFE0F Firebase access lookup failed, using PostgreSQL");
            userAccess = await firebaseStorage.getUserStrataAccess(pgUser.id, id);
          }
          user = firebaseUser;
        }
      } catch (error) {
        console.log("\u274C Migration attempt failed:", error.message);
        const pgUser = await firebaseStorage.getUserByEmail(userEmail);
        if (!pgUser) {
          return res.json({ role: "resident" });
        }
        const pgAccess = await firebaseStorage.getUserStrataAccess(pgUser.id, id);
        userAccess = pgAccess;
        user = pgUser;
      }
      if (!userAccess) {
        console.log("\u{1F3E0} No strata access found, defaulting to resident");
        return res.json({ role: "resident" });
      }
      console.log("\u2705 Returning role:", userAccess.role);
      res.set("Cache-Control", "no-store");
      res.json({ role: userAccess.role });
    } catch (error) {
      console.error("\u274C Error fetching user role:", error);
      res.status(500).json({ message: "Failed to fetch user role" });
    }
  });
  app3.post("/api/strata/:id/users", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const accessData = insertUserStrataAccessSchema.parse({
        ...req.body,
        strataId: id
      });
      const userAccess = await firebaseStorage.createUserStrataAccess(accessData);
      res.json(userAccess);
    } catch (error) {
      console.error("Error adding user to strata:", error);
      res.status(500).json({ message: "Failed to add user" });
    }
  });
  app3.patch("/api/strata-access/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userAccess = await firebaseStorage.updateUserStrataAccess(id, req.body);
      res.json(userAccess);
    } catch (error) {
      console.error("Error updating user access:", error);
      res.status(500).json({ message: "Failed to update user access" });
    }
  });
  app3.delete("/api/strata-access/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteUserStrataAccess(id);
      res.json({ message: "User access removed successfully" });
    } catch (error) {
      console.error("Error removing user access:", error);
      res.status(500).json({ message: "Failed to remove user access" });
    }
  });
  app3.get("/api/admin/users/:userId/strata-assignments", isAuthenticatedUnified, async (req, res) => {
    try {
      if (req.firebaseUser?.email !== "rfinnbogason@gmail.com" && req.authenticatedUser?.email !== "rfinnbogason@gmail.com" && req.user?.claims?.email !== "rfinnbogason@gmail.com") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      const { userId: userId2 } = req.params;
      const assignments = await firebaseStorage.getUserStrataAssignments(userId2);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching user strata assignments:", error);
      res.status(500).json({ message: "Failed to fetch user strata assignments" });
    }
  });
  app3.delete("/api/strata-admin/users/:userId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { userId: userId2 } = req.params;
      await firebaseStorage.deleteUserStrataAccess(userId2);
      res.json({ message: "User access removed successfully" });
    } catch (error) {
      console.error("Error removing user access:", error);
      res.status(500).json({ message: "Failed to remove user access" });
    }
  });
  app3.patch("/api/strata-admin/users/:userId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { userId: userId2 } = req.params;
      const updatedUser = await firebaseStorage.updateUser(userId2, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app3.patch("/api/strata-admin/role/:accessId", isAuthenticatedUnified, async (req, res) => {
    console.log("PATCH /api/strata-admin/role/:accessId endpoint reached");
    console.log("Access ID:", req.params.accessId);
    console.log("Request body:", req.body);
    try {
      const { accessId } = req.params;
      const updatedAccess = await firebaseStorage.updateUserStrataAccess(accessId, req.body);
      console.log("Successfully updated access:", updatedAccess);
      res.json(updatedAccess);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
  app3.post("/api/strata-admin/users", isAuthenticatedUnified, async (req, res) => {
    try {
      const { email, firstName, lastName, role, temporaryPassword, strataId } = req.body;
      let user = await firebaseStorage.getUserByEmail(email);
      if (!user) {
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        user = await firebaseStorage.createUser({
          email,
          firstName,
          lastName,
          passwordHash: hashedPassword,
          isActive: true,
          role: role || "resident",
          mustChangePassword: true
          // Force password change on first login
        });
      }
      const userAccess = await firebaseStorage.createUserStrataAccess({
        userId: user.id,
        strataId,
        role: role || "resident"
      });
      res.json({ user, userAccess });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app3.get("/api/admin/pending-registrations", isAuthenticatedUnified, async (req, res) => {
    try {
      if (req.firebaseUser?.email !== "rfinnbogason@gmail.com" && req.authenticatedUser?.email !== "rfinnbogason@gmail.com" && req.user?.claims?.email !== "rfinnbogason@gmail.com") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      const registrations = await firebaseStorage.getPendingRegistrations();
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching pending registrations:", error);
      res.status(500).json({ message: "Failed to fetch pending registrations" });
    }
  });
  app3.post("/api/admin/pending-registrations/:id/approve", isAuthenticatedUnified, async (req, res) => {
    try {
      if (req.firebaseUser?.email !== "rfinnbogason@gmail.com" && req.authenticatedUser?.email !== "rfinnbogason@gmail.com" && req.user?.claims?.email !== "rfinnbogason@gmail.com") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      const { id } = req.params;
      const subscriptionData = req.body;
      let trialEndDate = null;
      if (subscriptionData.subscriptionTier === "trial") {
        trialEndDate = /* @__PURE__ */ new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30);
      }
      const fullSubscriptionData = {
        ...subscriptionData,
        subscriptionStatus: subscriptionData.subscriptionTier === "trial" ? "trial" : subscriptionData.isFreeForever ? "free" : "active",
        trialEndDate
      };
      await firebaseStorage.approveStrataRegistration(id, fullSubscriptionData);
      res.json({ message: "Registration approved successfully with subscription settings" });
    } catch (error) {
      console.error("Error approving registration:", error);
      res.status(500).json({ message: "Failed to approve registration" });
    }
  });
  app3.post("/api/admin/pending-registrations/:id/reject", isAuthenticatedUnified, async (req, res) => {
    try {
      if (req.firebaseUser?.email !== "rfinnbogason@gmail.com" && req.authenticatedUser?.email !== "rfinnbogason@gmail.com" && req.user?.claims?.email !== "rfinnbogason@gmail.com") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      const { id } = req.params;
      await firebaseStorage.rejectStrataRegistration(id);
      res.json({ message: "Registration rejected successfully" });
    } catch (error) {
      console.error("Error rejecting registration:", error);
      res.status(500).json({ message: "Failed to reject registration" });
    }
  });
  app3.post("/api/strata-admin/users", isAuthenticatedUnified, async (req, res) => {
    try {
      const userData = req.body;
      const strataId = userData.strataId;
      if (!strataId) {
        return res.status(400).json({ message: "Strata ID is required" });
      }
      const hasAccess = await firebaseStorage.checkUserStrataAdminAccess(req.user.claims.sub, strataId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden: Admin access required for this strata" });
      }
      const hashedPassword = await bcrypt.hash(userData.temporaryPassword, 10);
      const newUser = await firebaseStorage.createUser({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        passwordHash: hashedPassword,
        isActive: true
      });
      await firebaseStorage.createUserStrataAccess({
        userId: newUser.id,
        strataId,
        role: userData.role,
        canPostAnnouncements: ["chairperson", "secretary"].includes(userData.role)
      });
      res.json({ message: "User created successfully", user: newUser });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app3.patch("/api/strata-admin/users/:userId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { userId: userId2 } = req.params;
      const userData = req.body;
      const userAccess = await firebaseStorage.getUserStrataAssignments(req.user.claims.sub);
      const adminStrataIds = userAccess.filter((access) => ["chairperson", "property_manager", "treasurer", "secretary"].includes(access.role)).map((access) => access.strataId);
      if (adminStrataIds.length === 0) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      const updatedUser = await firebaseStorage.updateUser(userId2, userData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app3.patch("/api/strata-admin/user-access/:accessId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { accessId } = req.params;
      const accessData = req.body;
      const currentAccess = await firebaseStorage.getUserStrataAccessById(accessId);
      if (!currentAccess) {
        return res.status(404).json({ message: "Access record not found" });
      }
      const hasAccess = await firebaseStorage.checkUserStrataAdminAccess(req.user.claims.sub, currentAccess.strataId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden: Admin access required for this strata" });
      }
      const updatedAccess = await firebaseStorage.updateUserStrataAccess(accessId, accessData);
      res.json(updatedAccess);
    } catch (error) {
      console.error("Error updating user access:", error);
      res.status(500).json({ message: "Failed to update user access" });
    }
  });
  app3.delete("/api/strata-admin/users/:userId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { userId: userId2 } = req.params;
      const userAccess = await firebaseStorage.getUserStrataAssignments(req.user.claims.sub);
      const adminStrataIds = userAccess.filter((access) => ["chairperson", "property_manager", "treasurer", "secretary"].includes(access.role)).map((access) => access.strataId);
      if (adminStrataIds.length === 0) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      await firebaseStorage.removeUserFromAllStrata(userId2);
      await firebaseStorage.updateUser(userId2, { isActive: false });
      res.json({ message: "User removed successfully" });
    } catch (error) {
      console.error("Error removing user:", error);
      res.status(500).json({ message: "Failed to remove user" });
    }
  });
  app3.get("/api/strata/:id/document-folders", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const { parent } = req.query;
      console.log(`\u{1F50D} GET document-folders for strata ${id}, parent: ${parent || "null"}`);
      const folders = await firebaseStorage.getStrataDocumentFolders(id, parent);
      console.log(`\u{1F4C1} Route returning ${folders?.length || 0} folders:`, folders);
      res.json(folders);
    } catch (error) {
      console.error("Error fetching document folders:", error);
      res.status(500).json({ message: "Failed to fetch document folders" });
    }
  });
  app3.post("/api/strata/:id/document-folders", isAuthenticatedUnified, async (req, res) => {
    try {
      console.log("\u{1F4C1} Creating document folder...");
      console.log("Strata ID:", req.params.id);
      console.log("Request body:", req.body);
      console.log("User claims:", req.user?.claims);
      const { id } = req.params;
      const userId2 = req.user?.claims?.sub || req.user?.claims?.email || "unknown";
      let path4 = `/${req.body.name}`;
      if (req.body.parentFolderId) {
        const parentFolder = await firebaseStorage.getDocumentFolder(req.body.parentFolderId);
        if (parentFolder) {
          path4 = `${parentFolder.path}/${req.body.name}`;
        }
      }
      const folderData = {
        ...req.body,
        strataId: id,
        createdBy: userId2,
        path: path4
      };
      console.log("Creating folder with data:", folderData);
      const folder = await firebaseStorage.createDocumentFolder(folderData);
      console.log("\u2705 Folder created successfully:", folder);
      res.json(folder);
    } catch (error) {
      console.error("\u274C Error creating document folder:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: "Failed to create document folder" });
    }
  });
  app3.patch("/api/document-folders/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const folder = await firebaseStorage.updateDocumentFolder(id, req.body);
      res.json(folder);
    } catch (error) {
      console.error("Error updating document folder:", error);
      res.status(500).json({ message: "Failed to update document folder" });
    }
  });
  app3.delete("/api/document-folders/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteDocumentFolder(id);
      res.json({ message: "Document folder deleted successfully" });
    } catch (error) {
      console.error("Error deleting document folder:", error);
      res.status(500).json({ message: "Failed to delete document folder" });
    }
  });
  app3.get("/api/strata/:id/documents", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const { folder, search } = req.query;
      let documents2;
      if (search) {
        documents2 = await firebaseStorage.searchDocuments(id, search);
      } else if (folder) {
        documents2 = await firebaseStorage.getFolderDocuments(folder);
      } else {
        documents2 = await firebaseStorage.getStrataDocuments(id);
      }
      res.json(documents2);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  app3.post("/api/strata/:id/documents", upload.single("file"), async (req, res) => {
    console.log("\u{1F6A8}\u{1F6A8}\u{1F6A8} SIMPLIFIED UPLOAD ROUTE REACHED! \u{1F6A8}\u{1F6A8}\u{1F6A8}");
    console.log("\u{1F4CB} Upload details:", {
      method: req.method,
      path: req.path,
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      authHeader: req.headers.authorization ? "PRESENT" : "MISSING"
    });
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("\u274C No auth header found");
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const token = authHeader.substring(7);
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
      if (payload.email !== "rfinnbogason@gmail.com") {
        console.log("\u274C Not master admin");
        return res.status(403).json({ message: "Access denied" });
      }
      console.log("\u2705 Master admin authenticated");
    } catch (authError) {
      console.log("\u274C Auth token invalid:", authError);
      return res.status(401).json({ message: "Invalid token" });
    }
    if (!req.file) {
      console.log("\u274C No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }
    try {
      const { id } = req.params;
      const userId2 = "master-admin";
      const file = req.file;
      console.log(`\u{1F50D} Document upload attempt:`, {
        strataId: id,
        userId: userId2,
        fileName: file?.originalname,
        fileSize: file?.size,
        formData: Object.keys(req.body)
      });
      if (!file) {
        console.log("\u274C No file uploaded");
        return res.status(400).json({ message: "No file uploaded" });
      }
      console.log(`\u{1F4E4} Uploading file to Firebase Storage...`);
      const fileName = `${Date.now()}_${file.originalname}`;
      const folder = `documents/${id}`;
      const fileUrl = await uploadFileToStorage(fileName, file.buffer, file.mimetype, folder);
      console.log(`\u2705 File uploaded to Firebase Storage: ${fileUrl}`);
      const documentData = {
        title: req.body.title,
        description: req.body.description || "",
        type: req.body.type,
        tags: req.body.tags ? req.body.tags.split(",").map((tag) => tag.trim()) : [],
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileUrl,
        folderId: req.body.folderId || null,
        strataId: id,
        uploadedBy: userId2
      };
      console.log(`\u{1F4BE} Creating document record in Firestore...`);
      const document = await firebaseStorage.createDocument(documentData);
      console.log(`\u{1F4C4} Document uploaded successfully: ${file.originalname} (${file.size} bytes) for strata ${id}`);
      res.json(document);
    } catch (error) {
      console.error("\u274C Error creating document:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: "Failed to create document" });
    }
  });
  app3.patch("/api/documents/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const document = await firebaseStorage.updateDocument(id, req.body);
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });
  app3.delete("/api/documents/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteDocument(id);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });
  app3.get("/api/strata/:id/search", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const { q: searchTerm, type } = req.query;
      if (!searchTerm) {
        return res.json({ folders: [], documents: [] });
      }
      let results = { folders: [], documents: [] };
      if (!type || type === "folders") {
        results.folders = await firebaseStorage.searchDocumentFolders(id, searchTerm);
      }
      if (!type || type === "documents") {
        results.documents = await firebaseStorage.searchDocuments(id, searchTerm);
      }
      res.json(results);
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ message: "Failed to search" });
    }
  });
  app3.get("/api/financial/fees/:strataId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      const strata2 = await firebaseStorage.getStrata(strataId);
      if (!strata2) {
        return res.status(404).json({ message: "Strata not found" });
      }
      res.json({
        strataId,
        feeStructure: strata2.feeStructure || {},
        lastUpdated: strata2.updatedAt
      });
    } catch (error) {
      console.error("Error fetching fees:", error);
      res.status(500).json({ message: "Failed to fetch fees" });
    }
  });
  app3.post("/api/financial/fees", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId, feeStructure } = req.body;
      const updatedStrata = await firebaseStorage.updateStrata(strataId, { feeStructure });
      res.json(updatedStrata);
    } catch (error) {
      console.error("Error updating fees:", error);
      res.status(500).json({ message: "Failed to update fees" });
    }
  });
  app3.get("/api/financial/summary/:strataId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      const expenses2 = await firebaseStorage.getStrataExpenses(strataId);
      const strata2 = await firebaseStorage.getStrata(strataId);
      const units2 = await firebaseStorage.getStrataUnits(strataId);
      const totalExpenses = expenses2.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      const pendingExpenses = expenses2.filter((e) => e.status === "pending").length;
      const approvedExpenses = expenses2.filter((e) => e.status === "approved").length;
      const feeStructure = strata2?.feeStructure || {};
      let monthlyRevenue = 0;
      let feeTiers = [];
      if (feeStructure.tiers && Array.isArray(feeStructure.tiers)) {
        feeTiers = feeStructure.tiers;
      } else {
        feeTiers = Object.entries(feeStructure).map(([id, amount]) => ({
          id,
          amount: typeof amount === "number" ? amount : 0
        }));
      }
      feeTiers.forEach((tier) => {
        const unitsInTier = units2.filter((unit) => unit.feeTierId === tier.id);
        const tierAmount = tier.amount || 0;
        monthlyRevenue += unitsInTier.length * tierAmount;
      });
      const funds2 = await firebaseStorage.getStrataFunds(strataId);
      const reserveFund = funds2.find((f) => f.type === "reserve");
      const reserveBalance = reserveFund ? parseFloat(reserveFund.balance) : 125e3;
      const reserveTarget = reserveFund?.target ? parseFloat(reserveFund.target) : 15e4;
      res.json({
        totalRevenue: monthlyRevenue * 12,
        // Annual revenue
        monthlyRevenue,
        // Monthly revenue
        monthlyExpenses: totalExpenses,
        reserveFund: reserveBalance,
        reserveTarget,
        pendingExpenses,
        approvedExpenses,
        outstandingFees: monthlyRevenue * 0.1
        // 10% outstanding
      });
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });
  app3.get("/api/financial/reminders/:strataId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      const reminders = await firebaseStorage.getStrataPaymentReminders(strataId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching payment reminders:", error);
      res.status(500).json({ message: "Failed to fetch payment reminders" });
    }
  });
  app3.post("/api/financial/reminders", isAuthenticatedUnified, async (req, res) => {
    try {
      const reminderData = insertPaymentReminderSchema.parse({
        ...req.body,
        createdBy: req.authenticatedUser.id
      });
      if (reminderData.reminderType === "monthly_strata_fee" && !reminderData.unitId) {
        const units2 = await firebaseStorage.getStrataUnits(reminderData.strataId);
        const createdReminders = [];
        for (const unit of units2) {
          const unitReminder = await firebaseStorage.createPaymentReminder({
            ...reminderData,
            unitId: unit.id,
            title: `${reminderData.title} - Unit ${unit.unitNumber}`
          });
          createdReminders.push(unitReminder);
        }
        res.status(201).json({
          message: `Created ${createdReminders.length} reminders`,
          reminders: createdReminders
        });
      } else {
        const reminder = await firebaseStorage.createPaymentReminder(reminderData);
        res.status(201).json(reminder);
      }
    } catch (error) {
      console.error("Error creating payment reminder:", error);
      res.status(500).json({ message: "Failed to create payment reminder" });
    }
  });
  app3.put("/api/financial/reminders/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const reminderData = insertPaymentReminderSchema.partial().parse(req.body);
      const reminder = await firebaseStorage.updatePaymentReminder(id, reminderData);
      res.json(reminder);
    } catch (error) {
      console.error("Error updating payment reminder:", error);
      res.status(500).json({ message: "Failed to update payment reminder" });
    }
  });
  app3.delete("/api/financial/reminders/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deletePaymentReminder(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting payment reminder:", error);
      res.status(500).json({ message: "Failed to delete payment reminder" });
    }
  });
  app3.get("/api/financial/reminders/:strataId/overdue", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      const overdueReminders = await firebaseStorage.getOverdueReminders(strataId);
      res.json(overdueReminders);
    } catch (error) {
      console.error("Error fetching overdue reminders:", error);
      res.status(500).json({ message: "Failed to fetch overdue reminders" });
    }
  });
  app3.get("/api/financial/reminders/:strataId/recurring", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      const recurringReminders = await firebaseStorage.getActiveRecurringReminders(strataId);
      res.json(recurringReminders);
    } catch (error) {
      console.error("Error fetching recurring reminders:", error);
      res.status(500).json({ message: "Failed to fetch recurring reminders" });
    }
  });
  app3.get("/api/strata/:id/funds", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      let funds2 = await firebaseStorage.getStrataFunds(id);
      if (funds2.length === 0) {
        const defaultFunds = [
          {
            strataId: id,
            name: "Reserve Fund",
            type: "reserve",
            balance: "125000.00",
            target: "150000.00",
            interestRate: "2.5",
            compoundingFrequency: "monthly",
            institution: "TD Bank",
            accountNumber: "****1234",
            notes: "Main reserve fund for major repairs and replacements"
          },
          {
            strataId: id,
            name: "Contingency Fund",
            type: "emergency",
            balance: "45000.00",
            target: "75000.00",
            interestRate: "1.8",
            compoundingFrequency: "monthly",
            institution: "TD Bank",
            accountNumber: "****5678",
            notes: "Emergency fund for unexpected expenses"
          },
          {
            strataId: id,
            name: "Operating Fund",
            type: "operating",
            balance: "15500.00",
            target: "25000.00",
            interestRate: "1.2",
            compoundingFrequency: "monthly",
            institution: "TD Bank",
            accountNumber: "****9012",
            notes: "Monthly operating expenses and maintenance"
          }
        ];
        for (const fundData of defaultFunds) {
          try {
            await firebaseStorage.createFund(fundData);
          } catch (error) {
            console.error("Error creating default fund:", error);
          }
        }
        funds2 = await firebaseStorage.getStrataFunds(id);
      }
      res.json(funds2);
    } catch (error) {
      console.error("Error fetching funds:", error);
      res.status(500).json({ message: "Failed to fetch funds" });
    }
  });
  app3.post("/api/strata/:id/funds", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const fundData = insertFundSchema.parse({
        ...req.body,
        strataId: id
      });
      const fund = await firebaseStorage.createFund(fundData);
      res.json(fund);
    } catch (error) {
      console.error("Error creating fund:", error);
      res.status(500).json({ message: "Failed to create fund" });
    }
  });
  app3.patch("/api/funds/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const fund = await firebaseStorage.updateFund(id, req.body);
      res.json(fund);
    } catch (error) {
      console.error("Error updating fund:", error);
      res.status(500).json({ message: "Failed to update fund" });
    }
  });
  app3.delete("/api/funds/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteFund(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting fund:", error);
      res.status(500).json({ message: "Failed to delete fund" });
    }
  });
  app3.get("/api/funds/:id/transactions", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const transactions = await firebaseStorage.getFundTransactions(id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching fund transactions:", error);
      res.status(500).json({ message: "Failed to fetch fund transactions" });
    }
  });
  app3.post("/api/funds/:id/transactions", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId2 = req.authenticatedUser.id;
      const transactionData = insertFundTransactionSchema.parse({
        ...req.body,
        fundId: id,
        processedBy: userId2
      });
      const transaction = await firebaseStorage.createFundTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating fund transaction:", error);
      res.status(500).json({ message: "Failed to create fund transaction" });
    }
  });
  app3.get("/api/funds/:id/projections", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const years = parseInt(req.query.years) || 5;
      const projections = await firebaseStorage.calculateFundProjections(id, years);
      res.json(projections);
    } catch (error) {
      console.error("Error calculating fund projections:", error);
      res.status(500).json({ message: "Failed to calculate fund projections" });
    }
  });
  app3.get("/api/strata/:strataId/meetings", isAuthenticatedUnified, async (req, res) => {
    try {
      const meetings2 = await firebaseStorage.getStrataMeetings(req.params.strataId);
      res.json(meetings2);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });
  app3.post("/api/strata/:strataId/meetings", isAuthenticatedUnified, async (req, res) => {
    try {
      const meetingData = {
        ...req.body,
        strataId: req.params.strataId
      };
      if (meetingData.scheduledDate) {
        meetingData.scheduledDate = new Date(meetingData.scheduledDate);
      }
      const meeting = await firebaseStorage.createMeeting(meetingData);
      res.json(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });
  app3.get("/api/meetings/:meetingId", isAuthenticatedUnified, async (req, res) => {
    try {
      const meeting = await firebaseStorage.getMeeting(req.params.meetingId);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error) {
      console.error("Error fetching meeting:", error);
      res.status(500).json({ message: "Failed to fetch meeting" });
    }
  });
  app3.patch("/api/meetings/:meetingId", isAuthenticatedUnified, async (req, res) => {
    try {
      const updateData = { ...req.body };
      if (updateData.scheduledDate) {
        updateData.scheduledDate = new Date(updateData.scheduledDate);
      }
      const meeting = await firebaseStorage.updateMeeting(req.params.meetingId, updateData);
      res.json(meeting);
    } catch (error) {
      console.error("Error updating meeting:", error);
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });
  app3.delete("/api/meetings/:meetingId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { meetingId } = req.params;
      console.log("\u{1F5D1}\uFE0F Deleting meeting:", meetingId);
      const meeting = await firebaseStorage.getMeeting(meetingId);
      if (!meeting) {
        console.log("\u274C Meeting not found:", meetingId);
        return res.status(404).json({
          message: "Meeting not found. Please refresh the page and try again.",
          meetingId
        });
      }
      await firebaseStorage.deleteMeeting(meetingId);
      console.log("\u2705 Meeting deleted successfully:", meetingId);
      res.json({ message: "Meeting deleted successfully" });
    } catch (error) {
      console.error("Error deleting meeting:", error);
      res.status(500).json({ message: "Failed to delete meeting" });
    }
  });
  app3.post("/api/meetings/upload-recording", isAuthenticatedUnified, async (req, res) => {
    try {
      const { meetingId } = req.body;
      const audioUrl = `/api/recordings/${meetingId}.wav`;
      await firebaseStorage.updateMeeting(meetingId, {
        audioUrl,
        status: "completed"
      });
      res.json({ message: "Recording uploaded successfully", audioUrl });
    } catch (error) {
      console.error("Error uploading recording:", error);
      res.status(500).json({ message: "Failed to upload recording" });
    }
  });
  app3.get("/api/admin/strata", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      console.log("\u{1F451} Admin fetching all strata organizations");
      const strata2 = await firebaseStorage.getAllStrata();
      console.log(`\u{1F4CA} Admin found ${strata2.length} strata organizations`);
      res.json(strata2);
    } catch (error) {
      console.error("\u274C Admin strata fetch failed:", error);
      res.status(500).json({ message: "Failed to fetch strata" });
    }
  });
  app3.post("/api/admin/strata", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const userId2 = req.user.claims.sub;
      const strataData = {
        ...req.body,
        createdBy: userId2
      };
      const strata2 = await firebaseStorage.createStrata(strataData);
      res.json(strata2);
    } catch (error) {
      console.error("Error creating strata:", error);
      res.status(500).json({ message: "Failed to create strata" });
    }
  });
  app3.patch("/api/admin/strata/:id", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const strata2 = await firebaseStorage.updateStrata(id, req.body);
      res.json(strata2);
    } catch (error) {
      console.error("Error updating strata:", error);
      res.status(500).json({ message: "Failed to update strata" });
    }
  });
  app3.delete("/api/admin/strata/:id", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteStrata(id);
      res.json({ message: "Strata and all associated data deleted successfully" });
    } catch (error) {
      console.error("Error deleting strata:", error);
      res.status(500).json({ message: "Failed to delete strata" });
    }
  });
  app3.get("/api/admin/strata/:id", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const strata2 = await firebaseStorage.getStrata(id);
      if (!strata2) {
        return res.status(404).json({ message: "Strata not found" });
      }
      res.json(strata2);
    } catch (error) {
      console.error("Error fetching strata:", error);
      res.status(500).json({ message: "Failed to fetch strata" });
    }
  });
  app3.patch("/api/admin/strata/:id/subscription", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { subscriptionTier, monthlyRate, isFreeForever } = req.body;
      let trialEndDate = null;
      if (subscriptionTier === "trial") {
        trialEndDate = /* @__PURE__ */ new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30);
      }
      const subscriptionData = {
        subscriptionTier,
        monthlyRate,
        isFreeForever,
        subscriptionStatus: subscriptionTier === "trial" ? "trial" : isFreeForever ? "free" : "active",
        trialEndDate
      };
      const strata2 = await firebaseStorage.updateStrata(id, subscriptionData);
      res.json(strata2);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });
  app3.get("/api/admin/users", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const users2 = await firebaseStorage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app3.post("/api/admin/users", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      console.log("Admin user creation - Request body:", req.body);
      console.log("Admin user creation - Firebase user:", req.firebaseUser);
      console.log("Admin user creation - Authenticated user:", req.authenticatedUser);
      const { email, firstName, lastName, role, temporaryPassword } = req.body;
      const existingUser = await firebaseStorage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      const passwordHash = await bcrypt.hash(temporaryPassword, 10);
      const user = await firebaseStorage.createUser({
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        profileImageUrl: null,
        role: role || "resident",
        isActive: true,
        passwordHash,
        mustChangePassword: true
        // Force password change on first login
      });
      try {
        const { userMigration: userMigration2 } = await Promise.resolve().then(() => (init_firebase_user_migration(), firebase_user_migration_exports));
        const pgUser = {
          id: user.id,
          email: user.email || "",
          first_name: user.firstName || "",
          last_name: user.lastName || "",
          role: user.role,
          is_active: user.isActive !== false,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        const firebaseResult = await userMigration2.createFirebaseUser(pgUser, temporaryPassword);
        console.log("Firebase user creation result:", firebaseResult);
        res.json({
          ...user,
          firebaseCreated: firebaseResult.status === "success",
          firebaseUid: firebaseResult.firebaseUid,
          temporaryPassword: firebaseResult.tempPassword
        });
      } catch (firebaseError) {
        console.error("Error creating Firebase user:", firebaseError);
        res.json({
          ...user,
          firebaseCreated: false,
          firebaseError: firebaseError.message
        });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app3.patch("/api/admin/users/:userId", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { userId: userId2 } = req.params;
      const { email, firstName, lastName, role, isActive, resetPassword, newPassword } = req.body;
      const updateData = {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role || "resident",
        isActive: isActive !== void 0 ? isActive : true,
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (resetPassword && newPassword) {
        updateData.passwordHash = await bcrypt.hash(newPassword, 10);
      }
      const user = await firebaseStorage.updateUser(userId2, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app3.delete("/api/admin/users/:userId", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      console.log("DELETE user request - userId:", req.params.userId);
      console.log("DELETE user request - user:", req.user?.email || req.firebaseUser?.email);
      const { userId: userId2 } = req.params;
      const user = await firebaseStorage.getUser(userId2);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log("Deleting user:", user.email);
      await firebaseStorage.deleteUser(userId2);
      console.log("User deleted successfully:", user.email);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app3.get("/api/admin/strata/:strataId/users", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { strataId } = req.params;
      const users2 = await firebaseStorage.getStrataUsers(strataId);
      console.log("Fetched strata users:", JSON.stringify(users2, null, 2));
      res.json(users2);
    } catch (error) {
      console.error("Error fetching strata users:", error);
      res.status(500).json({ message: "Failed to fetch strata users" });
    }
  });
  app3.post("/api/test-post", (req, res) => {
    console.log("\u{1F7E2} TEST POST ROUTE HIT - Server is receiving POST requests!");
    res.json({ message: "POST test successful" });
  });
  app3.use("/api/admin/*", (req, res, next) => {
    console.log("\u{1F534} ADMIN ROUTE HIT:", req.method, req.originalUrl, req.body);
    next();
  });
  app3.get("/api/debug/firebase-data", async (req, res) => {
    try {
      const userAccess = await firebaseStorage.getAllUserStrataAccess();
      const strata2 = await firebaseStorage.getAllStrata();
      const users2 = await firebaseStorage.getAllUsers();
      res.json({
        userAccess,
        strata: strata2.map((s) => ({ id: s.id, name: s.name })),
        users: users2.map((u) => ({ id: u.id, email: u.email, username: u.username }))
      });
    } catch (error) {
      console.error("Firebase debug error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app3.post("/api/assign-user-to-strata", async (req, res) => {
    console.log("\u{1F3AF} DIRECT USER ASSIGNMENT - No middleware interference");
    console.log("Request body:", req.body);
    try {
      const { strataId, userId: userId2, role } = req.body;
      if (!userId2 || !strataId || !role) {
        return res.status(400).json({ message: "Missing required fields: userId, strataId, role" });
      }
      console.log("Creating user access:", { userId: userId2, strataId, role });
      const existingAccess = await firebaseStorage.getUserStrataAccess(userId2, strataId);
      if (existingAccess) {
        console.log("Updating existing access from", existingAccess.role, "to", role);
        const updatedAccess = await firebaseStorage.updateUserStrataRole(userId2, strataId, role);
        console.log("Successfully updated access:", updatedAccess);
        return res.json({ success: true, access: updatedAccess });
      }
      const accessData = {
        userId: userId2,
        strataId,
        role,
        canPostAnnouncements: ["chairperson", "property_manager", "secretary"].includes(role)
      };
      const access = await firebaseStorage.createUserStrataAccess(accessData);
      console.log("Successfully created access:", access);
      res.json({ success: true, access });
    } catch (error) {
      console.error("Error in user assignment:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app3.patch("/api/admin/user-access/:accessId", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { accessId } = req.params;
      const updatedAccess = await firebaseStorage.updateUserStrataAccess(accessId, req.body);
      res.json(updatedAccess);
    } catch (error) {
      console.error("Error updating user access:", error);
      res.status(500).json({ message: "Failed to update user access" });
    }
  });
  app3.delete("/api/admin/user-strata-access/:accessId", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { accessId } = req.params;
      console.log("\u{1F5D1}\uFE0F Deleting user-strata access:", accessId);
      await firebaseStorage.deleteUserStrataAccess(accessId);
      res.json({ message: "User unassigned successfully" });
    } catch (error) {
      console.error("\u274C Error unassigning user from strata:", error);
      res.status(500).json({ message: error.message || "Failed to unassign user" });
    }
  });
  app3.patch("/api/admin/strata/:strataId/subscription", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { strataId } = req.params;
      const subscriptionData = req.body;
      await firebaseStorage.updateStrataSubscription(strataId, subscriptionData);
      res.json({ message: "Subscription updated successfully" });
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });
  app3.delete("/api/admin/user-access/:accessId", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { accessId } = req.params;
      await firebaseStorage.deleteUserStrataAccess(accessId);
      res.json({ message: "User access removed successfully" });
    } catch (error) {
      console.error("Error removing user access:", error);
      res.status(500).json({ message: "Failed to remove user access" });
    }
  });
  app3.get("/api/get-user-assignments/:userId", async (req, res) => {
    try {
      const { userId: userId2 } = req.params;
      console.log("\u{1F50D} Fetching assignments for userId:", userId2);
      if (userId2 === "master-admin") {
        console.log("\u{1F4CA} Master admin - returning empty assignments");
        return res.json([]);
      }
      console.log("\u{1F50D} Getting user access record with ID: 0f28b495-5c33-4580-b84a-94599ee60436");
      const accessDoc = await firebaseStorage.getUserStrataAccess(userId2, "b13712fb-8c41-4d4e-b5b4-a8f196b09716");
      console.log("\u{1F4CA} Direct access lookup result:", accessDoc);
      const results = [];
      if (accessDoc) {
        const strata2 = await firebaseStorage.getStrata(accessDoc.strataId);
        console.log("\u{1F4CA} Found strata for access:", strata2?.name);
        results.push({
          id: accessDoc.id,
          userId: accessDoc.userId,
          strataId: accessDoc.strataId,
          role: accessDoc.role,
          strata: strata2,
          createdAt: accessDoc.createdAt
        });
      }
      console.log("\u{1F4CA} Final results:", results.length);
      res.json(results);
    } catch (error) {
      console.error("\u274C Error fetching user assignments:", error);
      res.status(500).json({ message: error.message || "Failed to fetch user assignments" });
    }
  });
  app3.get("/api/strata/:id/messages", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId2 = req.authenticatedUser?.id || req.firebaseUser?.uid || "master-admin";
      console.log("\u{1F4EC} Fetching messages for strata:", id, "User:", userId2);
      const messages2 = await firebaseStorage.getMessagesByStrata(id);
      console.log("\u{1F4EC} Found messages:", messages2?.length || 0);
      res.json(messages2 || []);
    } catch (error) {
      console.error("\u274C Error fetching messages:", error);
      res.status(500).json({
        message: "Failed to fetch messages",
        error: error.message
      });
    }
  });
  app3.post("/api/strata/:id/messages", isAuthenticatedUnified, async (req, res) => {
    try {
      console.log("\u{1F4EC} Creating message - Request data:", {
        params: req.params,
        body: req.body,
        user: {
          id: req.authenticatedUser?.id,
          email: req.authenticatedUser?.email,
          firebaseUser: req.firebaseUser?.email
        }
      });
      const { id } = req.params;
      const userId2 = req.authenticatedUser?.id || req.firebaseUser?.uid || "master-admin";
      const { recipientIds, isGroupChat, ...bodyData } = req.body;
      const user = req.authenticatedUser || req.firebaseUser;
      const senderName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || "Unknown User";
      console.log("\u{1F464} Message sender details:", {
        userId: userId2,
        senderName,
        recipientIds,
        messageType: isGroupChat ? "broadcast" : "private"
      });
      const uniqueRecipientIds = [...new Set(recipientIds || [])];
      console.log("\u{1F50D} Original recipientIds:", recipientIds);
      console.log("\u{1F50D} Deduplicated recipientIds:", uniqueRecipientIds);
      if (!uniqueRecipientIds || !Array.isArray(uniqueRecipientIds) || uniqueRecipientIds.length === 0) {
        return res.status(400).json({ message: "Please select at least one recipient to send a private message." });
      }
      let conversationId = bodyData.conversationId;
      const { conversationId: _, ...cleanBodyData } = bodyData;
      const messageData = {
        ...cleanBodyData,
        strataId: id,
        senderId: userId2,
        recipientIds: uniqueRecipientIds,
        // Store as array instead of single recipientId
        messageType: isGroupChat ? "broadcast" : "private",
        isRead: false,
        priority: bodyData.priority || "normal"
      };
      if (conversationId) {
        messageData.conversationId = conversationId;
      }
      console.log("\u{1F48C} Creating single message with multiple recipients:", JSON.stringify(messageData, null, 2));
      const message = await firebaseStorage.createMessage(messageData);
      for (const recipientId of uniqueRecipientIds) {
        await firebaseStorage.createNotification({
          userId: recipientId,
          strataId: id,
          type: "message",
          title: `New message from ${senderName}`,
          message: isGroupChat ? `Group chat: ${bodyData.subject || "New message"}` : bodyData.subject || "New private message",
          relatedId: message.id,
          isRead: false
        });
      }
      console.log("\u2705 Successfully created message:", message.id);
      res.json(message);
    } catch (error) {
      console.error("\u274C Error creating message:", error);
      console.error("\u274C Error stack:", error.stack);
      res.status(500).json({ message: "Failed to create message: " + error.message });
    }
  });
  app3.patch("/api/messages/:id/read", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId2 = req.authenticatedUser?.email || req.firebaseUser?.email || "master-admin";
      console.log(`\u{1F4D6} Marking message ${id} as read for user ${userId2}`);
      await firebaseStorage.markMessageAsRead(id, userId2);
      res.json({ message: "Message marked as read", messageId: id });
    } catch (error) {
      console.error("\u274C Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read: " + error.message });
    }
  });
  app3.delete("/api/conversations/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId2 = req.authenticatedUser.id;
      await firebaseStorage.deleteConversation(id, userId2);
      res.json({ message: "Conversation deleted successfully" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });
  app3.get("/api/strata/:id/notifications", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId2 = req.authenticatedUser.id;
      const notifications2 = await firebaseStorage.getUserNotifications(userId2, id);
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app3.patch("/api/notifications/:id/read", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await firebaseStorage.markNotificationAsRead(id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app3.get("/api/strata/:id/resident-directory", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const directory = await firebaseStorage.getStrataResidentDirectory(id);
      res.json(directory);
    } catch (error) {
      console.error("Error fetching resident directory:", error);
      res.status(500).json({ message: "Failed to fetch resident directory" });
    }
  });
  app3.post("/api/strata/:id/resident-directory", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const directoryData = insertResidentDirectorySchema.parse({
        ...req.body,
        strataId: id
      });
      const entry = await firebaseStorage.createResidentDirectoryEntry(directoryData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating resident directory entry:", error);
      res.status(500).json({ message: "Failed to create directory entry" });
    }
  });
  app3.patch("/api/resident-directory/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const entry = await firebaseStorage.updateResidentDirectoryEntry(id, req.body);
      res.json(entry);
    } catch (error) {
      console.error("Error updating resident directory entry:", error);
      res.status(500).json({ message: "Failed to update directory entry" });
    }
  });
  app3.get("/api/dismissed-notifications", isAuthenticatedUnified, async (req, res) => {
    try {
      const userId2 = req.authenticatedUser.id;
      const dismissed = await firebaseStorage.getUserDismissedNotifications(userId2);
      res.json(dismissed);
    } catch (error) {
      console.error("Error fetching dismissed notifications:", error);
      res.status(500).json({ message: "Failed to fetch dismissed notifications" });
    }
  });
  app3.patch("/api/user/password-changed", isAuthenticatedUnified, async (req, res) => {
    try {
      const userEmail = req.firebaseUser?.email || req.authenticatedUser?.email;
      if (!userEmail) {
        return res.status(400).json({ message: "User email not found" });
      }
      await firebaseStorage.markPasswordChanged(userEmail);
      res.json({ message: "Password change status updated" });
    } catch (error) {
      console.error("Error updating password change status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app3.get("/api/user/must-change-password", isAuthenticatedUnified, async (req, res) => {
    try {
      const userEmail = req.firebaseUser?.email || req.authenticatedUser?.email;
      if (!userEmail) {
        return res.status(400).json({ message: "User email not found" });
      }
      const user = await firebaseStorage.getUserByEmail(userEmail);
      res.json({ mustChangePassword: user?.mustChangePassword || false });
    } catch (error) {
      console.error("Error checking password change requirement:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app3.post("/api/admin/reset-firebase-password", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required" });
      }
      const apiKey = process.env.VITE_FIREBASE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Firebase API key not configured" });
      }
      const lookupResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: [email]
        })
      });
      if (!lookupResponse.ok) {
        return res.status(404).json({ message: "User not found in Firebase" });
      }
      const lookupData = await lookupResponse.json();
      if (!lookupData.users || lookupData.users.length === 0) {
        return res.status(404).json({ message: "User not found in Firebase" });
      }
      const firebaseUid = lookupData.users[0].localId;
      const updateResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          localId: firebaseUid,
          password: newPassword,
          returnSecureToken: false
        })
      });
      if (!updateResponse.ok) {
        const updateError = await updateResponse.json();
        return res.status(500).json({
          message: "Failed to update Firebase password",
          error: updateError.error?.message
        });
      }
      await firebaseStorage.setMustChangePassword(email);
      res.json({
        message: "Firebase password updated successfully",
        email,
        passwordSet: newPassword
      });
    } catch (error) {
      console.error("Error resetting Firebase password:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app3.post("/api/dismissed-notifications", isAuthenticatedUnified, async (req, res) => {
    try {
      const userId2 = req.authenticatedUser.id;
      const notificationData = insertDismissedNotificationSchema.parse({
        ...req.body,
        userId: userId2
      });
      const dismissed = await firebaseStorage.dismissNotification(notificationData);
      res.json(dismissed);
    } catch (error) {
      console.error("Error dismissing notification:", error);
      res.status(500).json({ message: "Failed to dismiss notification" });
    }
  });
  app3.get("/api/strata/:strataId/reports", isAuthenticatedUnified, async (req, res) => {
    try {
      const reports2 = await firebaseStorage.getStrataReports(req.params.strataId);
      res.json(reports2);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });
  app3.post("/api/strata/:strataId/reports", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user;
      const reportData = {
        ...req.body,
        strataId: req.params.strataId,
        generatedBy: user?.id || user?.email || "unknown",
        status: "pending"
      };
      const report = await firebaseStorage.createReport(reportData);
      res.json(report);
      setTimeout(async () => {
        try {
          console.log(`Generating ${report.reportType} report for strata ${req.params.strataId}`);
          let content;
          switch (report.reportType) {
            case "financial":
              const defaultDateRange = {
                start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1e3).toISOString(),
                end: (/* @__PURE__ */ new Date()).toISOString()
              };
              content = await firebaseStorage.generateFinancialReport(
                req.params.strataId,
                report.dateRange || defaultDateRange
              );
              break;
            case "meeting-minutes":
              content = await firebaseStorage.generateMeetingMinutesReport(
                req.params.strataId,
                report.dateRange
              );
              break;
            case "home-sale-package":
              content = await firebaseStorage.generateHomeSalePackage(req.params.strataId);
              break;
            default:
              content = { message: "Report generation not implemented for this type" };
          }
          await firebaseStorage.updateReport(report.id, {
            status: "completed",
            content,
            downloadUrl: `/api/reports/${report.id}/download`
          });
        } catch (error) {
          console.error("Error generating report:", error);
          await firebaseStorage.updateReport(report.id, { status: "failed" });
        }
      }, 2e3);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });
  app3.get("/api/reports/:reportId", isAuthenticatedUnified, async (req, res) => {
    try {
      const report = await firebaseStorage.getReport(req.params.reportId);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });
  app3.delete("/api/reports/:reportId", isAuthenticatedUnified, async (req, res) => {
    try {
      await firebaseStorage.deleteReport(req.params.reportId);
      res.json({ message: "Report deleted successfully" });
    } catch (error) {
      console.error("Error deleting report:", error);
      res.status(500).json({ message: "Failed to delete report" });
    }
  });
  app3.get("/api/reports/:reportId/download", isAuthenticatedUnified, async (req, res) => {
    try {
      const report = await firebaseStorage.getReport(req.params.reportId);
      if (!report || report.status !== "completed") {
        return res.status(404).json({ message: "Report not available for download" });
      }
      const content = JSON.stringify(report.content, null, 2);
      const filename = `${report.title.replace(/[^a-zA-Z0-9]/g, "_")}.${report.format === "excel" ? "json" : report.format}`;
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", report.format === "pdf" ? "application/pdf" : "application/json");
      res.send(content);
    } catch (error) {
      console.error("Error downloading report:", error);
      res.status(500).json({ message: "Failed to download report" });
    }
  });
  app3.post("/api/migration/migrate-user/:userId", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { userId: userId2 } = req.params;
      const { userMigration: userMigration2 } = await Promise.resolve().then(() => (init_firebase_user_migration(), firebase_user_migration_exports));
      const user = await firebaseStorage.getUser(userId2);
      if (!user) {
        return res.status(404).json({ error: "User not found in PostgreSQL" });
      }
      const pgUser = {
        id: user.id,
        email: user.email || "",
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        role: user.role,
        is_active: user.isActive !== false,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const result = await userMigration2.createFirebaseUser(pgUser);
      res.json({
        success: true,
        user: pgUser,
        firebaseResult: result
      });
    } catch (error) {
      console.error("Error migrating user to Firebase:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app3.post("/api/migration/create-master-admin", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { userMigration: userMigration2 } = await Promise.resolve().then(() => (init_firebase_user_migration(), firebase_user_migration_exports));
      const users2 = await firebaseStorage.getAllUsers();
      const masterAdmin = users2.find((u) => u.email === "rfinnbogason@gmail.com");
      if (!masterAdmin) {
        return res.status(404).json({ error: "Master admin user not found in PostgreSQL" });
      }
      const pgUser = {
        id: masterAdmin.id,
        email: masterAdmin.email || "",
        first_name: masterAdmin.firstName || "Master",
        last_name: masterAdmin.lastName || "Admin",
        role: "master_admin",
        is_active: true,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const result = await userMigration2.createFirebaseUser(pgUser);
      res.json({
        success: true,
        result
      });
    } catch (error) {
      console.error("Error creating master admin in Firebase:", error);
      res.status(500).json({ error: error.message });
    }
  });
  registerFirebaseMigrationRoutes(app3);
  app3.post("/api/upload/test", isAuthenticatedUnified, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const fileName = `test-${Date.now()}-${req.file.originalname}`;
      const fileUrl = await uploadFileToStorage(
        fileName,
        req.file.buffer,
        req.file.mimetype,
        "test-uploads"
      );
      res.json({
        message: "File uploaded successfully to Firebase Storage!",
        fileUrl,
        fileName
      });
    } catch (error) {
      console.error("Firebase Storage upload error:", error);
      res.status(500).json({ message: "Upload failed: " + error.message });
    }
  });
  app3.get("/api/user/profile", authenticateFirebase, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      res.json({
        email: user.email,
        displayName: user.displayName || "",
        phoneNumber: user.phoneNumber || "",
        photoURL: user.photoURL || ""
      });
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });
  app3.patch("/api/user/profile", authenticateFirebase, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { displayName, phoneNumber } = req.body;
      console.log("Profile update request for user:", user.uid, { displayName, phoneNumber });
      res.json({
        message: "Profile updated successfully",
        user: { displayName, phoneNumber }
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app3.get("/api/user/notification-settings", authenticateFirebase, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const settings = {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        weeklyReports: true,
        maintenanceAlerts: true,
        meetingReminders: true,
        announcementNotifications: true,
        quoteUpdates: true,
        paymentReminders: true,
        emergencyAlerts: true,
        soundEnabled: true,
        notificationFrequency: "immediate",
        quietHoursEnabled: false,
        quietHoursStart: "22:00",
        quietHoursEnd: "08:00"
      };
      res.json(settings);
    } catch (error) {
      console.error("Failed to fetch notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });
  app3.patch("/api/user/notification-settings", authenticateFirebase, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const settings = req.body;
      console.log("Notification settings updated for user:", user.uid, settings);
      res.json({
        message: "Notification settings updated successfully"
      });
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });
  app3.post("/api/user/test-notification", authenticateFirebase, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      console.log(`Test notification sent to user: ${user.email}`);
      res.json({
        message: "Test notification sent successfully"
      });
    } catch (error) {
      console.error("Failed to send test notification:", error);
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });
  app3.get("/api/debug/firebase-data", authenticateFirebase, async (req, res) => {
    try {
      const strataId = "b13712fb-8c41-4d4e-b5b4-a8f196b09716";
      const feeTiers = await firebaseStorage.getStrataFeeTiers(strataId);
      console.log("\u{1F4CA} Fee Tiers from Firebase:", JSON.stringify(feeTiers, null, 2));
      const units2 = await firebaseStorage.getStrataUnits(strataId);
      console.log("\u{1F3E0} Units from Firebase:", JSON.stringify(units2, null, 2));
      res.json({
        feeTiers: feeTiers || [],
        units: units2 || [],
        strataId,
        message: "Firebase data retrieved successfully",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("\u274C Failed to get Firebase data:", error);
      res.status(500).json({ message: "Failed to get Firebase data: " + error.message });
    }
  });
  app3.get("/api/strata/:id/notifications", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userEmail = req.firebaseUser?.email;
      if (!userEmail) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const strataUsers = await firebaseStorage.getStrataUsers(id);
      const currentUser = strataUsers.find((user) => user.email === userEmail);
      if (!currentUser) {
        return res.json([]);
      }
      const notifications2 = await firebaseStorage.getUserNotifications(currentUser.id, id);
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app3.patch("/api/notifications/:id/read", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app3.post("/api/test/meeting-invitation", isAuthenticatedUnified, async (req, res) => {
    try {
      const userEmail = req.firebaseUser?.email;
      if (!userEmail) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const user = await firebaseStorage.getUserByEmail(userEmail);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const notificationData = {
        userId: user.id,
        strataId: "b13712fb-8c41-4d4e-b5b4-a8f196b09716",
        // The Gables strata ID
        type: "meeting_invitation",
        title: "Meeting Invitation: Monthly Strata Council",
        message: "You've been invited to the monthly strata council meeting",
        isRead: false,
        priority: "high",
        metadata: {
          meetingTitle: "Monthly Strata Council Meeting",
          meetingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
          // Next week
          location: "Community Room, Main Building",
          organizer: "VibeStrat System",
          type: "council_meeting"
        },
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await firebaseStorage.createNotification(notificationData);
      res.json({
        success: true,
        message: "Test meeting invitation notification created successfully",
        notification: notificationData
      });
    } catch (error) {
      console.error("Error creating test notification:", error);
      res.status(500).json({ message: "Failed to create test notification" });
    }
  });
  const httpServer = createServer(app3);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app3, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app3.use(vite.middlewares);
  app3.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app3) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app3.use(express.static(distPath));
  app3.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app2 = express2();
app2.use((req, res, next) => {
  console.log(`\u{1F50D} Middleware check: ${req.method} ${req.path} - Content-Type: ${req.headers["content-type"]}`);
  if (req.path.includes("/documents") && req.method === "POST") {
    console.log("\u2705 Skipping body parsing for document upload");
    return next();
  }
  console.log("\u{1F4DD} Applying JSON body parsing");
  express2.json({ limit: "50mb" })(req, res, (err) => {
    if (err) {
      console.error("JSON parsing error:", err);
      return res.status(400).json({ message: "Invalid JSON" });
    }
    next();
  });
});
app2.use((req, res, next) => {
  if (req.path.includes("/documents") && req.method === "POST") {
    console.log("\u2705 Skipping URL encoding for document upload");
    return next();
  }
  console.log("\u{1F517} Applying URL encoding");
  express2.urlencoded({ extended: false, limit: "50mb" })(req, res, (err) => {
    if (err) {
      console.error("URL encoding error:", err);
      return res.status(400).json({ message: "Invalid form data" });
    }
    next();
  });
});
app2.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  if (req.method === "POST" && path4.includes("/api/admin/")) {
    console.log("\u{1F50D} INCOMING POST REQUEST to admin endpoint:", {
      method: req.method,
      path: path4,
      hasAuth: !!req.headers.authorization
    });
  }
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app2);
  app2.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app2.get("env") === "development") {
    await setupVite(app2, server);
  } else {
    serveStatic(app2);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
