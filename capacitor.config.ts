import type { CapacitorConfig } from '@capacitor/cli';

/**
 * The Android app loads your deployed web app in a WebView.
 * Set CAPACITOR_SERVER_URL (or NEXT_PUBLIC_APP_URL) to your deployed URL
 * before building the APK, e.g.:
 *   CAPACITOR_SERVER_URL=https://ai-teacher-app.vercel.app npm run cap:sync
 *
 * Leave unset to use the default (localhost) for local development only.
 */
const serverUrl = process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_APP_URL;

const config: CapacitorConfig = {
  appId: 'com.aiteacher.app',
  appName: 'AI Teacher',
  webDir: 'public',
  server: serverUrl
    ? {
        url: serverUrl.startsWith('http') ? serverUrl : `https://${serverUrl}`,
        cleartext: false,
      }
    : undefined,
  android: {
    allowMixedContent: true,
  },
};

export default config;
