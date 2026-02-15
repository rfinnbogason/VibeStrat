const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe");

admin.initializeApp();
const db = admin.firestore();

// Initialize Stripe with secret key from environment variable
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripeClient = stripeKey ? stripe(stripeKey) : null;

// Initialize Claude (Anthropic) if configured
const anthropicKey = process.env.ANTHROPIC_API_KEY;
let anthropic = null;
if (anthropicKey) {
  const Anthropic = require("@anthropic-ai/sdk");
  anthropic = new Anthropic({ apiKey: anthropicKey });
}

// ===== HELPER FUNCTIONS =====

/**
 * Verify user has access to the specified strata
 * CRITICAL: This prevents data bleeding between stratas
 */
async function verifyStrataAccess(userId, strataId) {
  const userStrata = await db
    .collection("userStrataRoles")
    .where("userId", "==", userId)
    .where("strataId", "==", strataId)
    .limit(1)
    .get();

  if (userStrata.empty) {
    throw new Error("Unauthorized: User does not have access to this strata");
  }

  return userStrata.docs[0].data();
}

/**
 * Check if user has specific permission
 */
function hasPermission(role, permission) {
  const permissions = {
    master_admin: ["*"],
    chairperson: [
      "financial.view", "financial.create", "financial.edit", "financial.delete",
      "vendor.view", "vendor.create", "vendor.edit", "vendor.delete",
      "maintenance.view", "maintenance.create", "maintenance.edit",
      "meeting.view", "meeting.create", "meeting.edit",
      "communication.view", "communication.create",
      "user.view", "user.create", "user.edit"
    ],
    treasurer: [
      "financial.view", "financial.create", "financial.edit",
      "vendor.view", "vendor.create"
    ],
    secretary: [
      "meeting.view", "meeting.create", "meeting.edit",
      "communication.view", "communication.create",
      "user.view"
    ],
    council_member: [
      "financial.view", "vendor.view", "maintenance.view", "meeting.view"
    ],
    property_manager: [
      "financial.view", "financial.create",
      "vendor.view", "vendor.create",
      "maintenance.view", "maintenance.create", "maintenance.edit"
    ],
    resident: [
      "maintenance.view", "maintenance.create",
      "communication.view"
    ]
  };

  const rolePerms = permissions[role] || [];
  return rolePerms.includes("*") || rolePerms.includes(permission);
}

// ===== FINANCIAL FUNCTIONS =====

/**
 * Get financial summary for a strata
 * IMPORTANT: Filters by strataId
 */
exports.getFinancialSummary = functions.https.onCall(async (data, context) => {
  try {
    // ✅ CRITICAL: Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to view financial summary"
      );
    }

    const userId = context.auth.uid;

    // ✅ CRITICAL: Check if data exists before destructuring
    if (!data || typeof data !== 'object') {
      // Return safe defaults when no data provided
      return {
        totalInvoiced: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        invoiceCount: 0,
        paymentCount: 0,
        error: null
      };
    }

    const { strataId } = data;

    // If strataId is provided, return strata financial summary
    if (strataId && typeof strataId === 'string') {
      // Verify access
      const userRole = await verifyStrataAccess(userId, strataId);

      if (!hasPermission(userRole.role, "financial.view")) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Insufficient permissions to view financial data"
        );
      }

      // Get expenses for this strata
      const expensesSnapshot = await db
        .collection("expenses")
        .where("strataId", "==", strataId)
        .get();

      const expenses = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get income for this strata
      const fundsSnapshot = await db
        .collection("funds")
        .where("strataId", "==", strataId)
        .get();

      const funds = fundsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate totals with null safety
      const totalExpenses = expenses.reduce((sum, exp) => {
        const amount = typeof exp.amount === 'number' ? exp.amount : 0;
        return sum + amount;
      }, 0);

      const totalIncome = funds.reduce((sum, fund) => {
        const balance = typeof fund.balance === 'number' ? fund.balance : 0;
        return sum + balance;
      }, 0);

      const netBalance = totalIncome - totalExpenses;

      // Get pending expenses
      const pendingExpenses = expenses.filter(exp => exp.status === "pending");
      const pendingTotal = pendingExpenses.reduce((sum, exp) => {
        const amount = typeof exp.amount === 'number' ? exp.amount : 0;
        return sum + amount;
      }, 0);

      return {
        strataId,
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        netBalance: parseFloat(netBalance.toFixed(2)),
        pendingExpensesCount: pendingExpenses.length,
        pendingExpensesTotal: parseFloat(pendingTotal.toFixed(2)),
        expenseCount: expenses.length,
        fundCount: funds.length,
        error: null
      };
    } else {
      // No strataId - return user billing summary
      // Get invoices for this user
      const invoicesSnapshot = await db
        .collection("invoices")
        .where("userId", "==", userId)
        .get();

      const invoices = invoicesSnapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          amount: typeof docData.amount === 'number' ? docData.amount : 0,
          amountPaid: typeof docData.amountPaid === 'number' ? docData.amountPaid : 0,
          ...docData
        };
      });

      // Get payments for this user
      const paymentsSnapshot = await db
        .collection("payments")
        .where("userId", "==", userId)
        .get();

      const payments = paymentsSnapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          status: docData.status || "pending",
          amount: typeof docData.amount === 'number' ? docData.amount : 0,
          ...docData
        };
      });

      // Calculate summary with null safety
      const totalInvoiced = invoices.reduce((sum, inv) => {
        const amount = typeof inv.amount === 'number' ? inv.amount : 0;
        return sum + amount;
      }, 0);

      const totalPaid = payments
        .filter(p => p.status === "succeeded")
        .reduce((sum, pay) => {
          const amount = typeof pay.amount === 'number' ? pay.amount : 0;
          return sum + amount;
        }, 0);

      const totalOutstanding = Math.max(0, totalInvoiced - totalPaid);

      return {
        totalInvoiced: parseFloat(totalInvoiced.toFixed(2)),
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        totalOutstanding: parseFloat(totalOutstanding.toFixed(2)),
        invoiceCount: invoices.length,
        paymentCount: payments.length,
        error: null
      };
    }
  } catch (error) {
    console.error("Error in getFinancialSummary:", error);

    // ✅ Return safe error response instead of throwing
    return {
      totalInvoiced: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      invoiceCount: 0,
      paymentCount: 0,
      error: error.message || "Failed to load financial summary"
    };
  }
});

