# Remove the three duplicate component definitions from app.jsx
# These were already extracted to separate files, but imports created duplicates

$filePath = "src/app.jsx"
$content = Get-Content $filePath -Raw
$lines = @(Get-Content $filePath)

Write-Host "Original file: $($lines.Count) lines"

# Define exact line ranges to remove (0-indexed from PowerShell array perspective)
# Line 11460-15244: Litter Management comment + component (remove lines 11460-15244 inclusive)
# Line 16055-27161: AnimalForm component (remove lines 16055-27161 inclusive)
# Line 27301-31125: Cache setup + AnimalList component (remove lines 27301-31125 inclusive)

# But we need to account for line shifts as we remove sections
# Best approach: remove from bottom to top to avoid index recalculation

$removalRanges = @(
    @{ start = 27300; end = 31124; name = "Module cache + AnimalList" },  # 0-indexed: 27300-31124
    @{ start = 16054; end = 27160; name = "AnimalForm" },                  # 0-indexed: 16054-27160
    @{ start = 11459; end = 15243; name = "Comment + LitterManagement" }   # 0-indexed: 11459-15243
)

foreach ($range in $removalRanges) {
    $start = $range.start
    $end = $range.end
    $count = $end - $start + 1
    
    Write-Host "`nRemoving $($range.name) (lines $($start+1)-$($end+1), $count lines)"
    
    # Keep lines before the range
    $before = $lines[0..($start-1)]
    
    # Keep lines after the range
    if ($end + 1 -lt $lines.Count) {
        $after = $lines[($end+1)..($lines.Count-1)]
    } else {
        $after = @()
    }
    
    # Combine
    if ($before.Count -gt 0 -and $after.Count -gt 0) {
        $lines = $before + $after
    } elseif ($before.Count -gt 0) {
        $lines = $before
    } else {
        $lines = $after
    }
    
    Write-Host "  -> File now has $($lines.Count) lines"
}

# Write the modified file
Set-Content -Path $filePath -Value $lines -Encoding UTF8 -NoNewline

Write-Host "`n✓ File updated successfully!"
Write-Host "Final line count: $($lines.Count) lines"
$removed = 38978 - $lines.Count
Write-Host "Total removed: $removed lines (was 38978)"
