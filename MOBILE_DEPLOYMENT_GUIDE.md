# VibeStrat Mobile App Deployment Guide

## Overview
This guide covers deploying VibeStrat to Google Play Store and Apple App Store using Capacitor, which wraps your React web app in a native mobile container.

## Prerequisites

### Development Environment Setup
1. **Node.js** (already installed)
2. **Android Studio** (for Android builds)
3. **Xcode** (for iOS builds - macOS only)
4. **Java Development Kit (JDK) 11 or later**

### Platform-Specific Requirements

#### Android (Google Play Store)
- Android Studio installed
- Android SDK configured
- Google Play Console account ($25 one-time fee)
- Keystore file for app signing

#### iOS (Apple App Store)  
- macOS development machine
- Xcode installed
- Apple Developer Account ($99/year)
- iOS development certificates

## Step 1: Build the Web App

```bash
# Build the production version
npm run build

# This creates the dist/public directory that Capacitor uses
```

## Step 2: Sync with Mobile Platforms

```bash
# Sync the built web app with mobile platforms
npx cap sync

# This copies the web app to android/app/src/main/assets/public
# and ios/App/App/public respectively
```

## Step 3: Configure Mobile App Settings

### Update App Information
Edit `capacitor.config.ts`:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vibestrat.app',
  appName: 'VibeStrat',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
  },
};

export default config;
```

### Add App Icons and Splash Screens
Create app icons and splash screens:

1. **App Icons**: Create icons in multiple sizes (1024x1024, 512x512, 192x192, etc.)
2. **Splash Screens**: Create splash screen images for different device sizes

Place these in:
- `android/app/src/main/res/` (Android)
- `ios/App/App/Assets.xcassets/` (iOS)

## Step 4: Configure Network Security

### Android Network Security
Create `android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">10.0.3.2</domain>
        <domain includeSubdomains="true">your-api-domain.com</domain>
    </domain-config>
</network-security-config>
```

### Update Android Manifest
Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    android:usesCleartextTraffic="true">
```

## Step 5: Handle API Endpoints

### Update API Configuration
Since the mobile app will need to connect to your backend API, update the API base URL in your app:

```typescript
// In your API configuration
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-deployed-api.replit.app' 
  : 'http://localhost:5000';
```

## Step 6: Build Mobile Apps

### Android Build
```bash
# Open Android Studio
npx cap open android

# In Android Studio:
# 1. Build → Generate Signed Bundle/APK
# 2. Choose Android App Bundle (recommended)
# 3. Create/select keystore
# 4. Build the AAB file
```

### iOS Build
```bash
# Open Xcode (macOS only)
npx cap open ios

# In Xcode:
# 1. Select your development team
# 2. Configure signing certificates
# 3. Build the app
# 4. Archive for distribution
```

## Step 7: App Store Submission

### Google Play Store
1. **Create Developer Account** ($25 one-time fee)
2. **Upload AAB file** to Google Play Console
3. **Fill app information**:
   - App name: VibeStrat
   - Description: Professional strata management platform
   - Category: Business
   - Target audience: Adults
4. **Add screenshots** (phone, tablet, TV if applicable)
5. **Set content rating**
6. **Submit for review**

### Apple App Store
1. **Create Developer Account** ($99/year)
2. **Create app in App Store Connect**
3. **Upload IPA file** using Xcode or Application Loader
4. **Fill app information**:
   - App name: VibeStrat
   - Description: Professional strata management platform
   - Category: Business
   - Keywords: strata, property management, HOA
5. **Add screenshots** (iPhone, iPad)
6. **Submit for review**

## Step 8: Testing

### Internal Testing
- **Google Play**: Use Internal Testing track
- **Apple**: Use TestFlight for beta testing

### Add Test Users
Invite team members and stakeholders to test the app before public release.

## Step 9: Production Deployment

### Backend Deployment
Ensure your backend API is deployed and accessible:

```bash
# Deploy your backend to Replit or other hosting service
# Make sure the API endpoints are accessible via HTTPS
```

### Mobile App Configuration
Update your mobile app configuration to point to the production API:

```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.vibestrat.app',
  appName: 'VibeStrat',
  webDir: 'dist/public',
  server: {
    url: 'https://your-api-domain.com', // Your production API
    cleartext: true
  }
};
```

## Step 10: Release Management

### Version Control
- Use semantic versioning (1.0.0, 1.0.1, etc.)
- Update version in `package.json` and platform-specific files
- Create release branches for each app store submission

### Continuous Integration
Set up CI/CD pipeline for automatic builds:

```yaml
# .github/workflows/mobile-build.yml
name: Mobile Build
on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build web app
        run: npm run build
      
      - name: Sync Capacitor
        run: npx cap sync
```

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Check Node.js version compatibility
   - Clear node_modules and reinstall dependencies
   - Verify all environment variables are set

2. **API Connection Issues**
   - Ensure CORS is properly configured on your backend
   - Check network security configuration
   - Verify SSL certificates for HTTPS endpoints

3. **App Store Rejection**
   - Follow platform-specific guidelines
   - Ensure app functions without internet connection where possible
   - Add proper error handling for network failures

### Performance Optimization

1. **Bundle Size**
   - Use tree shaking to eliminate unused code
   - Optimize images and assets
   - Consider code splitting for large apps

2. **Runtime Performance**
   - Implement proper loading states
   - Use efficient data structures
   - Optimize component rendering

## Security Considerations

### API Security
- Use HTTPS for all API communications
- Implement proper authentication tokens
- Validate all input data on the backend

### Mobile Security
- Obfuscate sensitive data in the app
- Use secure storage for tokens
- Implement certificate pinning for API calls

## Monitoring and Analytics

### App Performance
- Integrate crash reporting (Firebase Crashlytics)
- Monitor app performance metrics
- Track user engagement and retention

### API Monitoring
- Set up API monitoring and alerting
- Track API response times and error rates
- Monitor database performance

## Next Steps

1. **Build the web app** using `npm run build`
2. **Sync with mobile platforms** using `npx cap sync`
3. **Open in IDE** and configure app settings
4. **Test thoroughly** on real devices
5. **Submit to app stores** following their guidelines

## Support

For issues with:
- **Capacitor**: https://capacitorjs.com/docs
- **Google Play**: https://support.google.com/googleplay/android-developer
- **Apple App Store**: https://developer.apple.com/support/app-store/

---

This guide provides a comprehensive roadmap for deploying VibeStrat to mobile app stores. The process requires careful attention to platform-specific requirements and thorough testing before submission.