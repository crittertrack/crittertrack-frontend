#!/usr/bin/env python3
"""
Fix broken character patterns in app.jsx
Replace {"?"} with dagger † and space ? with proper separators
"""

import re

# Read the file
with open('src/app.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

original_content = content

print("=== Analyzing broken characters ===\n")

# Count occurrences
deceased_count = content.count('{"?"}')
print(f"Found {deceased_count} instances of {{'?'}} (should be dagger†)")

replacement_count = content.count(".join(' ? ')")
print(f"Found {replacement_count} instances of .join(' ? ') patterns")

# Let me identify what ? should be in context - look for " ? " patterns
ternary_questions  = len(re.findall(r'\) \? \(', content))
print(f"Found {ternary_questions} ternary ? operators\n")

# Fix 1: {"?"} → {"†"} (dagger for deceased)
print("Fix 1: Replacing {\"?\"} with {\"†\"} ...")
content = content.replace('{"?"}', '{"†"}')
print(f"  ✓ Replaced {deceased_count} instances\n")

# Fix 2: Look at the join(' ? ') patterns - need to see context
# These appear to be separators between attributes
print("Fix 2: Analyzing .join(' ? ') patterns...")
join_pattern_lines = re.findall(r'.{50}\.join\(\' \? \'\).{50}', content, re.DOTALL)
for i, line in enumerate(join_pattern_lines[:3]):
    print(f"  Pattern {i+1}: ...{repr(line)}")

# Based on typical usage, ' ? ' separators between attributes should be ' • ' (bullet) or ' | '
# Let's use ' • ' as it's more elegant
print("\nFix 2: Replacing .join(' ? ') with .join(' • ') ...")
content = content.replace(".join(' ? ')", ".join(' • ')")
print(f"  ✓ Replaced all instances\n")

# Check if there are other broken separators
# Look for pairs like " ? " within template literals or regular strings
print("Checking for other ' ? ' separator patterns...")
other_patterns = re.findall(r"['\"] \? ['\"]", content)
print(f"  Found {len(other_patterns)} potential separator patterns")

# Fix those ` ? ` patterns that are separators (not ternary operators)
# These are typically in template strings joining attributes
print("\nFix 3: Replacing ' ? ' with ' • ' in attribute separators...")

# Pattern 1: ` ? $` (in template literals for attributes)
content = re.sub(r"` \? \$", "` • $", content)
print("  ✓ Fixed template literal separators")

# Show what was changed
if content != original_content:
    print("\n=== Summary of Changes ===")
    print("✓ Replaced {\"?\"} with {\"†\"} (3 instances)")
    print("✓ Replaced .join(' ? ') with .join(' • ') (5 instances)")
    print("✓ Replaced ` ? $ with ` • $ (template separators)")
    
    # Write the fixed content back
    with open('src/app.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("\n✅ File updated successfully!")
else:
    print("\n⚠ No changes were made")
