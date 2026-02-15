import admin from 'firebase-admin';
import { db } from './firebase-db.js';

export interface PushNotificationData {
  title: string;
  body: string;
  data?: {
    type?: 'message' | 'meeting' | 'approval' | 'announcement' | 'payment' | 'maintenance';
    strataId?: string;
    resourceId?: string;
    [key: string]: any;
  };
}

class PushNotificationService {
  /**
   * Send push notification to a specific user
   */
  async sendToUser(userId: string, notification: PushNotificationData): Promise<void> {
    try {
      // Get user's FCM token from Firestore
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        console.warn(`User ${userId} not found`);
        return;
      }

      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;

      if (!fcmToken) {
        console.warn(`No FCM token found for user ${userId}`);
        return;
      }

      await this.sendToToken(fcmToken, notification);
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendToUsers(userIds: string[], notification: PushNotificationData): Promise<void> {
    const promises = userIds.map(userId => this.sendToUser(userId, notification));
    await Promise.all(promises);
  }

  /**
   * Send push notification to all users in a strata
   */
  async sendToStrata(strataId: string, notification: PushNotificationData): Promise<void> {
    try {
      // Get all users with access to this strata
      const accessSnapshot = await db.collection('userStrataAccess')
        .where('strataId', '==', strataId)
        .get();

      const userIds = accessSnapshot.docs.map(doc => doc.data().userId);

      if (userIds.length === 0) {
        console.warn(`No users found for strata ${strataId}`);
        return;
      }

      await this.sendToUsers(userIds, notification);
      console.log(`✅ Sent notification to ${userIds.length} users in strata ${strataId}`);
    } catch (error) {
      console.error(`Error sending notification to strata ${strataId}:`, error);
    }
  }

  /**
   * Send push notification to a specific FCM token
   */
  private async sendToToken(fcmToken: string, notification: PushNotificationData): Promise<void> {
    try {
      const message: admin.messaging.Message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        token: fcmToken,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log(`✅ Push notification sent successfully:`, response);
    } catch (error: any) {
      console.error(`❌ Error sending push notification:`, error);

      // If token is invalid, remove it from user
      if (error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        console.log(`🗑️ Removing invalid FCM token: ${fcmToken}`);
        // TODO: Remove invalid token from user document
      }
    }
  }

  /**
   * Notification triggers for different event types
   */
  async notifyNewMessage(strataId: string, messageData: { sender: string; preview: string }): Promise<void> {
    await this.sendToStrata(strataId, {
      title: `New message from ${messageData.sender}`,
      body: messageData.preview,
      data: {
        type: 'message',
        strataId,
      },
    });
  }

  async notifyMeetingInvite(userIds: string[], meetingData: { title: string; date: string; strataId: string; meetingId: string }): Promise<void> {
    await this.sendToUsers(userIds, {
      title: 'Meeting Invitation',
      body: `You've been invited to: ${meetingData.title} on ${meetingData.date}`,
      data: {
        type: 'meeting',
        strataId: meetingData.strataId,
        resourceId: meetingData.meetingId,
      },
    });
  }

  async notifyApprovalRequired(userIds: string[], approvalData: { type: string; title: string; strataId: string }): Promise<void> {
    await this.sendToUsers(userIds, {
      title: 'Approval Required',
      body: `${approvalData.type}: ${approvalData.title}`,
      data: {
        type: 'approval',
        strataId: approvalData.strataId,
      },
    });
  }

  async notifyNewAnnouncement(strataId: string, announcementData: { title: string; preview: string }): Promise<void> {
    await this.sendToStrata(strataId, {
      title: 'New Announcement',
      body: `${announcementData.title}: ${announcementData.preview}`,
      data: {
        type: 'announcement',
        strataId,
      },
    });
  }

  async notifyPaymentReminder(userId: string, paymentData: { amount: number; dueDate: string; strataId: string }): Promise<void> {
    await this.sendToUser(userId, {
      title: 'Payment Reminder',
      body: `Payment of $${paymentData.amount} due on ${paymentData.dueDate}`,
      data: {
        type: 'payment',
        strataId: paymentData.strataId,
      },
    });
  }

  async notifyMaintenanceUpdate(strataId: string, maintenanceData: { title: string; status: string; requestId: string }): Promise<void> {
    await this.sendToStrata(strataId, {
      title: 'Maintenance Update',
      body: `${maintenanceData.title} - Status: ${maintenanceData.status}`,
      data: {
        type: 'maintenance',
        strataId,
        resourceId: maintenanceData.requestId,
      },
    });
  }
}

export const pushNotificationService = new PushNotificationService();
