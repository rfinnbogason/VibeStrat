import { getAuth } from 'firebase-admin/auth';
import { firebaseStorage } from './firebase-storage.js';
import { db } from './firebase-db.js';
import type { Meeting, User, InsertNotification } from '../shared/schema.js';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid if API key is available
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@vibestrat.com';
const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME || 'VibeStrat';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized for email notifications');
} else {
  console.log('⚠️ SendGrid API key not configured - emails will be queued in Firestore only');
}

// Firebase email interface
interface FirebaseEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Send email using SendGrid or fallback to Firebase mail collection
async function sendFirebaseEmail(emailData: FirebaseEmail): Promise<void> {
  try {
    console.log(`📧 Sending email to: ${emailData.to}`);
    console.log(`📧 Subject: ${emailData.subject}`);

    // Try SendGrid first if configured
    if (SENDGRID_API_KEY) {
      try {
        const msg = {
          to: emailData.to,
          from: {
            email: SENDGRID_FROM_EMAIL,
            name: SENDGRID_FROM_NAME
          },
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
          trackingSettings: {
            clickTracking: { enable: true },
            openTracking: { enable: true }
          }
        };

        await sgMail.send(msg);
        console.log(`✅ SendGrid email sent successfully to: ${emailData.to}`);

        // Log successful email
        await db.collection('email_logs').add({
          to: emailData.to,
          subject: emailData.subject,
          sentAt: new Date().toISOString(),
          status: 'sent_sendgrid',
          source: 'vibestrat'
        });

        return;
      } catch (sendgridError: any) {
        console.error('❌ SendGrid failed, falling back to Firebase:', sendgridError.message);
        if (sendgridError.response) {
          console.error('SendGrid error details:', sendgridError.response.body);
        }
        // Fall through to Firebase fallback
      }
    }

    // Fallback: Use Firebase Extensions pattern - adding to 'mail' collection triggers email sending
    const emailDoc = await db.collection('mail').add({
      to: emailData.to,
      message: {
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      },
      delivery: {
        startTime: new Date().toISOString(),
        state: 'PENDING',
        attempts: 0
      },
      vibestrat: {
        source: 'vibestrat-system',
        timestamp: new Date().toISOString()
      }
    });

    console.log(`📧 Email queued in Firebase with ID: ${emailDoc.id}`);

    // Log successful email submission
    await db.collection('email_logs').add({
      to: emailData.to,
      subject: emailData.subject,
      firebaseDocId: emailDoc.id,
      sentAt: new Date().toISOString(),
      status: 'queued_firebase',
      source: 'vibestrat'
    });

    console.log(`✅ Email successfully queued for: ${emailData.to}`);
  } catch (error: any) {
    console.error('❌ Failed to send email:', error);

    // Log the failure
    try {
      await db.collection('email_logs').add({
        to: emailData.to,
        subject: emailData.subject,
        sentAt: new Date().toISOString(),
        status: 'failed',
        error: error.message,
        source: 'vibestrat'
      });
    } catch (logError) {
      console.error('Failed to log email error:', logError);
    }

    throw error;
  }
}

export interface MeetingInviteEmailData {
  meeting: Meeting;
  strata: {
    name: string;
    address: string;
  };
  invitees: User[];
  organizer: User;
}

