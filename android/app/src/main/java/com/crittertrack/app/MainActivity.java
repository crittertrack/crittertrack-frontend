package com.crittertrack.app;

import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import androidx.core.graphics.Insets;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
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
        Window window = getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);
        window.setBackgroundDrawableResource(R.color.pageBg);
        window.setNavigationBarColor(Color.TRANSPARENT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.setStatusBarContrastEnforced(false);
            window.setNavigationBarContrastEnforced(false);
        }
        super.onCreate(savedInstanceState);
        // Match the WebView background to the app's pink page background so any
        // transient gap (top inset letterbox, keyboard resize) blends invisibly
        // instead of flashing white or the old splash drawable.
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().setBackgroundColor(Color.parseColor("#F1D1DC"));
            }
        } catch (Exception ignored) { }
        WindowInsetsControllerCompat insetsController =
                WindowCompat.getInsetsController(window, window.getDecorView());
        insetsController.setAppearanceLightStatusBars(true);
        insetsController.setAppearanceLightNavigationBars(true);

        View content = findViewById(android.R.id.content);
        content.setBackgroundColor(Color.parseColor("#F1D1DC"));
        ViewCompat.setOnApplyWindowInsetsListener(content, (view, windowInsets) -> {
            Insets safeInsets = windowInsets.getInsets(
                    WindowInsetsCompat.Type.systemBars()
                            | WindowInsetsCompat.Type.displayCutout());
            view.setPadding(safeInsets.left, safeInsets.top,
                    safeInsets.right, safeInsets.bottom);
            return windowInsets;
        });
        ViewCompat.requestApplyInsets(content);

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
