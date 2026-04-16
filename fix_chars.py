import re
import sys

with open('src/app.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all {"X"} patterns where X is any broken character with †
content = re.sub(r'\{"[^"]*"\}', '†', content)

with open('src/app.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed broken characters")