/**
 * Calculate monthly income projection for a strata
 */
exports.calculateMonthlyIncome = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new Error("Authentication required");

    const { strataId } = data;
    const userId = context.auth.uid;

    if (!strataId) throw new Error("strataId is required");

    // Verify access
    await verifyStrataAccess(userId, strataId);

    // Get strata info
    const strataDoc = await db.collection("stratas").doc(strataId).get();
    if (!strataDoc.exists) throw new Error("Strata not found");

    const strataData = strataDoc.data();

    // Get all units for this strata
    const unitsSnapshot = await db
      .collection("units")
      .where("strataId", "==", strataId)
      .get();

    const units = unitsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate monthly income based on unit fees
    const monthlyIncome = units.reduce((sum, unit) => {
      return sum + (unit.monthlyFee || 0);
    }, 0);

    return {
      strataId,
      monthlyIncome,
      unitCount: units.length,
      occupiedUnits: units.filter(u => u.isOccupied).length,
      vacantUnits: units.filter(u => !u.isOccupied).length
    };
  } catch (error) {
    console.error("Error in calculateMonthlyIncome:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// ===== PAYMENT PROCESSING FUNCTIONS =====

/**
 * Get payment methods for a user within a specific strata
 * IMPORTANT: Filters by strataId to prevent data bleeding
 */
exports.getPaymentMethods = functions.https.onCall(async (data, context) => {
  try {
    // ✅ CRITICAL: Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to view payment methods"
      );
    }

    const userId = context.auth.uid;

    // ✅ Validate strataId
    if (!data || !data.strataId || typeof data.strataId !== 'string') {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing or invalid strata ID"
      );
    }

    const { strataId } = data;

    // ✅ Verify user has access to this strata
    const memberDoc = await db
      .collection("properties")
      .doc(strataId)
      .collection("members")
      .doc(userId)
      .get();

    if (!memberDoc.exists) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "User does not have access to this property"
      );
    }

    // ✅ Retrieve all payment methods for this strata belonging to the user
    const paymentMethodsSnapshot = await db
      .collection("properties")
      .doc(strataId)
      .collection("paymentMethods")
      .where("userId", "==", userId)
      .get();

    const paymentMethods = [];
    paymentMethodsSnapshot.forEach((doc) => {
      const method = doc.data();
      paymentMethods.push({
        id: doc.id,
        cardBrand: method.cardBrand || 'Unknown',
        cardLastFour: method.cardLastFour || '',
        cardToken: method.cardToken || '',
        isDefault: method.isDefault || false,
        status: method.status || 'active',
        createdAt: method.createdAt?.toDate?.() || null
      });
    });

    return {
      success: true,
      paymentMethods
    };
  } catch (error) {
    console.error("Error in getPaymentMethods:", error);

    // ✅ Return proper error response
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      error.message || "Failed to retrieve payment methods"
    );
  }
});

