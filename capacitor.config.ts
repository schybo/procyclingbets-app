import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.procyclingbets.app',
  appName: 'Pro Cycling Bets',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    CapacitorCookies: {
      enabled: true
    } 
  }
};

export default config;
