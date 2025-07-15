import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6cc71ded5ae54631b4004bb41f9ebfd3',
  appName: 'asset-docs',
  webDir: 'dist',
  server: {
    url: 'https://6cc71ded-5ae5-4631-b400-4bb41f9ebfd3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false
    }
  }
};

export default config;