/**
 * Add a new payment method
 */
exports.addPaymentMethod = functions.https.onCall(async (data, context) => {
  try {
    // ✅ CRITICAL: Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to add payment methods"
      );
    }

    const userId = context.auth.uid;

    // ✅ CRITICAL: Validate all required input data exists
    if (!data || typeof data !== 'object') {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing payment method data"
      );
    }

    const { cardToken, cardLastFour, cardBrand } = data;

    // ✅ Validate all required fields
    if (!cardToken || typeof cardToken !== 'string') {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing or invalid card token"
      );
    }

    if (!cardLastFour || typeof cardLastFour !== 'string') {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing or invalid card last four digits"
      );
    }

    if (!cardBrand || typeof cardBrand !== 'string') {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing or invalid card brand"
      );
    }

    // ✅ Verify card token format (must be test token or valid format)
    if (cardToken.length < 10) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid card token format"
      );
    }

    // Get existing payment methods to determine if this should be default
    const existingMethods = await db
      .collection("paymentMethods")
      .where("userId", "==", userId)
      .get();

    const isDefault = existingMethods.empty;

    // ✅ Create payment method record in Firestore
    const docRef = await db.collection("paymentMethods").add({
      userId,
      cardToken,
      cardLastFour: String(cardLastFour).slice(-4),
      cardBrand: String(cardBrand).toLowerCase(),
      isDefault,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active'
    });

    return {
      id: docRef.id,
      message: "Payment method added successfully",
      success: true
    };
  } catch (error) {
    console.error("Error in addPaymentMethod:", error);

    // ✅ Return proper error response
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      error.message || "Failed to add payment method"
    );
  }
});

/**
 * Set default payment method
 */
