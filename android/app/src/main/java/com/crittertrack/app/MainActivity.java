package com.crittertrack.app;

import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Must be called before super.onCreate() so the androidx compat library actually
        // takes over the splash on API 23-30 (API 31+ uses the platform API directly).
        SplashScreen.installSplashScreen(this);
        // The manifest's launch theme sets android:background="@drawable/splash" as the
        // WINDOW's own background (not just the splash view) — it stays forever unless
        // swapped, so any WebView layout gap would keep showing a slice of the splash
        // image underneath. Swap to the plain no-actionbar theme now that splash is set up.
        setTheme(R.style.AppTheme_NoActionBar);
        super.onCreate(savedInstanceState);
        // The theme's windowActionBar/windowNoTitle items alone weren't suppressing it —
        // uiautomator confirmed a live android:id/action_bar_container (the raw PLATFORM
        // action bar, not AppCompat's) showing the app title text overlapping the WebView.
        // getSupportActionBar() returned null (AppCompat isn't managing it), so hide it via
        // the platform API instead, which works on whatever action bar instance exists.
        if (getActionBar() != null) {
            getActionBar().hide();
        }
        // Phones lock to portrait (the app's primary responsive breakpoint); tablets/
        // foldables (large screens) stay unlocked so the existing responsive UI can use
        // landscape/split-screen layouts normally, per Google Play's large-screen guidance.
        boolean isTablet = (getResources().getConfiguration().screenLayout
                & Configuration.SCREENLAYOUT_SIZE_MASK) >= Configuration.SCREENLAYOUT_SIZE_LARGE;
        setRequestedOrientation(isTablet
                ? ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
                : ActivityInfo.SCREEN_ORIENTATION_USER_PORTRAIT);
    }
}
