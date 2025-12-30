import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.purchasecopilot.app',
  appName: 'Pre-Purchase Pal',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