export function generateMeetingInviteEmail(data: MeetingInviteEmailData): {
  subject: string;
  htmlBody: string;
  textBody: string;
} {
  const { meeting, strata, organizer } = data;
  
  // Format date and time
  const meetingDate = new Date(meeting.scheduledAt);
  const formattedDate = meetingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = meetingDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Email subject
  const subject = `📅 Meeting Invitation: ${meeting.title} - ${formattedDate}`;

  // HTML email body with professional styling
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
      <h1>📅 Meeting Invitation</h1>
      <p>You're invited to an upcoming meeting</p>
    </div>
    
    <div class="content">
      <div class="meeting-card">
        <h2 class="meeting-title">${meeting.title}</h2>
        
        <div class="meeting-details">
          <div class="detail-row">
            <div class="detail-icon">📅</div>
            <span class="detail-label">Date:</span>
            <span class="detail-value">${formattedDate}</span>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">🕐</div>
            <span class="detail-label">Time:</span>
            <span class="detail-value">${formattedTime}</span>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">📍</div>
            <span class="detail-label">Location:</span>
            <span class="detail-value">${meeting.location || 'To be determined'}</span>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">🏢</div>
            <span class="detail-label">Strata:</span>
            <span class="detail-value">${strata.name}</span>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">📋</div>
            <span class="detail-label">Type:</span>
            <span class="detail-value">${meeting.meetingType?.replace('_', ' ').toUpperCase() || 'General Meeting'}</span>
          </div>
        </div>
        
        ${meeting.agenda ? `
        <div class="agenda-section">
          <h3 class="agenda-title">📝 Meeting Agenda</h3>
          <div class="agenda-content">${meeting.agenda}</div>
        </div>
        ` : ''}
      </div>
      
      <div class="cta-section">
        <a href="${process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000'}/meetings" class="cta-button">
          View Meeting Details
        </a>
      </div>
      
      <div class="organizer-info">
        <div class="organizer-title">👤 Meeting Organizer</div>
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
      <p>${strata.address}</p>
      <p style="margin-top: 15px;">
        This is an automated message from VibeStrat. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>`;

  // Plain text fallback
  const textBody = `
MEETING INVITATION

${meeting.title}

Date: ${formattedDate}
Time: ${formattedTime}
Location: ${meeting.location || 'To be determined'}
Strata: ${strata.name}
Type: ${meeting.meetingType?.replace('_', ' ').toUpperCase() || 'General Meeting'}

${meeting.agenda ? `
AGENDA:
${meeting.agenda}
` : ''}

ORGANIZER:
${organizer.firstName} ${organizer.lastName}
${organizer.email}

Please mark your calendar and confirm your attendance. If you cannot attend, please notify the organizer as soon as possible.

View meeting details: ${process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000'}/meetings

---
VibeStrat - Strata Management Platform
${strata.address}

This is an automated message from VibeStrat. Please do not reply to this email.
`;

  return {
    subject,
    htmlBody,
    textBody
  };
}

export async function sendMeetingInviteEmails(emailData: MeetingInviteEmailData): Promise<void> {
  const { subject, htmlBody, textBody } = generateMeetingInviteEmail(emailData);
  
  // Create beautiful in-app notifications for each invitee
  for (const invitee of emailData.invitees) {
    try {
      console.log(`📧 Creating meeting invitation notification for: ${invitee.email}`);
      
      // Create a rich notification in the app
      const notificationData: InsertNotification = {
        userId: invitee.id,
        strataId: emailData.meeting.strataId,
        type: 'meeting_invitation',
        title: `📅 Meeting Invitation: ${emailData.meeting.title}`,
        message: `You're invited to ${emailData.meeting.title} on ${new Date(emailData.meeting.scheduledAt).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })} at ${new Date(emailData.meeting.scheduledAt).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}. Click to view details.`,
        priority: 'high',
        metadata: {
          meetingId: emailData.meeting.id,
          meetingTitle: emailData.meeting.title,
          meetingDate: emailData.meeting.scheduledAt,
          organizer: `${emailData.organizer.firstName} ${emailData.organizer.lastName}`,
          location: emailData.meeting.location || 'TBD',
          type: emailData.meeting.meetingType || 'general_meeting'
        }
      };
      
      await firebaseStorage.createNotification(notificationData);
      
      // Send actual email notification using Firebase's email capability
      // We'll use Firebase's built-in email service
      try {
        await sendFirebaseEmail({
          to: invitee.email,
          subject,
          html: htmlBody,
          text: textBody
        });
        console.log(`✅ Meeting invitation email sent to ${invitee.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${invitee.email}:`, emailError);
        // Still create the notification even if email fails
      }
      
      console.log(`✅ Meeting invitation notification created for ${invitee.email}`);
      
    } catch (error) {
      console.error(`❌ Failed to create meeting invite notification for ${invitee.email}:`, error);
    }
  }
  
  console.log(`📧 Meeting invitation notifications sent to ${emailData.invitees.length} recipients`);
}

// Generalized email notification service for all notification types
export interface NotificationEmailData {
  userId: string;
  userEmail: string;
  strataId: string;
  strataName: string;
  notificationType: string;
  title: string;
  message: string;
  metadata?: any;
}