exports.setDefaultPaymentMethod = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new Error("Authentication required");

    const { paymentMethodId } = data;
    const userId = context.auth.uid;

    // Verify ownership
    const paymentMethod = await db
      .collection("paymentMethods")
      .doc(paymentMethodId)
      .get();

    if (!paymentMethod.exists || paymentMethod.data().userId !== userId) {
      throw new Error("Payment method not found or unauthorized");
    }

    // Reset all others to false
    const batch = db.batch();

    const allMethods = await db
      .collection("paymentMethods")
      .where("userId", "==", userId)
      .get();

    allMethods.docs.forEach(doc => {
      batch.update(doc.ref, { isDefault: false });
    });

    // Set this one to true
    batch.update(db.collection("paymentMethods").doc(paymentMethodId), {
      isDefault: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();

    return { message: "Default payment method updated" };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Delete a payment method
 */
exports.deletePaymentMethod = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new Error("Authentication required");

    const { paymentMethodId } = data;
    const userId = context.auth.uid;

    // Verify ownership
    const paymentMethod = await db
      .collection("paymentMethods")
      .doc(paymentMethodId)
      .get();

    if (!paymentMethod.exists || paymentMethod.data().userId !== userId) {
      throw new Error("Payment method not found or unauthorized");
    }

    const wasDefault = paymentMethod.data().isDefault;

    // Delete the payment method
    await db.collection("paymentMethods").doc(paymentMethodId).delete();

    // If it was default, set another as default
    if (wasDefault) {
      const remainingMethods = await db
        .collection("paymentMethods")
        .where("userId", "==", userId)
        .limit(1)
        .get();

      if (!remainingMethods.empty) {
        await remainingMethods.docs[0].ref.update({
          isDefault: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    return { message: "Payment method deleted" };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Process a strata fee payment
 * IMPORTANT: Validates strataId access
 */
exports.processStrataPayment = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new Error("Authentication required");
    if (!stripeClient) throw new Error("Stripe not configured");

    const { strataId, unitId, amount, paymentMethodId } = data;
    const userId = context.auth.uid;

    if (!strataId || !unitId || !amount) {
      throw new Error("Missing required fields");
    }

    // Verify strata access
    await verifyStrataAccess(userId, strataId);

    // Verify unit ownership/association
    const unitDoc = await db.collection("units").doc(unitId).get();
    if (!unitDoc.exists || unitDoc.data().strataId !== strataId) {
      throw new Error("Unit not found or does not belong to this strata");
    }

    // Get payment method if provided
    let cardToken;
    if (paymentMethodId) {
      const paymentMethodDoc = await db
        .collection("paymentMethods")
        .doc(paymentMethodId)
        .get();

      if (!paymentMethodDoc.exists || paymentMethodDoc.data().userId !== userId) {
        throw new Error("Payment method not found or unauthorized");
      }

      cardToken = paymentMethodDoc.data().cardToken;
    }

    try {
      // Create payment intent
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "cad", // Canadian dollars
        payment_method_types: ["card"],
        metadata: {
          userId,
          strataId,
          unitId,
          type: "strata_fee"
        }
      });

      // Record payment in Firestore (with strataId!)
      const paymentRecord = await db.collection("payments").add({
        userId,
        strataId, // CRITICAL: Include strataId
        unitId,
        amount,
        status: "pending",
        stripePaymentIntentId: paymentIntent.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        paymentId: paymentRecord.id,
        clientSecret: paymentIntent.client_secret,
        message: "Payment initiated"
      };
    } catch (stripeError) {
      // Record failed payment (with strataId!)
      await db.collection("payments").add({
        userId,
        strataId, // CRITICAL: Include strataId
        unitId,
        amount,
        status: "failed",
        stripeError: stripeError.message,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      throw new Error(`Payment processing failed: ${stripeError.message}`);
    }
  } catch (error) {
    console.error("Error in processStrataPayment:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// ===== VENDOR & QUOTE MANAGEMENT FUNCTIONS =====

/**
 * Analyze a quote document using AI
 * IMPORTANT: Associates with strataId
 */
exports.analyzeQuoteDocument = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new Error("Authentication required");
    if (!anthropic) throw new Error("Claude API not configured");

    const { strataId, documentText, documentUrl } = data;
    const userId = context.auth.uid;

    if (!strataId) throw new Error("strataId is required");

    // Verify strata access
    const userRole = await verifyStrataAccess(userId, strataId);

    if (!hasPermission(userRole.role, "vendor.create")) {
      throw new Error("Insufficient permissions");
    }

    // Use Claude to analyze the quote
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Analyze this vendor quote and extract the following information in JSON format:
        - vendorName
        - vendorContact (email or phone)
        - totalAmount
        - itemizedCosts (array of {description, amount})
        - validUntil (date if mentioned)
        - paymentTerms
        - scope (brief description of work)

        Respond ONLY with valid JSON, no markdown formatting.

        Quote text: ${documentText}`
      }]
    });

    // Extract text content from Claude's response
    const responseText = message.content[0].text;
    const analysis = JSON.parse(responseText);

    // Save the analysis (with strataId!)
    const analysisDoc = await db.collection("quoteAnalyses").add({
      strataId, // CRITICAL: Include strataId
      userId,
      documentUrl,
      analysis,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      analysisId: analysisDoc.id,
      ...analysis
    };
  } catch (error) {
    console.error("Error in analyzeQuoteDocument:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Calculate vendor ratings for a strata
 * IMPORTANT: Filters by strataId
 */
exports.calculateVendorRatings = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new Error("Authentication required");

    const { strataId } = data;
    const userId = context.auth.uid;

    if (!strataId) throw new Error("strataId is required");

    // Verify access
    await verifyStrataAccess(userId, strataId);

    // Get all vendor contracts for this strata
    const contractsSnapshot = await db
      .collection("vendorContracts")
      .where("strataId", "==", strataId) // CRITICAL: Filter by strataId
      .get();

    const vendorRatings = {};

    contractsSnapshot.docs.forEach(doc => {
      const contract = doc.data();
      const vendorId = contract.vendorId;

      if (!vendorRatings[vendorId]) {
        vendorRatings[vendorId] = {
          totalRating: 0,
          count: 0,
          contracts: 0
        };
      }

      vendorRatings[vendorId].contracts++;

      if (contract.rating) {
        vendorRatings[vendorId].totalRating += contract.rating;
        vendorRatings[vendorId].count++;
      }
    });

    // Calculate averages
    const results = Object.entries(vendorRatings).map(([vendorId, data]) => ({
      vendorId,
      averageRating: data.count > 0 ? data.totalRating / data.count : 0,
      contractCount: data.contracts,
      ratingCount: data.count
    }));

    return {
      strataId,
      vendors: results
    };
  } catch (error) {
    console.error("Error in calculateVendorRatings:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// ===== NOTIFICATION FUNCTIONS =====

/**
 * Send notification to strata members
 * IMPORTANT: Sends only to members of specified strata
 */
exports.sendStrataNotification = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new Error("Authentication required");

    const { strataId, title, message, recipientRole } = data;
    const userId = context.auth.uid;

    if (!strataId || !title || !message) {
      throw new Error("Missing required fields");
    }

    // Verify access and permissions
    const userRole = await verifyStrataAccess(userId, strataId);

    if (!hasPermission(userRole.role, "communication.create")) {
      throw new Error("Insufficient permissions");
    }

    // Get recipients from this strata only
    let recipientsQuery = db
      .collection("userStrataRoles")
      .where("strataId", "==", strataId); // CRITICAL: Filter by strataId

    if (recipientRole && recipientRole !== "all") {
      recipientsQuery = recipientsQuery.where("role", "==", recipientRole);
    }

    const recipientsSnapshot = await recipientsQuery.get();

    // Create notifications
    const batch = db.batch();

    recipientsSnapshot.docs.forEach(doc => {
      const recipient = doc.data();
      const notificationRef = db.collection("notifications").doc();

      batch.set(notificationRef, {
        strataId, // CRITICAL: Include strataId
        userId: recipient.userId,
        title,
        message,
        sentBy: userId,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();

    return {
      message: "Notifications sent",
      recipientCount: recipientsSnapshot.size
    };
  } catch (error) {
    console.error("Error in sendStrataNotification:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// ===== SCHEDULED FUNCTIONS =====

/**
 * Send payment reminders (runs daily)
 * IMPORTANT: Processes all stratas separately
 */
exports.sendPaymentReminders = functions.pubsub
  .schedule("every day 09:00")
  .timeZone("America/Vancouver")
  .onRun(async (context) => {
    try {
      // Get all active payment reminders
      const remindersSnapshot = await db
        .collection("paymentReminders")
        .where("active", "==", true)
        .where("nextReminderDate", "<=", admin.firestore.Timestamp.now())
        .get();

      const batch = db.batch();
      let remindersSent = 0;

      for (const reminderDoc of remindersSnapshot.docs) {
        const reminder = reminderDoc.data();
        const { strataId, userId, unitId, amount, frequency } = reminder;

        // Create notification (with strataId!)
        const notificationRef = db.collection("notifications").doc();
        batch.set(notificationRef, {
          strataId, // CRITICAL: Include strataId
          userId,
          title: "Payment Reminder",
          message: `Your strata fee payment of $${amount} is due.`,
          type: "payment_reminder",
          unitId,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Update next reminder date
        const nextDate = new Date(reminder.nextReminderDate.toDate());
        if (frequency === "monthly") {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (frequency === "weekly") {
          nextDate.setDate(nextDate.getDate() + 7);
        }

        batch.update(reminderDoc.ref, {
          nextReminderDate: admin.firestore.Timestamp.fromDate(nextDate),
          lastSent: admin.firestore.FieldValue.serverTimestamp()
        });

        remindersSent++;
      }

      await batch.commit();

      console.log(`Sent ${remindersSent} payment reminders`);
      return { remindersSent };
    } catch (error) {
      console.error("Error in sendPaymentReminders:", error);
      throw error;
    }
  });

/**
 * Clean up old notifications (runs weekly)
 * IMPORTANT: Maintains data isolation per strata
 */
exports.cleanupOldNotifications = functions.pubsub
  .schedule("every sunday 00:00")
  .timeZone("America/Vancouver")
  .onRun(async (context) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldNotifications = await db
        .collection("notifications")
        .where("read", "==", true)
        .where("createdAt", "<=", admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
        .limit(500)
        .get();

      const batch = db.batch();

      oldNotifications.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`Deleted ${oldNotifications.size} old notifications`);
      return { deletedCount: oldNotifications.size };
    } catch (error) {
      console.error("Error in cleanupOldNotifications:", error);
      throw error;
    }
  });

// ===== STRIPE WEBHOOK HANDLER =====

/**
 * Handle Stripe webhooks for subscription events
 */
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  try {
    if (!stripeClient) {
      res.status(503).send("Stripe not configured");
      return;
    }

    const sig = req.headers["stripe-signature"];
    const webhookSecret = functions.config().stripe?.webhook_secret;

    let event;

    try {
      event = stripeClient.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;

        // Update payment record
        const paymentsSnapshot = await db
          .collection("payments")
          .where("stripePaymentIntentId", "==", paymentIntent.id)
          .limit(1)
          .get();

        if (!paymentsSnapshot.empty) {
          await paymentsSnapshot.docs[0].ref.update({
            status: "succeeded",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        break;

      case "payment_intent.payment_failed":
        const failedIntent = event.data.object;

        // Update payment record
        const failedPaymentsSnapshot = await db
          .collection("payments")
          .where("stripePaymentIntentId", "==", failedIntent.id)
          .limit(1)
          .get();

        if (!failedPaymentsSnapshot.empty) {
          await failedPaymentsSnapshot.docs[0].ref.update({
            status: "failed",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error in handleStripeWebhook:", error);
    res.status(500).send("Webhook handler failed");
  }
});
