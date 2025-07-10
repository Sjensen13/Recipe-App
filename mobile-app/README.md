# Recipe App Mobile

A React Native mobile application for the Recipe Social Media App.

## Features

- 📱 Cross-platform mobile app (iOS & Android)
- 🔐 User authentication
- 📝 Create and view posts
- 👥 User profiles and following
- 💬 Real-time messaging
- 🔔 Push notifications
- 📸 Image upload and camera integration
- 🍳 Recipe search and creation
- 🎨 Modern UI with React Native Paper

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Installation

1. **Install Expo CLI globally:**
   ```bash
   npm install -g @expo/cli
   ```

2. **Install dependencies:**
   ```bash
   cd mobile-app
   npm install
   ```

3. **Install additional dependencies:**
   ```bash
   npx expo install @react-native-async-storage/async-storage
   ```

## Configuration

1. **Update API URL:**
   Edit `src/services/api.js` and change the `baseURL` to your server URL:
   ```javascript
   baseURL: 'http://your-server-url:5001',
   ```

2. **Configure Expo:**
   - Update `app.json` with your Expo project details
   - Add your project ID to the `extra.eas.projectId` field

## Development

### Start the development server:
```bash
npm start
```

### Run on specific platforms:
```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

### Using Expo Go app:
1. Install Expo Go on your device
2. Scan the QR code from the terminal
3. The app will load on your device

## Building for Production

### Using EAS Build (Recommended):

1. **Install EAS CLI:**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure EAS:**
   ```bash
   eas build:configure
   ```

4. **Build for platforms:**
   ```bash
   # Android
   eas build --platform android

   # iOS
   eas build --platform ios

   # Both
   eas build --platform all
   ```

### Manual Build:

1. **Eject from Expo (if needed):**
   ```bash
   npx expo eject
   ```

2. **Build for Android:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

3. **Build for iOS:**
   ```bash
   cd ios
   pod install
   npx react-native run-ios --configuration Release
   ```

## Project Structure

```
mobile-app/
├── App.js                 # Main app component
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── src/
│   ├── components/       # Reusable components
│   ├── context/          # React contexts
│   ├── screens/          # Screen components
│   ├── services/         # API services
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, etc.
└── docs/                 # Documentation
```

## Key Features Implementation

### Authentication
- JWT token-based authentication
- Persistent login state
- Secure token storage

### Navigation
- Bottom tab navigation
- Stack navigation for screens
- Deep linking support

### State Management
- React Context for global state
- React Query for server state
- AsyncStorage for local storage

### UI Components
- React Native Paper for Material Design
- Custom styled components
- Responsive design

## Environment Variables

Create a `.env` file in the root directory:
```
API_URL=http://your-server-url:5001
EXPO_PUBLIC_API_URL=http://your-server-url:5001
```

## Troubleshooting

### Common Issues:

1. **Metro bundler issues:**
   ```bash
   npx expo start --clear
   ```

2. **iOS build issues:**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android build issues:**
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

4. **Expo Go compatibility:**
   - Ensure all dependencies are Expo-compatible
   - Use `expo install` for Expo-specific packages

## Deployment

### App Store (iOS):
1. Build with EAS: `eas build --platform ios`
2. Submit to App Store Connect
3. Configure app signing and certificates

### Google Play Store (Android):
1. Build with EAS: `eas build --platform android`
2. Generate signed APK/AAB
3. Upload to Google Play Console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 