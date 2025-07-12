# Firebase Email Setup Guide

This guide walks through setting up Firebase email functionality for password resets and user management.

## Firebase Console Configuration

### 1. Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`viberstrat`)
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Email/Password** provider
5. Click **Save**

### 2. Configure Email Templates

1. In **Authentication** > **Templates**
2. Customize the following templates:
   - **Password reset**: For users who forgot their password
   - **Email address verification**: For new account verification
   - **Email address change**: When users update their email

### 3. Configure Authorized Domains

1. Go to **Authentication** > **Settings** > **Authorized domains**
2. Add your domains:
   - `localhost` (for development)
   - Your Replit development URL
   - Your production domain (when deployed)

## Email Configuration Options

### Option 1: Default Firebase Email (Recommended for Development)

Firebase provides a default email service that works out of the box:
- Sender: `noreply@viberstrat.firebaseapp.com`
- Basic email templates
- No additional configuration required
- Suitable for development and testing

### Option 2: Custom SMTP (For Production)

For production, configure a custom SMTP service:

1. Go to **Authentication** > **Settings** > **Email**
2. Click **Customize email action handler**
3. Configure custom SMTP settings:
   - **SMTP Server**: Your email provider's SMTP server
   - **Port**: Usually 587 for TLS
   - **Username**: Your email service username
   - **Password**: Your email service password
   - **From Email**: Your custom domain email

## Integration with Application

### Current Implementation

The application uses Firebase's built-in email system:

```typescript
// Password Reset
import { sendPasswordResetEmail } from 'firebase/auth';

async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}
```

### Email Templates

Firebase will automatically send emails for:
- **Password Reset**: When admin resets user password
- **New User Setup**: When admin creates new users
- **Account Recovery**: When users request password reset

### Customization

You can customize email templates with:
- Your company branding
- Custom logos and colors
- Personalized messaging
- Multiple language support

## Testing Email Functionality

### Development Testing

1. Use a real email address for testing
2. Check spam/junk folders
3. Test with different email providers (Gmail, Yahoo, etc.)

### Production Testing

1. Test with your custom domain email
2. Verify email deliverability
3. Check email formatting across different clients
4. Monitor email delivery rates

## Email Best Practices

### Security
- Use strong SMTP passwords
- Enable two-factor authentication on email accounts
- Regularly rotate email service credentials

### Deliverability
- Use authenticated domains
- Avoid spam trigger words
- Include unsubscribe options (for marketing emails)
- Monitor bounce rates

### User Experience
- Clear, actionable email content
- Mobile-friendly email templates
- Quick and easy password reset process
- Helpful error messages

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check Firebase configuration
   - Verify authorized domains
   - Check SMTP settings (if using custom)

2. **Emails going to spam**
   - Configure SPF/DKIM records
   - Use authenticated domain
   - Check email content for spam triggers

3. **Reset links not working**
   - Verify authorized domains include your app domain
   - Check link expiration settings
   - Ensure proper Firebase configuration

### Error Messages

- `auth/invalid-email`: Invalid email format
- `auth/user-not-found`: Email not registered
- `auth/too-many-requests`: Rate limiting (try again later)
- `auth/network-request-failed`: Network connectivity issue

## Production Checklist

- [ ] Custom SMTP configured
- [ ] Email templates customized with branding
- [ ] Authorized domains include production domain
- [ ] SPF/DKIM records configured
- [ ] Email deliverability tested
- [ ] Error handling implemented
- [ ] User feedback mechanisms in place

## Support

For additional help:
- [Firebase Documentation](https://firebase.google.com/docs/auth/web/manage-users)
- [Firebase Support](https://firebase.google.com/support)
- Firebase Console > Support tab

---

This email system provides secure, reliable password reset functionality without requiring external email service API keys or complex SMTP configuration.