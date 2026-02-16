// Push notifications are temporarily disabled.
// Can be enabled with Web Push or another provider later.

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
  async sendToUser(userId: string, notification: PushNotificationData): Promise<void> {
    console.log(`[Push disabled] Would send to user ${userId}: ${notification.title}`);
  }

  async sendToUsers(userIds: string[], notification: PushNotificationData): Promise<void> {
    console.log(`[Push disabled] Would send to ${userIds.length} users: ${notification.title}`);
  }

  async sendToStrata(strataId: string, notification: PushNotificationData): Promise<void> {
    console.log(`[Push disabled] Would send to strata ${strataId}: ${notification.title}`);
  }

  async notifyNewMessage(strataId: string, messageData: { sender: string; preview: string }): Promise<void> {
    console.log(`[Push disabled] New message in strata ${strataId} from ${messageData.sender}`);
  }

  async notifyMeetingInvite(userIds: string[], meetingData: { title: string; date: string; strataId: string; meetingId: string }): Promise<void> {
    console.log(`[Push disabled] Meeting invite: ${meetingData.title}`);
  }

  async notifyApprovalRequired(userIds: string[], approvalData: { type: string; title: string; strataId: string }): Promise<void> {
    console.log(`[Push disabled] Approval required: ${approvalData.title}`);
  }

  async notifyNewAnnouncement(strataId: string, announcementData: { title: string; preview: string }): Promise<void> {
    console.log(`[Push disabled] Announcement: ${announcementData.title}`);
  }

  async notifyPaymentReminder(userId: string, paymentData: { amount: number; dueDate: string; strataId: string }): Promise<void> {
    console.log(`[Push disabled] Payment reminder for user ${userId}: $${paymentData.amount}`);
  }

  async notifyMaintenanceUpdate(strataId: string, maintenanceData: { title: string; status: string; requestId: string }): Promise<void> {
    console.log(`[Push disabled] Maintenance update: ${maintenanceData.title}`);
  }
}

export const pushNotificationService = new PushNotificationService();
