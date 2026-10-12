// Where the sideloadable Android APK is hosted for the installation tutorial.
//
// The Play Store build (.aab) can't be sideloaded, so this must point at an .apk produced
// by `gradlew assembleRelease` (not bundleRelease). Set to null to hide the APK download
// in the tutorial until hosting is set up.
const ANDROID_APK_URL = null;

export const ANDROID_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.crittertrack.app';

export default ANDROID_APK_URL;