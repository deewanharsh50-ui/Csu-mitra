#!/usr/bin/env bash
set -e

echo "=== Building 100% Native Android APK for CSU Mitra ==="

BUILD_DIR="/tmp/csu-android-build"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/src/in/nic/sanskrit/csumitra"
mkdir -p "$BUILD_DIR/res/values"
mkdir -p "$BUILD_DIR/res/mipmap-xxxhdpi"
mkdir -p "$BUILD_DIR/res/mipmap-xxhdpi"
mkdir -p "$BUILD_DIR/res/mipmap-xhdpi"
mkdir -p "$BUILD_DIR/res/mipmap-hdpi"
mkdir -p "$BUILD_DIR/res/mipmap-mdpi"
mkdir -p "$BUILD_DIR/bin"
mkdir -p "$BUILD_DIR/gen"

# Copy icons
cp public/icon-512.png "$BUILD_DIR/res/mipmap-xxxhdpi/ic_launcher.png"
cp public/icon-192.png "$BUILD_DIR/res/mipmap-xxhdpi/ic_launcher.png"
cp public/icon-192.png "$BUILD_DIR/res/mipmap-xhdpi/ic_launcher.png"
cp public/icon-192.png "$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png"
cp public/icon-192.png "$BUILD_DIR/res/mipmap-mdpi/ic_launcher.png"

# Strings
cat << 'EOF' > "$BUILD_DIR/res/values/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">CSU Mitra</string>
</resources>
EOF

# Styles
cat << 'EOF' > "$BUILD_DIR/res/values/styles.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="@android:style/Theme.NoTitleBar">
        <item name="android:windowBackground">@android:color/black</item>
    </style>
</resources>
EOF

# AndroidManifest.xml
cat << 'EOF' > "$BUILD_DIR/AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="in.nic.sanskrit.csumitra"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:theme="@style/AppTheme"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="false">

        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# MainActivity.java
cat << 'EOF' > "$BUILD_DIR/src/in/nic/sanskrit/csumitra/MainActivity.java"
package in.nic.sanskrit.csumitra;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import java.io.ByteArrayInputStream;

public class MainActivity extends Activity {
    private WebView webView;
    private FrameLayout splashOverlay;
    private ProgressBar topProgressBar;
    private static final String APP_URL = "https://ais-pre-pckf65baxqyztdy3gsb2to-934728614081.asia-southeast1.run.app";
    private boolean splashDismissed = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(0xFF78350F);
        }

        FrameLayout root = new FrameLayout(this);
        root.setLayoutParams(new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));

        // 1. Configure WebView
        webView = new WebView(this);
        webView.setLayoutParams(new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));
        webView.setBackgroundColor(0xFFFAFAF9);

        // Cookie Manager Setup - enables cookies so redirect succeeds immediately
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(webView, true);
        }

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setAllowFileAccess(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        }

        // 2. Top Progress Bar
        topProgressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        FrameLayout.LayoutParams pbParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                dpToPx(3)
        );
        topProgressBar.setLayoutParams(pbParams);
        topProgressBar.setMax(100);
        topProgressBar.setVisibility(View.GONE);

        // 3. Native CSU Mitra Splash Overlay Screen
        splashOverlay = createSplashView();

        // 4. WebChromeClient
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    topProgressBar.setVisibility(View.VISIBLE);
                    topProgressBar.setProgress(newProgress);
                } else {
                    topProgressBar.setVisibility(View.GONE);
                }

                // Hide any AI Studio logo or cookie container in webview
                injectAntiLogoCss(view);

                if (newProgress >= 90) {
                    checkAndDismissSplash(view);
                }
            }
        });

        // 5. WebViewClient with strict blocking of AI Studio logo image
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
                if (url != null && (
                        url.contains("gstatic.com/images/branding/productlogos/ai_studio") ||
                        url.contains("logo_ai_studio") ||
                        url.contains("productlogos/ai_studio")
                )) {
                    byte[] empty = new byte[0];
                    return new WebResourceResponse("image/png", "UTF-8", new ByteArrayInputStream(empty));
                }
                return super.shouldInterceptRequest(view, url);
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                injectAntiLogoCss(view);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                injectAntiLogoCss(view);
                checkAndDismissSplash(view);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    view.loadUrl(url);
                    return true;
                }
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                } catch (Exception e) {
                }
                return true;
            }
        });

        root.addView(webView);
        root.addView(topProgressBar);
        root.addView(splashOverlay);
        setContentView(root);

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(APP_URL);
        }
    }

    private void injectAntiLogoCss(WebView view) {
        String script = "(function() {" +
                "  var css = 'img[src*=\"ai_studio\"], img[alt*=\"AI Studio\"], .logo, div.container img { display: none !important; opacity: 0 !important; visibility: hidden !important; width: 0 !important; height: 0 !important; }';" +
                "  var head = document.head || document.getElementsByTagName('head')[0];" +
                "  if (head) {" +
                "    var style = document.createElement('style');" +
                "    style.type = 'text/css';" +
                "    style.appendChild(document.createTextNode(css));" +
                "    head.appendChild(style);" +
                "  }" +
                "})();";
        view.evaluateJavascript(script, null);
    }

    private void checkAndDismissSplash(WebView view) {
        if (splashDismissed || splashOverlay == null) return;

        String title = view.getTitle();
        String currentUrl = view.getUrl();

        boolean isCookieCheck = (title != null && title.toLowerCase().contains("cookie")) ||
                                (currentUrl != null && currentUrl.toLowerCase().contains("cookie"));

        if (!isCookieCheck && title != null && !title.isEmpty() && !title.contains("302")) {
            splashDismissed = true;
            splashOverlay.animate()
                    .alpha(0.0f)
                    .setDuration(400)
                    .withEndAction(new Runnable() {
                        @Override
                        public void run() {
                            if (splashOverlay != null) {
                                splashOverlay.setVisibility(View.GONE);
                            }
                        }
                    });
        }
    }

    private FrameLayout createSplashView() {
        FrameLayout layout = new FrameLayout(this);
        layout.setLayoutParams(new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));
        layout.setBackgroundColor(0xFF78350F);

        LinearLayout centerBox = new LinearLayout(this);
        centerBox.setOrientation(LinearLayout.VERTICAL);
        centerBox.setGravity(Gravity.CENTER);
        FrameLayout.LayoutParams boxParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
        );
        boxParams.gravity = Gravity.CENTER;
        centerBox.setLayoutParams(boxParams);
        centerBox.setPadding(dpToPx(24), dpToPx(24), dpToPx(24), dpToPx(24));

        ImageView iconView = new ImageView(this);
        LinearLayout.LayoutParams iconParams = new LinearLayout.LayoutParams(dpToPx(104), dpToPx(104));
        iconParams.setMargins(0, 0, 0, dpToPx(20));
        iconView.setLayoutParams(iconParams);
        iconView.setImageResource(R.mipmap.ic_launcher);
        centerBox.addView(iconView);

        TextView tvUniversity = new TextView(this);
        tvUniversity.setText("केन्द्रीय संस्कृत विश्वविद्यालय");
        tvUniversity.setTextColor(0xFFFEF08A);
        tvUniversity.setTextSize(TypedValue.COMPLEX_UNIT_SP, 20);
        tvUniversity.setTypeface(null, Typeface.BOLD);
        tvUniversity.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams univParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        );
        univParams.setMargins(0, 0, 0, dpToPx(6));
        tvUniversity.setLayoutParams(univParams);
        centerBox.addView(tvUniversity);

        TextView tvAppTitle = new TextView(this);
        tvAppTitle.setText("CSU Mitra AI Academic Assistant");
        tvAppTitle.setTextColor(0xFFFED7AA);
        tvAppTitle.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        tvAppTitle.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams subParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        );
        subParams.setMargins(0, 0, 0, dpToPx(28));
        tvAppTitle.setLayoutParams(subParams);
        centerBox.addView(tvAppTitle);

        ProgressBar spinner = new ProgressBar(this);
        LinearLayout.LayoutParams spinParams = new LinearLayout.LayoutParams(dpToPx(36), dpToPx(36));
        spinParams.setMargins(0, 0, 0, dpToPx(14));
        spinner.setLayoutParams(spinParams);
        centerBox.addView(spinner);

        TextView tvLoading = new TextView(this);
        tvLoading.setText("कृपया प्रतीक्षन्ताम्...");
        tvLoading.setTextColor(0xB3FEF08A);
        tvLoading.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
        tvLoading.setGravity(Gravity.CENTER);
        centerBox.addView(tvLoading);

        layout.addView(centerBox);
        return layout;
    }

    private int dpToPx(int dp) {
        return (int) (dp * getResources().getDisplayMetrics().density + 0.5f);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_BACK) && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }
}
EOF

ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"
if [ ! -f "$ANDROID_JAR" ]; then
    ANDROID_JAR="/tmp/android.jar"
