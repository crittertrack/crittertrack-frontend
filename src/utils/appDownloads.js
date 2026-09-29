// Where the sideloadable Android APK is hosted. Single source of truth for both the
// "Download APK" button on the login screen (AuthView.jsx) and the one inside the
// "Installing the Android App" tutorial lesson — change it in one place and both update.
//
// The Play Store build (.aab) can't be sideloaded, so this must point at an .apk produced
// by `gradlew assembleRelease` (not bundleRelease). Set to null to hide every download
// button until hosting is set up.
const ANDROID_APK_URL = null;

// Play Store listing. Currently the closed-testing opt-in link, which only works for Google
// accounts already added to the tester list by hand — so it's deliberately NOT surfaced on
// the login screen (a new visitor can't get in and would just bounce). Swap to the public
// 'https://play.google.com/store/apps/details?id=com.crittertrack.app' once the app reaches
// Production, then pass this to the login screen.
export const ANDROID_PLAY_STORE_URL = 'https://play.google.com/apps/testing/com.crittertrack.app';

export default ANDROID_APK_URL;