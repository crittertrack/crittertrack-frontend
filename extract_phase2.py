#!/usr/bin/env python3
import sys

# Read the original file
with open(r'c:\Projects\crittertrack-frontend\src\app.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Original file has {len(lines)} lines")

# Add the 3 imports after line 56 (index 56)
import_insert_index = 56
imports = [
    "import PrivateAnimalDetail from './components/AnimalDetail/PrivateAnimalDetail';\n",
    "import ViewOnlyPrivateAnimalDetail from './components/AnimalDetail/ViewOnlyPrivateAnimalDetail';\n",
    "import ViewOnlyAnimalDetail from './components/AnimalDetail/ViewOnlyAnimalDetail';\n",
    "\n"
]

# Find the exact index where to insert (after CommunityPage import, before API_BASE_URL comment)
for i, line in enumerate(lines):
    if 'import CommunityPage' in line:
        import_insert_index = i + 1
        print(f"Found CommunityPage import at line {i+1}, will insert after it")
        break

lines[import_insert_index:import_insert_index] = imports

print(f"After adding imports: {len(lines)} lines")

# Now find and remove Phase 2 code
# Find start: "// Global search bar component with dropdown results"
# Find end: "// Compact species picker modal used in Litter Management"
start_idx = None
end_idx = None

for i, line in enumerate(lines):
    if line.strip() == "// Global search bar component with dropdown results":
        start_idx = i
        print(f"Found Phase 2 start at line {i+1}: {line.strip()}")
    if line.strip() == "// Compact species picker modal used in Litter Management":
        end_idx = i
        print(f"Found Phase 2 end at line {i+1}: {line.strip()}")
        break

if start_idx is not None and end_idx is not None:
    remove_count = end_idx - start_idx
    print(f"Removing lines {start_idx+1}-{end_idx} ({remove_count} lines)")
    
    # Create replacement block
    replacement = [
        "// ==================== PHASE 2: EXTRACTED COMPONENTS ====================\n",
        "// The following components/utilities were extracted to separate files:\n",
        "// - PrivateAnimalDetail → src/components/AnimalDetail/PrivateAnimalDetail.jsx\n",
        "// - ViewOnlyPrivateAnimalDetail → src/components/AnimalDetail/ViewOnlyPrivateAnimalDetail.jsx\n",
        "// - ViewOnlyAnimalDetail → src/components/AnimalDetail/ViewOnlyAnimalDetail.jsx\n",
        "// - Utilities & Sub-components → src/components/AnimalDetail/utils.js\n",
        "// These are imported at the top of this file.\n",
        "\n",
        "// Compact species picker modal used in Litter Management\n"
    ]
    
    # Replace the block
    lines[start_idx:end_idx] = replacement
    print(f"After removal: {len(lines)} lines")
else:
    print("ERROR: Could not find Phase 2 boundaries")
    sys.exit(1)

# Write the new file
with open(r'c:\Projects\crittertrack-frontend\src\app.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"SUCCESS: File now has {len(lines)} lines")
print(f"Imports added at line 57")
print(f"Phase 2 code replaced with placeholder")
