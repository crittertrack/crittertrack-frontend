package com.crittertrack.app;

import android.content.ContentValues;
import android.content.Context;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.webkit.MimeTypeMap;
import android.widget.Toast;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

@CapacitorPlugin(name = "MediaSave")
public class MediaSavePlugin extends Plugin {

    @PluginMethod
    public void saveToDownloads(PluginCall call) {
        String filePath = call.getString("filePath");
        String filename = call.getString("filename");
        String mimeType = call.getString("mimeType");

        if (filePath == null || filename == null) {
            call.reject("filePath and filename are required");
            return;
        }

        // Strip file:// prefix if present
        if (filePath.startsWith("file://")) {
            filePath = filePath.substring(7);
        }

        File srcFile = new File(filePath);
        if (!srcFile.exists()) {
            call.reject("Source file does not exist: " + filePath);
            return;
        }

        // Infer mimeType if missing
        if (mimeType == null || mimeType.isEmpty()) {
            String extension = MimeTypeMap.getFileExtensionFromUrl(filename);
            if (extension != null && !extension.isEmpty()) {
                mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension.toLowerCase());
            }
            if (mimeType == null || mimeType.isEmpty()) {
                mimeType = "application/octet-stream";
            }
        }

        Context context = getContext();
        boolean success = false;
        String savedPath = "";

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues values = new ContentValues();
                values.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
                values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);
                values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

                Uri collection = MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
                Uri uri = context.getContentResolver().insert(collection, values);

                if (uri != null) {
                    try (InputStream in = new FileInputStream(srcFile);
                         OutputStream out = context.getContentResolver().openOutputStream(uri)) {
                        if (out != null) {
                            byte[] buffer = new byte[8192];
                            int bytesRead;
                            while ((bytesRead = in.read(buffer)) != -1) {
                                out.write(buffer, 0, bytesRead);
                            }
                            success = true;
                            savedPath = uri.toString();
                        }
                    }
                }
            } else {
                File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                if (!downloadsDir.exists()) {
                    downloadsDir.mkdirs();
                }
                File destFile = new File(downloadsDir, filename);
                try (InputStream in = new FileInputStream(srcFile);
                     OutputStream out = new FileOutputStream(destFile)) {
                    byte[] buffer = new byte[8192];
                    int bytesRead;
                    while ((bytesRead = in.read(buffer)) != -1) {
                        out.write(buffer, 0, bytesRead);
                    }
                    success = true;
                    savedPath = destFile.getAbsolutePath();
                }
                MediaScannerConnection.scanFile(context, new String[]{destFile.getAbsolutePath()}, new String[]{mimeType}, null);
            }

            if (success) {
                final String msg = "Saved " + filename + " to Downloads";
                getActivity().runOnUiThread(() -> Toast.makeText(context, msg, Toast.LENGTH_LONG).show());

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("savedPath", savedPath);
                call.resolve(ret);
            } else {
                call.reject("Failed to write file to Downloads");
            }
        } catch (Exception e) {
            call.reject("Error saving to Downloads: " + e.getMessage(), e);
        }
    }
}
