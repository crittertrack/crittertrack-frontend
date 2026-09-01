import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.crittertrack.app',
  appName: 'CritterTrack',
  webDir: 'build',
  plugins: {
    // Prevent the WebView from rendering under the status bar (default edge-to-edge
    // behavior on newer Android versions clips/overlaps the app header otherwise).
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#9ED4E0',
      style: 'DARK',
    },
    // Resize the webview body (not the whole native window) when the keyboard opens, so
    // fixed-position footers/action bars move above the keyboard instead of being covered.
    Keyboard: {
      resize: 'body',
    },
    // Keep the native launch splash (same @drawable/splash asset) visible until the JS
    // app explicitly hides it in index.jsx, instead of the OS auto-hiding it before the
    // WebView has actually painted the app (which would otherwise show a blank flash).
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
