#!/bin/bash
cd c:\Projects\crittertrack-frontend

# Get lines from main branch with Generation
git show main:src/app.jsx 2>/dev/null | sed -n '6960,6980p' > main_lines.txt
git show main:src/app.jsx 2>/dev/null | sed -n '8900,8930p' >> main_lines.txt

# Show current dev
sed -n '6960,6980p' src/app.jsx > dev_lines.txt
sed -n '8900,8930p' src/app.jsx >> dev_lines.txt

echo "=== MAIN BRANCH ===" 
cat main_lines.txt
echo ""
echo "=== CURRENT DEV ===" 
cat dev_lines.txt
