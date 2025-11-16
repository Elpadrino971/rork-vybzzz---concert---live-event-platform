# VyBzzZ Mobile App Assets

This folder contains all the image assets required for the VyBzzZ mobile application.

## Required Assets

### 1. App Icon (`icon.png`)
- **Size**: 1024x1024 px
- **Format**: PNG with transparency
- **Purpose**: Main app icon for iOS and Android
- **Design**: Should feature the VyBzzZ logo with the brand color (#FF6B35)

### 2. Splash Screen (`splash.png`)
- **Size**: 1242x2436 px (iPhone 11 Pro Max)
- **Format**: PNG
- **Background**: #FF6B35 (VyBzzZ brand color)
- **Purpose**: Loading screen shown when app starts
- **Design**: VyBzzZ logo centered on brand color background

### 3. Adaptive Icon - Android (`adaptive-icon.png`)
- **Size**: 1024x1024 px
- **Format**: PNG with transparency
- **Purpose**: Android adaptive icon foreground layer
- **Background Color**: #FF6B35 (set in app.json)
- **Design**: Logo should fit within safe zone (inner 66% of canvas)

### 4. Favicon (`favicon.png`)
- **Size**: 48x48 px
- **Format**: PNG
- **Purpose**: Web version favicon
- **Design**: Simplified VyBzzZ logo

### 5. Notification Icon (`notification-icon.png`)
- **Size**: 96x96 px
- **Format**: PNG with transparency
- **Purpose**: Icon shown in push notifications (Android)
- **Design**: Simple, monochrome icon (white or transparent)
- **Note**: Should work well at small sizes

## Design Guidelines

### Brand Colors
- **Primary**: #FF6B35 (Orange)
- **Secondary**: #2D3748 (Dark Gray)
- **Accent**: #FFFFFF (White)

### Logo Style
- Modern, clean design
- Should be recognizable at small sizes
- Use the VyBzzZ wordmark or icon variant

## How to Generate Assets

### Option 1: Using a Design Tool (Figma, Adobe Illustrator, etc.)
1. Create your logo design at the largest size (1024x1024)
2. Export at the required sizes listed above
3. Ensure PNG format with appropriate transparency

### Option 2: Using Online Generators
1. **App Icon Generator**: https://www.appicon.co/
   - Upload your 1024x1024 icon
   - Download iOS and Android assets
   - Copy `icon.png` and `adaptive-icon.png` to this folder

2. **Splash Screen Generator**: https://apetools.webprofusion.com/app/#/tools/imagegorilla
   - Create a 1242x2436 splash screen
   - Use background color: #FF6B35
   - Center your logo
   - Export as `splash.png`

### Option 3: Using Expo's Asset Generation (Recommended)
```bash
# Generate all required assets from a single 1024x1024 icon
npx expo-splash-screen --background-color #FF6B35
```

## Temporary Placeholders

Until you add your actual assets, Expo will use default placeholder images. The app will work but won't have branded icons.

### Creating Simple Placeholder Icons

You can create simple text-based placeholder icons using any image editor:

1. **icon.png** (1024x1024):
   - Orange background (#FF6B35)
   - White text "VB" or "VyBzzZ" centered
   - Save as PNG

2. **splash.png** (1242x2436):
   - Orange background (#FF6B35)
   - White "VyBzzZ" text centered
   - Save as PNG

3. **adaptive-icon.png** (1024x1024):
   - Same as icon.png but ensure logo fits in safe zone

4. **favicon.png** (48x48):
   - Scaled down version of icon.png

5. **notification-icon.png** (96x96):
   - Simple white "V" on transparent background

## Asset Checklist

Before submitting to app stores:
- [ ] icon.png (1024x1024)
- [ ] splash.png (1242x2436)
- [ ] adaptive-icon.png (1024x1024)
- [ ] favicon.png (48x48)
- [ ] notification-icon.png (96x96)
- [ ] All icons follow Apple Human Interface Guidelines
- [ ] All icons follow Android Material Design guidelines
- [ ] Splash screen loads quickly (<2 seconds)
- [ ] Icons are recognizable at all sizes (16px to 1024px)
- [ ] No text smaller than 44pt in touch targets
- [ ] Adequate contrast for accessibility

## Testing Assets

### Test on iOS Simulator
```bash
npx expo run:ios
```

### Test on Android Emulator
```bash
npx expo run:android
```

### Test Splash Screen
```bash
# Force app to reload and show splash screen
npx expo start --clear
```

## Additional Resources

- [Expo Icons Documentation](https://docs.expo.dev/develop/user-interface/app-icons/)
- [Expo Splash Screen Documentation](https://docs.expo.dev/develop/user-interface/splash-screen/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Adaptive Icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)

## Notes

- Always test assets on actual devices before submitting to stores
- Keep source files (.ai, .sketch, .fig) for future updates
- Consider creating app icon variants for different themes (dark mode, etc.)
- Notification icons on Android should be simple silhouettes (single color)
