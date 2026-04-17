# Remove Phase 2 duplicate code lines 2052-9242 (7191 lines total)
# Keep lines 0-2050 (2051 lines) and lines 9242-end (remaining lines)
$filePath = 'c:\Projects\crittertrack-frontend\src\app.jsx'
$lines = @(Get-Content $filePath)
$startIndex = 2051  # Line 2052 in 1-based is index 2051 in 0-based
$endIndex = 9241    # Line 9242 in 1-based is index 9241 in 0-based
$totalLines = $lines.Count

Write-Host "Total lines: $totalLines"
Write-Host "Removing lines 2052-9242 (indices $startIndex-$endIndex)"
Write-Host "Keeping: lines 1-2051 (indices 0-2050) and lines 9243-end (indices $($endIndex + 1)-$($totalLines - 1))"

# Concatenate: lines before 2052 + lines after 9242
$result = @($lines[0..2050]) + @($lines[9242..($lines.Count - 1)])

$result | Set-Content $filePath
Write-Host "Removal complete. New line count: $($result.Count)"