fi

cd "$BUILD_DIR"

echo "1. Generating R.java with AAPT..."
aapt package -f -m \
    -J gen \
    -M AndroidManifest.xml \
    -S res \
    -I "$ANDROID_JAR"

echo "2. Compiling Java sources with javac..."
javac -source 8 -target 8 \
    -bootclasspath "$ANDROID_JAR" \
    -cp "gen" \
    -d "bin" \
    gen/in/nic/sanskrit/csumitra/R.java \
    src/in/nic/sanskrit/csumitra/MainActivity.java

echo "3. Converting bytecode to classes.dex with dalvik-exchange..."
dalvik-exchange --dex --output=bin/classes.dex bin

echo "4. Packaging APK resources with AAPT..."
aapt package -f \
    -M AndroidManifest.xml \
    -S res \
    -I "$ANDROID_JAR" \
    -F bin/unaligned.apk

echo "5. Adding classes.dex to APK..."
cd bin
aapt add unaligned.apk classes.dex
cd "$BUILD_DIR"

echo "6. Aligning APK with zipalign..."
zipalign -f -p 4 bin/unaligned.apk bin/aligned.apk

echo "7. Generating Keystore & Signing APK with apksigner..."
KEYSTORE="csu-release.keystore"
keytool -genkey -v \
    -keystore "$KEYSTORE" \
    -alias csumitra \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass csu123456 \
    -keypass csu123456 \
    -dname "CN=CSU Mitra, OU=IT, O=Central Sanskrit University, L=New Delhi, ST=Delhi, C=IN"

apksigner sign \
    --ks "$KEYSTORE" \
    --ks-key-alias csumitra \
    --ks-pass pass:csu123456 \
    --key-pass pass:csu123456 \
    --out bin/csu-mitra.apk \
    bin/aligned.apk

echo "8. Verifying Signed APK..."
apksigner verify -v bin/csu-mitra.apk

cd -
echo "9. Copying final APK to public directory..."
mkdir -p public
cp "$BUILD_DIR/bin/csu-mitra.apk" public/csu-mitra.apk
ls -lh public/csu-mitra.apk

echo "=== CSU Mitra APK Successfully Built and Ready for Download! ==="