// Map notification types to email template settings
const notificationTypeSettings: Record<string, {
  emailSubject: (data: NotificationEmailData) => string;
  requiresEmailNotification: (notificationSettings: any) => boolean;
  priority: 'high' | 'medium' | 'low';
}> = {
  'repair-request-update': {
    emailSubject: (data) => `🔧 Maintenance Update: ${data.title}`,
    requiresEmailNotification: (settings) => settings?.maintenanceAlerts !== false,
    priority: 'medium'
  },
  'repair-request-assigned': {
    emailSubject: (data) => `🔧 New Maintenance Assignment: ${data.title}`,
    requiresEmailNotification: (settings) => settings?.maintenanceAlerts !== false,
    priority: 'high'
  },
  'quote-submitted': {
    emailSubject: (data) => `📋 New Quote Received: ${data.title}`,
    requiresEmailNotification: (settings) => settings?.quoteUpdates !== false,
    priority: 'medium'
  },
  'quote-approved': {
    emailSubject: (data) => `✅ Quote Approved: ${data.title}`,
    requiresEmailNotification: (settings) => settings?.quoteUpdates !== false,
    priority: 'high'
  },
  'quote-rejected': {
    emailSubject: (data) => `❌ Quote Rejected: ${data.title}`,
    requiresEmailNotification: (settings) => settings?.quoteUpdates !== false,
    priority: 'medium'
  },
  'meeting_invitation': {
    emailSubject: (data) => `📅 Meeting Invitation: ${data.title}`,
    requiresEmailNotification: (settings) => settings?.meetingReminders !== false,
    priority: 'high'
  },
  'meeting-reminder': {
    emailSubject: (data) => `⏰ Meeting Reminder: ${data.title}`,
    requiresEmailNotification: (settings) => settings?.meetingReminders !== false,
    priority: 'high'
  },
  'announcement': {
    emailSubject: (data) => `📢 New Announcement: ${data.title}`,
    requiresEmailNotification: (settings) => settings?.announcementNotifications !== false,
    priority: 'medium'
  },
  'payment-reminder': {
    emailSubject: (data) => `💰 Payment Reminder: ${data.title}`,
    requiresEmailNotification: (settings) => settings?.paymentReminders !== false,
    priority: 'high'
  },
  'payment-overdue': {
    emailSubject: (data) => `⚠️ Overdue Payment: ${data.title}`,
    requiresEmailNotification: (settings) => settings?.paymentReminders !== false,
    priority: 'high'
  },
  'expense-approved': {
    emailSubject: (data) => `✅ Expense Approved: ${data.title}`,
    requiresEmailNotification: (settings) => settings?.emailNotifications !== false,
    priority: 'medium'
  },
  'expense-rejected': {
    emailSubject: (data) => `❌ Expense Rejected: ${data.title}`,
    requiresEmailNotification: (settings) => settings?.emailNotifications !== false,
    priority: 'medium'
  },
  'emergency': {
    emailSubject: (data) => `🚨 EMERGENCY ALERT: ${data.title}`,
    requiresEmailNotification: (settings) => true, // Always send emergency alerts
    priority: 'high'
  }
};

/**
 * Send email notification for any notification type
 * Respects user's notification preferences and quiet hours
 */
