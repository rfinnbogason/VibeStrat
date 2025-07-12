import { getAuth } from 'firebase-admin/auth';
import { firebaseStorage } from './firebase-storage.js';
import { db } from './firebase-db.js';
import type { Meeting, User, InsertNotification } from '../shared/schema.js';

// Firebase email interface
interface FirebaseEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Firebase email function using Firestore trigger for Firebase Extensions
// This integrates with Firebase's Trigger Email extension
async function sendFirebaseEmail(emailData: FirebaseEmail): Promise<void> {
  try {
    console.log(`📧 Sending Firebase email to: ${emailData.to}`);
    console.log(`📧 Subject: ${emailData.subject}`);
    
    // Use Firebase Extensions pattern - adding to 'mail' collection triggers email sending
    // The Firebase Trigger Email extension monitors this collection
    const emailDoc = await db.collection('mail').add({
      to: emailData.to,
      message: {
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      },
      // Template and delivery settings
      template: {
        name: 'meeting-invitation',
        data: {
          subject: emailData.subject,
          content: emailData.html
        }
      },
      // Metadata for tracking
      delivery: {
        startTime: new Date().toISOString(),
        state: 'PENDING',
        attempts: 0,
        info: {
          messageId: null
        }
      },
      // Custom tracking fields
      vibestrat: {
        type: 'meeting_invitation',
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
      type: 'meeting_invitation',
      source: 'vibestrat'
    });
    
    console.log(`✅ Firebase email successfully queued for: ${emailData.to}`);
  } catch (error) {
    console.error('❌ Failed to queue Firebase email:', error);
    
    // Log the failure
    await db.collection('email_logs').add({
      to: emailData.to,
      subject: emailData.subject,
      sentAt: new Date().toISOString(),
      status: 'failed',
      error: error.message,
      type: 'meeting_invitation',
      source: 'vibestrat'
    });
    
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