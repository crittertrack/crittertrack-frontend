#!/usr/bin/env python3
"""Replace broken characters in app.jsx"""

with open('src/app.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Count replacements
count1 = content.count('{"?"}')
count2 = content.count(".join(' ? ')")
count3 = content.count("` ? $")

print(f"Before: {count1} {{\"?\"}}, {count2} .join(' ? '), {count3} ` ? $")

# Make replacements
content = content.replace('{"?"}', '{"†"}')
content = content.replace(".join(' ? ')", ".join(' • ')")
content = content.replace("` ? $", "` • $")

# Write back
with open('src/app.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ File updated successfully!")
