#!/bin/bash

# VibeStrat Mobile Build Script
# This script builds the web app and prepares it for mobile deployment

echo "🏗️  Building VibeStrat for mobile deployment..."

# Step 1: Build the web application
echo "📦 Building web application..."
vite build --outDir dist/public

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Web build failed. Please fix build errors and try again."
    exit 1
fi

echo "✅ Web build completed successfully!"

# Step 2: Sync with Capacitor
echo "📱 Syncing with mobile platforms..."
npx cap sync

# Check if sync was successful
if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed. Please check your configuration."
    exit 1
fi

echo "✅ Mobile sync completed successfully!"

# Step 3: Display next steps
echo ""
echo "🎉 Mobile build preparation complete!"
echo ""
echo "Next steps:"
echo "📱 For Android: npx cap open android"
echo "🍎 For iOS: npx cap open ios (requires macOS)"
echo ""
echo "Then:"
echo "• Build the app in Android Studio or Xcode"
echo "• Test on real devices"
echo "• Generate signed APK/AAB (Android) or IPA (iOS)"
echo "• Upload to Google Play Store or Apple App Store"
echo ""
echo "📖 See MOBILE_DEPLOYMENT_GUIDE.md for detailed instructions"