export async function sendNotificationEmail(emailData: NotificationEmailData): Promise<boolean> {
  try {
    console.log(`📧 Processing email notification for: ${emailData.userEmail}`);
    console.log(`📧 Notification type: ${emailData.notificationType}`);

    // Get user's notification settings
    const userSnapshot = await db
      .collection('users')
      .where('id', '==', emailData.userId)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      console.log(`❌ User not found: ${emailData.userId}`);
      return false;
    }

    const userData = userSnapshot.docs[0].data();
    const notificationSettings = userData.notificationSettings || {};

    // Check if user has email notifications enabled
    if (notificationSettings.emailNotifications === false) {
      console.log(`⏭️  Email notifications disabled for user: ${emailData.userEmail}`);
      return false;
    }

    // Get notification type settings
    const typeSettings = notificationTypeSettings[emailData.notificationType] || {
      emailSubject: (data: NotificationEmailData) => `📬 ${data.title}`,
      requiresEmailNotification: () => true,
      priority: 'medium' as const
    };

    // Check if this notification type requires email
    if (!typeSettings.requiresEmailNotification(notificationSettings)) {
      console.log(`⏭️  Email notifications disabled for type: ${emailData.notificationType}`);
      return false;
    }

    // Check quiet hours (don't skip emergency alerts)
    if (emailData.notificationType !== 'emergency' && notificationSettings.quietHoursEnabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const quietStart = notificationSettings.quietHoursStart || '22:00';
      const quietEnd = notificationSettings.quietHoursEnd || '08:00';

      // Simple time comparison (doesn't handle overnight ranges perfectly, but good enough)
      if (currentTime >= quietStart || currentTime <= quietEnd) {
        console.log(`⏭️  Quiet hours active for user: ${emailData.userEmail}`);
        return false;
      }
    }

    // Generate email subject
    const subject = typeSettings.emailSubject(emailData);

    // Generate email HTML body
    const htmlBody = generateNotificationEmailHTML(emailData, typeSettings.priority);

    // Generate plain text fallback
    const textBody = generateNotificationEmailText(emailData);

    // Send email using Firebase
    await sendFirebaseEmail({
      to: emailData.userEmail,
      subject,
      html: htmlBody,
      text: textBody
    });

    console.log(`✅ Email notification sent to ${emailData.userEmail} for type: ${emailData.notificationType}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to send email notification to ${emailData.userEmail}:`, error);
    return false;
  }
}

/**
 * Generate HTML email body for notification
 */
function generateNotificationEmailHTML(data: NotificationEmailData, priority: string): string {
  const priorityColors = {
    high: '#dc2626',
    medium: '#f59e0b',
    low: '#10b981'
  };
  const priorityColor = priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notification</title>
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
    .priority-badge {
      display: inline-block;
      background: ${priorityColor};
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 10px;
    }
    .content {
      padding: 30px;
    }
    .notification-card {
      background: #f8fafc;
      border-left: 4px solid ${priorityColor};
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .notification-title {
      font-size: 20px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 10px 0;
    }
    .notification-message {
      color: #4a5568;
      line-height: 1.6;
    }
    .metadata-section {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 15px;
      margin-top: 20px;
    }
    .metadata-item {
      display: flex;
      justify-between;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .metadata-item:last-child {
      border-bottom: none;
    }
    .metadata-label {
      font-weight: 600;
      color: #4a5568;
    }
    .metadata-value {
      color: #2d3748;
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
    }
    .footer {
      background: #f7fafc;
      padding: 25px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      color: #718096;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>📬 Notification</h1>
      <div class="priority-badge">${priority} priority</div>
    </div>

    <div class="content">
      <div class="notification-card">
        <h2 class="notification-title">${data.title}</h2>
        <p class="notification-message">${data.message}</p>
      </div>

      ${data.metadata && Object.keys(data.metadata).length > 0 ? `
      <div class="metadata-section">
        <h3 style="margin-top: 0; font-size: 16px; color: #2d3748;">Details</h3>
        ${Object.entries(data.metadata).map(([key, value]) => `
          <div class="metadata-item">
            <span class="metadata-label">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
            <span class="metadata-value">${value}</span>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="cta-section">
        <a href="${process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000'}/dashboard" class="cta-button">
          View in Dashboard
        </a>
      </div>

      <p style="margin-top: 25px; color: #718096; font-size: 14px;">
        This notification was sent to you based on your role and notification preferences in ${data.strataName}.
      </p>
    </div>

    <div class="footer">
      <p><strong>Strata Management Platform</strong></p>
      <p>${data.strataName}</p>
      <p style="margin-top: 15px;">
        You can manage your notification preferences in Account Settings.
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate plain text email body for notification
 */
function generateNotificationEmailText(data: NotificationEmailData): string {
  let text = `NOTIFICATION\n\n`;
  text += `${data.title}\n\n`;
  text += `${data.message}\n\n`;

  if (data.metadata && Object.keys(data.metadata).length > 0) {
    text += `DETAILS:\n`;
    for (const [key, value] of Object.entries(data.metadata)) {
      text += `${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value}\n`;
    }
    text += `\n`;
  }

  text += `View in Dashboard: ${process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000'}/dashboard\n\n`;
  text += `---\n`;
  text += `Strata Management Platform\n`;
  text += `${data.strataName}\n\n`;
  text += `You can manage your notification preferences in Account Settings.\n`;

  return text;
}