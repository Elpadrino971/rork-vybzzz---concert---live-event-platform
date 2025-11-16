# VyBzzZ Mobile App - Production Deployment Guide

This guide covers the complete process of deploying the VyBzzZ mobile app to production (App Store & Google Play).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Testing Before Deployment](#testing-before-deployment)
4. [Building for Production](#building-for-production)
5. [App Store Submission (iOS)](#app-store-submission-ios)
6. [Google Play Submission (Android)](#google-play-submission-android)
7. [Post-Launch Monitoring](#post-launch-monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

- [ ] **Expo Account** (https://expo.dev)
  - Create an account and organization for VyBzzZ
  - Install EAS CLI: `npm install -g eas-cli`
  - Login: `eas login`

- [ ] **Apple Developer Account** (iOS) - $99/year
  - URL: https://developer.apple.com
  - Required for App Store submission
  - Must be enrolled in Apple Developer Program

- [ ] **Google Play Console Account** (Android) - $25 one-time
  - URL: https://play.google.com/console
  - Required for Google Play submission

### Development Environment

```bash
# Install Expo CLI globally
npm install -g expo-cli eas-cli

# Verify installation
expo --version
eas --version

# Login to Expo
eas login
```

---

## Environment Configuration

### 1. Create Production Environment File

Create `.env.production` in the mobile folder:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-production-key

# API Configuration
EXPO_PUBLIC_API_URL=https://your-production-backend.railway.app

# Environment
EXPO_PUBLIC_ENV=production
```

### 2. Update EAS Configuration

Edit `eas.json` to include your environment variables:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "your-production-url",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key",
        "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY": "pk_live_...",
        "EXPO_PUBLIC_API_URL": "https://your-backend.railway.app"
      }
    }
  }
}
```

### 3. Update App Configuration

Edit `app.json`:

```json
{
  "expo": {
    "name": "VyBzzZ",
    "slug": "vybzzz-mobile",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.vybzzz.mobile",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.vybzzz.mobile",
      "versionCode": 1
    },
    "extra": {
      "eas": {
        "projectId": "YOUR_ACTUAL_PROJECT_ID"
      }
    }
  }
}
```

**Get Project ID:**
```bash
eas project:init
# This will create/link an EAS project and update app.json
```

---

## Testing Before Deployment

### 1. Run Full Test Suite

```bash
# Test all functionality
npm run test

# Test Stripe integration (use test mode first)
# Purchase ticket, send tip, verify payments work

# Test real-time features
# Join live event, send chat messages, verify subscriptions

# Test push notifications
# Register device, send test notification, verify delivery
```

### 2. Build Preview Version

```bash
# Build preview APK/IPA for testing
eas build --profile preview --platform all

# Or build for specific platform
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

### 3. Internal Testing

**iOS (TestFlight):**
```bash
# Submit preview build to TestFlight
eas submit --platform ios --profile preview

# Add internal testers in App Store Connect
# Share TestFlight link
```

**Android (Internal Testing):**
```bash
# Download APK from EAS build
# Share with internal testers
# Or upload to Google Play Internal Testing track
```

### 4. Critical Test Checklist

- [ ] User can sign up and sign in
- [ ] User can browse events
- [ ] User can purchase tickets with Stripe
- [ ] User can view purchased tickets with QR codes
- [ ] User can watch live events
- [ ] Real-time chat works during live events
- [ ] User can send tips to artists
- [ ] Push notifications work
- [ ] Avatar upload works
- [ ] Settings are saved correctly
- [ ] App doesn't crash on any screen
- [ ] All API calls succeed (check network tab)

---

## Building for Production

### iOS Production Build

```bash
# 1. Configure Apple credentials (first time only)
eas credentials

# 2. Build production IPA
eas build --platform ios --profile production

# 3. Wait for build to complete (15-30 minutes)
# Build will be available at: https://expo.dev/accounts/vybzzz/projects/vybzzz-mobile/builds
```

### Android Production Build

```bash
# 1. Build production AAB (App Bundle)
eas build --platform android --profile production

# 2. Wait for build to complete (15-30 minutes)
```

### Build Both Platforms Simultaneously

```bash
eas build --platform all --profile production
```

---

## App Store Submission (iOS)

### 1. Prepare App Store Connect

1. **Create App in App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Click "My Apps" → "+" → "New App"
   - Fill in:
     - Platform: iOS
     - Name: VyBzzZ
     - Primary Language: French
     - Bundle ID: com.vybzzz.mobile
     - SKU: vybzzz-mobile-ios
     - User Access: Full Access

2. **Fill App Information**
   - **Category**: Music
   - **Subcategory**: Live Events
   - **Content Rights**: Check if you own all rights
   - **Age Rating**:
     - Unrestricted Web Access: Yes
     - Gambling: No
     - Contests: No
     - Made for Kids: No

3. **Prepare App Store Assets**
   - **Icon**: 1024x1024 (no transparency, no rounded corners)
   - **Screenshots** (iPhone):
     - 6.5" (1284 x 2778) - iPhone 14 Pro Max
     - 5.5" (1242 x 2208) - iPhone 8 Plus
   - **Screenshots** (iPad - optional):
     - 12.9" (2048 x 2732) - iPad Pro
   - **App Preview Video** (optional): 15-30 seconds

4. **Write App Store Description**

**Title:**
```
VyBzzZ - Live Concert Streaming
```

**Subtitle:**
```
Stream exclusive concerts & support artists
```

**Description:**
```
VyBzzZ est la première plateforme française de streaming de concerts en direct. Découvrez des performances live exclusives de vos artistes préférés, interagissez en temps réel via le chat, et soutenez directement les musiciens grâce aux pourboires.

FONCTIONNALITÉS PRINCIPALES:
✨ Concerts en direct et en exclusivité
🎫 Achat de tickets sécurisé avec Stripe
💬 Chat en temps réel pendant les événements
💝 Envoi de pourboires directement aux artistes
📱 Notifications pour les nouveaux concerts
🎵 Bibliothèque de vos tickets et événements passés

POUR LES FANS:
- Accédez à des concerts exclusifs depuis chez vous
- Interagissez avec d'autres fans et les artistes
- Soutenez vos artistes préférés avec des tips
- Recevez des notifications pour les événements à venir

POUR LES ARTISTES:
- Monétisez vos performances en direct
- Touchez un public mondial
- Recevez jusqu'à 70% des revenus des tickets
- Gardez 90% des pourboires reçus

VyBzzZ révolutionne l'industrie de la musique live en offrant une plateforme équitable et transparente pour tous.

Rejoignez la communauté VyBzzZ dès aujourd'hui !
```

**Keywords (max 100 chars):**
```
concert,live,streaming,musique,artiste,ticket,event,show,music,performance
```

**Support URL:**
```
https://vybzzz.com/support
```

**Privacy Policy URL:**
```
https://vybzzz.com/legal/privacy
```

### 2. Submit Build

```bash
# Submit the build to App Store Connect
eas submit --platform ios --profile production

# Or manually:
# 1. Download IPA from EAS dashboard
# 2. Use Transporter app to upload to App Store Connect
```

### 3. Configure App Store Connect

1. Go to App Store Connect → Your App → Version
2. **Build**: Select the build you just uploaded
3. **Version Information**:
   - Version: 1.0.0
   - Copyright: © 2025 VyBzzZ
   - Trade Representative Contact: Your contact info
4. **App Review Information**:
   - Contact Name, Email, Phone
   - Demo Account (for reviewers):
     - Email: demo@vybzzz.com
     - Password: DemoPass123!
   - Notes: "VyBzzZ is a live concert streaming platform. Use the demo account to explore features. No live events may be scheduled during review."
5. **Version Release**: Automatic or Manual
6. Click "Save" then "Submit for Review"

### 4. Wait for Review

- **Timeline**: 1-7 days typically
- **Status Updates**: Check App Store Connect
- **Rejections**: Address issues and resubmit

---

## Google Play Submission (Android)

### 1. Prepare Google Play Console

1. **Create App**
   - Go to https://play.google.com/console
   - Click "Create App"
   - Fill in:
     - App name: VyBzzZ
     - Default language: French
     - App or game: App
     - Free or paid: Free
     - Declarations: Complete all checkboxes

2. **Store Listing**
   - **Short Description** (max 80 chars):
     ```
     Streaming de concerts live - Soutenez vos artistes préférés
     ```

   - **Full Description** (max 4000 chars):
     ```
     VyBzzZ est la première plateforme française de streaming de concerts en direct.

     🎵 FONCTIONNALITÉS

     ✨ CONCERTS EN DIRECT
     Profitez de performances live exclusives de vos artistes préférés depuis le confort de votre maison.

     🎫 ACHAT SÉCURISÉ
     Achetez vos tickets en toute sécurité avec Stripe. Prix transparents et Happy Hour tous les mercredis.

     💬 CHAT EN TEMPS RÉEL
     Interagissez avec les autres fans et parfois même avec les artistes pendant les concerts.

     💝 SOUTENEZ LES ARTISTES
     Envoyez des pourboires directement aux musiciens. 90% va directement à l'artiste.

     📱 NOTIFICATIONS
     Recevez des alertes pour les nouveaux concerts et les événements à venir.

     🎵 VOTRE BIBLIOTHÈQUE
     Accédez à tous vos tickets et revivez vos événements passés.

     POUR LES FANS:
     • Concerts exclusifs accessibles partout
     • Interaction en temps réel
     • Soutien direct aux artistes
     • Happy Hour hebdomadaire (mercredi 20h)

     POUR LES ARTISTES:
     • Monétisation de performances live
     • Audience mondiale
     • 50-70% de revenus tickets
     • 90% des pourboires

     VyBzzZ crée un écosystème équitable où fans et artistes se connectent directement.

     Téléchargez VyBzzZ et rejoignez la révolution du live streaming musical !

     ---

     CONDITIONS:
     • Connexion internet requise
     • Compte VyBzzZ gratuit
     • Achat de tickets pour accéder aux concerts

     Support: support@vybzzz.com
     Site web: https://vybzzz.com
     ```

3. **Assets**
   - **App Icon**: 512x512 (uploaded automatically from build)
   - **Feature Graphic**: 1024x500
   - **Screenshots**:
     - Phone: At least 2 (1080x1920 recommended)
     - 7-inch tablet: Optional
     - 10-inch tablet: Optional
   - **Video**: YouTube URL (optional)

4. **Categorization**
   - **App Category**: Music & Audio
   - **Tags**: concert, live, streaming, music, events
   - **Content Rating**: Complete questionnaire
     - Violence: None
     - Sexual Content: None
     - Language: Mild
     - Gambling: None
     - Result: PEGI 3 / Everyone

5. **Store Settings**
   - **Countries**: All countries (or select specific)
   - **Primary Language**: French
   - **Additional Languages**: English, Spanish (optional)

### 2. Upload Build

```bash
# Submit AAB to Google Play
eas submit --platform android --profile production

# Or manually:
# 1. Download AAB from EAS dashboard
# 2. Upload to Google Play Console → Production → Create Release
```

### 3. Create Production Release

1. **Production Track** → **Create Release**
2. **Upload** the AAB file
3. **Release Name**: 1.0.0
4. **Release Notes** (What's New):
   ```
   🎉 Première version de VyBzzZ !

   ✨ Fonctionnalités:
   • Streaming de concerts en direct
   • Achat de tickets sécurisé
   • Chat temps réel
   • Envoi de pourboires aux artistes
   • Notifications push
   • Gestion de profil

   Rejoignez la communauté VyBzzZ !
   ```
5. Click "Review Release"
6. Click "Start Rollout to Production"

### 4. Complete App Content

Before publishing, complete all required sections:

- [ ] **Privacy Policy**: Add URL
- [ ] **Data Safety**: Declare data collection
  - User data collected: Email, Name, Payment Info
  - Purpose: Account creation, Payments
  - Data encrypted in transit and at rest
  - Users can request deletion
- [ ] **App Access**: Provide demo account if required
- [ ] **Ads**: No ads
- [ ] **Content Rating**: Complete questionnaire
- [ ] **Target Audience**: All ages
- [ ] **News Apps**: Not a news app
- [ ] **COVID-19 Contact Tracing**: No
- [ ] **Data Safety Form**: Complete all sections

### 5. Publish

1. Click "Publish" on the dashboard
2. **Timeline**: Review takes 1-7 days
3. **Status**: Track in Google Play Console

---

## Post-Launch Monitoring

### 1. Set Up Analytics

**Expo Analytics:**
```bash
# Install analytics
npx expo install expo-analytics-amplitude

# Or use Google Analytics
npx expo install expo-firebase-analytics
```

**Sentry (Error Tracking):**
```bash
npm install @sentry/react-native

# Configure in app/_layout.tsx
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

### 2. Monitor Key Metrics

- **Crash-free rate**: Should be > 99%
- **App load time**: Should be < 3 seconds
- **User retention**: Day 1, Day 7, Day 30
- **Active users**: DAU, MAU
- **Ticket purchases**: Conversion rate
- **Revenue**: Daily, weekly, monthly

### 3. User Feedback

- **Monitor Reviews**: Respond within 24 hours
  - App Store: Use App Store Connect
  - Google Play: Use Play Console

- **Crash Reports**: Fix critical crashes immediately
  - Use Sentry or Firebase Crashlytics
  - Priority: Crashes affecting >1% of users

- **Feature Requests**: Track in backlog
  - Common requests should be prioritized
  - Use in-app feedback mechanism

### 4. App Updates

**When to Update:**
- Critical bugs: Within 24-48 hours
- Security issues: Immediately
- New features: Monthly releases
- Performance improvements: As needed

**Update Process:**
```bash
# 1. Increment version
# Update app.json: "version": "1.0.1"
# iOS: Increment buildNumber
# Android: Increment versionCode

# 2. Build new version
eas build --platform all --profile production

# 3. Submit to stores
eas submit --platform all --profile production

# 4. Update release notes
# Document changes in both App Store and Play Console
```

---

## Troubleshooting

### Common Build Issues

**Issue: Build fails with "Expo SDK version mismatch"**
```bash
# Solution: Update Expo SDK
npx expo install expo@latest
npm install
```

**Issue: iOS build fails with provisioning profile error**
```bash
# Solution: Reset credentials and try again
eas credentials
# Select "Remove Provisioning Profile"
eas build --platform ios --clear-cache
```

**Issue: Android build fails with keystore error**
```bash
# Solution: Reset keystore
eas credentials
# Select "Remove Keystore"
eas build --platform android
```

### Common Submission Issues

**Issue: App Store rejection - "Missing privacy policy"**
- **Solution**: Add privacy policy URL in app.json and App Store Connect

**Issue: Google Play rejection - "Data safety form incomplete"**
- **Solution**: Complete all sections of Data Safety form in Play Console

**Issue: "App crashes on launch"**
- **Solution**: Test production build before submission
```bash
# Download production build and test on device
eas build:run --profile production --platform ios
```

### Environment Issues

**Issue: API calls fail in production**
- **Check**: EXPO_PUBLIC_API_URL is correct
- **Check**: Backend is deployed and accessible
- **Check**: CORS is configured for mobile app

**Issue: Stripe payments fail**
- **Check**: Using pk_live_... key (not pk_test_...)
- **Check**: Stripe webhook is configured for production
- **Check**: Backend has correct STRIPE_SECRET_KEY

**Issue: Supabase connection fails**
- **Check**: EXPO_PUBLIC_SUPABASE_URL is production URL
- **Check**: EXPO_PUBLIC_SUPABASE_ANON_KEY is correct
- **Check**: RLS policies allow authenticated users

---

## Deployment Checklist

### Pre-Deployment
- [ ] All features tested and working
- [ ] No console errors or warnings
- [ ] App icon and splash screen added
- [ ] Environment variables configured for production
- [ ] Privacy policy and terms of service URLs added
- [ ] Demo account created for app review
- [ ] App Store / Play Store assets prepared
- [ ] EAS project initialized
- [ ] Production backend deployed and tested

### iOS Deployment
- [ ] Apple Developer account enrolled
- [ ] App created in App Store Connect
- [ ] Provisioning profiles configured
- [ ] Production build created
- [ ] Build submitted to App Store Connect
- [ ] App information completed
- [ ] Screenshots uploaded
- [ ] App submitted for review
- [ ] App approved and published

### Android Deployment
- [ ] Google Play Console account created
- [ ] App created in Play Console
- [ ] Keystore generated
- [ ] Production AAB created
- [ ] Build uploaded to Play Console
- [ ] Store listing completed
- [ ] Screenshots uploaded
- [ ] Data safety form completed
- [ ] Content rating received
- [ ] App published

### Post-Deployment
- [ ] Analytics configured
- [ ] Error tracking set up
- [ ] Push notifications tested in production
- [ ] Monitor crash reports
- [ ] Respond to user reviews
- [ ] Track key metrics
- [ ] Plan first update

---

## Resources

### Official Documentation
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)

### VyBzzZ Resources
- Backend Deployment: `/DEPLOYMENT.md` (root project)
- Environment Setup: `/mobile/.env.example`
- Testing Guide: `/mobile/QUICKSTART.md`
- Assets Guide: `/mobile/assets/ASSETS_README.md`

### Support
- Email: dev@vybzzz.com
- Documentation: https://docs.vybzzz.com
- Slack: #mobile-app-dev

---

**Good luck with your launch! 🚀**
