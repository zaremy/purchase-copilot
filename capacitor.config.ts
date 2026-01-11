import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.purchasecopilot.app',
  appName: 'Pre-Purchase Pal',
  webDir: 'dist/public',
  ios: {
    contentInset: 'never',
    scrollEnabled: false,
  },
  plugins: {
    Keyboard: {
      resize: 'none',
      resizeOnFullScreen: false,
    },
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
