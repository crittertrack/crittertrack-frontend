@echo off
cd /d c:\Projects\crittertrack-frontend
git add src/app.jsx
git commit -m "Fix broken character separators: replace ? with † (dagger) and • (bullet)"
git push origin dev
pause
