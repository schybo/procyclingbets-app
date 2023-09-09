import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.procyclingbets.app',
  appName: 'Pro Cycling Bets',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    CapacitorCookies: {
      enabled: true
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      clientId: '105848017008-d024o69dleuo1jkir4v67v2p009dicmp.apps.googleusercontent.com',
      androidClientId: '105848017008-81jl6dttjr5upr00v9ra18qklti3lbtm.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  }
};

export default config;
