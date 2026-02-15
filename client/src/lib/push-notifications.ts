import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationPayload {
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
  private initialized = false;
  private fcmToken: string | null = null;

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      // ✅ SECURITY: Removed console logging
      return;
    }

    if (this.initialized) {
      return;
    }

    try {
      // Request permission
      const permStatus = await PushNotifications.requestPermissions();

      if (permStatus.receive === 'granted') {
        // Register with Apple / Google to receive push notifications
        await PushNotifications.register();

        // Listeners for push notification events
        PushNotifications.addListener('registration', (token: Token) => {
          // ✅ SECURITY: Removed FCM token logging
          this.fcmToken = token.value;
          this.saveFCMToken(token.value);
        });

        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('❌ Push registration error:', error);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          // ✅ SECURITY: Removed notification logging
          // Handle foreground notification
          this.handleForegroundNotification(notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
          // ✅ SECURITY: Removed notification logging
          // Handle notification tap
          this.handleNotificationAction(notification);
        });

        this.initialized = true;
        // ✅ SECURITY: Removed logging
      } else {
        console.warn('⚠️ Push notification permission not granted');
      }
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
    }
  }

  private async saveFCMToken(token: string): Promise<void> {
    try {
      // Send FCM token to backend
      const response = await fetch('/api/user/fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        // ✅ SECURITY: Removed FCM token logging
        localStorage.setItem('fcm_token', token);
      } else {
        console.error('❌ Failed to save FCM token');
      }
    } catch (error) {
      console.error('❌ Error saving FCM token:', error);
    }
  }

  private async getAuthToken(): Promise<string | null> {
    return localStorage.getItem('auth_token');
  }

  private handleForegroundNotification(notification: PushNotificationSchema): void {
    // Show in-app notification banner
    const event = new CustomEvent('foreground-notification', {
      detail: notification,
    });
    window.dispatchEvent(event);
  }

  private handleNotificationAction(notification: ActionPerformed): void {
    const data = notification.notification.data;

    if (!data) return;

    // Navigate based on notification type
    switch (data.type) {
      case 'message':
        window.location.href = `/communications?strataId=${data.strataId}`;
        break;
      case 'meeting':
        window.location.href = `/meetings?id=${data.resourceId}&strataId=${data.strataId}`;
        break;
      case 'approval':
        window.location.href = `/dashboard?strataId=${data.strataId}`;
        break;
      case 'announcement':
        window.location.href = `/dashboard?strataId=${data.strataId}`;
        break;
      case 'payment':
        window.location.href = `/financial?strataId=${data.strataId}`;
        break;
      case 'maintenance':
        window.location.href = `/maintenance?id=${data.resourceId}&strataId=${data.strataId}`;
        break;
      default:
        window.location.href = '/dashboard';
    }
  }

  async getFCMToken(): Promise<string | null> {
    return this.fcmToken || localStorage.getItem('fcm_token');
  }

  async clearToken(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await PushNotifications.removeAllListeners();
      }
      this.fcmToken = null;
      localStorage.removeItem('fcm_token');
      // ✅ SECURITY: Removed logging
    } catch (error) {
      console.error('❌ Error clearing FCM token:', error);
    }
  }
}

export const pushNotificationService = new PushNotificationService();
