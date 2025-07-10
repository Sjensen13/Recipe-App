# Mobile App Setup Guide

This guide will help you convert your Recipe App web application into a mobile app using React Native and Expo.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

1. **Run the setup script:**
   ```bash
   cd mobile-app
   ./setup.sh
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Test on your device:**
   - Install Expo Go from App Store/Google Play
   - Scan the QR code from the terminal

### Option 2: Manual Setup

1. **Install Expo CLI:**
   ```bash
   npm install -g @expo/cli
   ```

2. **Install dependencies:**
   ```bash
   cd mobile-app
   npm install
   npx expo install @react-native-async-storage/async-storage
   ```

3. **Configure your API:**
   - Edit `src/services/api.js`
   - Update `baseURL` to your server URL

## 📱 Features Included

### ✅ Core Features
- **Authentication**: Login/Register with JWT tokens
- **Navigation**: Bottom tabs + Stack navigation
- **Feed**: Post viewing with pull-to-refresh
- **Profile**: User profiles and following
- **Messaging**: Real-time chat functionality
- **Notifications**: Push notifications support
- **Recipe Search**: AI-powered recipe discovery
- **Image Upload**: Camera and gallery integration

### 🎨 UI/UX Features
- **Modern Design**: Material Design with React Native Paper
- **Responsive Layout**: Works on all screen sizes
- **Dark Mode**: Theme switching capability
- **Smooth Animations**: React Native Reanimated
- **Native Feel**: Platform-specific components

## 🔧 Configuration

### API Configuration

Update `src/services/api.js`:
```javascript
export const apiClient = axios.create({
  baseURL: 'http://your-server-url:5001', // Change this
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Environment Variables

Create `.env` file:
```env
API_URL=http://your-server-url:5001
EXPO_PUBLIC_API_URL=http://your-server-url:5001
EXPO_PUBLIC_APP_NAME=Recipe App
```

### App Configuration

Update `app.json`:
```json
{
  "expo": {
    "name": "Recipe App",
    "slug": "recipe-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.recipeapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.recipeapp"
    }
  }
}
```

## 📁 Project Structure

```
mobile-app/
├── App.js                 # Main app component
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── setup.sh             # Automated setup script
├── README.md            # Mobile app documentation
├── src/
│   ├── components/       # Reusable components
│   ├── context/          # React contexts
│   │   ├── AuthContext.js
│   │   ├── ThemeContext.js
│   │   └── NotificationContext.js
│   ├── screens/          # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── feed/
│   │   │   └── HomeScreen.js
│   │   ├── explore/
│   │   │   └── ExploreScreen.js
│   │   ├── profile/
│   │   │   └── ProfileScreen.js
│   │   ├── messaging/
│   │   │   └── MessagesScreen.js
│   │   ├── post/
│   │   │   ├── CreatePostScreen.js
│   │   │   └── PostDetailScreen.js
│   │   ├── recipe/
│   │   │   ├── RecipeSearchScreen.js
│   │   │   └── CreateRecipeScreen.js
│   │   └── NotificationsScreen.js
│   └── services/         # API services
│       └── api.js
├── assets/               # Images, fonts, etc.
└── docs/                 # Documentation
```

## 🛠️ Development

### Running the App

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web (for testing)
npm run web
```

### Using Expo Go

1. Install Expo Go on your device
2. Scan the QR code from the terminal
3. The app will load automatically

### Debugging

- **React Native Debugger**: Install for better debugging
- **Flipper**: Facebook's debugging platform
- **Expo DevTools**: Built-in debugging tools

## 📦 Building for Production

### Using EAS Build (Recommended)

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

### Manual Build

1. **Eject from Expo:**
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

## 🚀 Deployment

### App Store (iOS)

1. **Build with EAS:**
   ```bash
   eas build --platform ios
   ```

2. **Submit to App Store Connect:**
   ```bash
   eas submit --platform ios
   ```

3. **Configure certificates and provisioning profiles**

### Google Play Store (Android)

1. **Build with EAS:**
   ```bash
   eas build --platform android
   ```

2. **Generate signed APK/AAB:**
   ```bash
   eas build --platform android --profile production
   ```

3. **Upload to Google Play Console**

## 🔄 Backend Integration

### API Compatibility

Your existing backend should work with the mobile app. The mobile app uses the same API endpoints:

- **Authentication**: `/auth/login`, `/auth/register`
- **Posts**: `/posts`, `/posts/:id`
- **Users**: `/users/:id`, `/users/profile`
- **Recipes**: `/recipes/search`, `/recipes/:id`
- **Messages**: `/messages/conversations`, `/messages/:id`
- **Notifications**: `/notifications`

### CORS Configuration

Update your server's CORS settings to allow mobile app requests:

```javascript
// In your Express server
app.use(cors({
  origin: ['http://localhost:3000', 'exp://localhost:19000'],
  credentials: true
}));
```

### Environment Variables

Update your server to handle mobile app requests:

```javascript
// Add mobile app origins to your CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'exp://localhost:19000',
  'exp://192.168.1.100:19000' // Your local network
];
```

## 🎨 Customization

### Styling

The app uses React Native StyleSheet for styling. You can customize:

- **Colors**: Update the theme colors in `ThemeContext.js`
- **Typography**: Modify font sizes and weights
- **Layout**: Adjust spacing and component sizes

### Components

Create reusable components in `src/components/`:

```javascript
// Example: Custom Button component
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const CustomButton = ({ title, onPress, style }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## 🐛 Troubleshooting

### Common Issues

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

### Performance Optimization

1. **Image Optimization:**
   - Use appropriate image sizes
   - Implement lazy loading
   - Cache images with React Native Fast Image

2. **Bundle Size:**
   - Use tree shaking
   - Implement code splitting
   - Remove unused dependencies

3. **Memory Management:**
   - Properly dispose of event listeners
   - Use React.memo for expensive components
   - Implement proper cleanup in useEffect

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [React Query](https://tanstack.com/query/latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both iOS and Android
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 