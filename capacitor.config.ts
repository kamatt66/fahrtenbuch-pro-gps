import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.474abdc9e562444288dfd584900179e2',
  appName: 'fahrtenbuch-pro-gps',
  webDir: 'dist',
  server: {
    url: 'https://474abdc9-e562-4442-88df-d584900179e2.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Geolocation: {
      permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION']
    }
  }
};

export default config;