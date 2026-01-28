/**
 * Expo app configuration with environment variables
 *
 * To use environment variables:
 * 1. Create a .env file in the project root
 * 2. Add your ElevenLabs API key: EXPO_PUBLIC_ELEVENLABS_API_KEY=your_key_here
 * 3. Restart the Expo dev server
 */
export default {
  expo: {
    name: 'rise-alarm',
    slug: 'rise-alarm',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'risealarm',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      'expo-font',
      '@react-native-community/datetimepicker',
      'expo-audio',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      // Environment variables accessible via Constants.expoConfig.extra
      elevenlabsApiKey: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY,
    },
  },
};
