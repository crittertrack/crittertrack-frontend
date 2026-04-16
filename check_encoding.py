#!/usr/bin/env python3
import sys

# Read the file
with open('src/app.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Check specific lines
lines_to_check = [4920, 5556, 7358, 9410]

for line_num in lines_to_check:
    if line_num < len(lines):
        line = lines[line_num]
        print(f"\nLine {line_num + 1}:")
        print(f"  Raw: {repr(line[:100])}")
        
        # Find ? characters
        for i, char in enumerate(line):
            if char == '?':
                start = max(0, i - 20)
                end = min(len(line), i + 20)
                context = line[start:end]
                print(f"  Found ? at position {i}")
                print(f"  Context: {repr(context)}")
                print(f"  Char code: {ord(char)}")
