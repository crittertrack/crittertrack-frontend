# Extract Phase 2 from app.jsx
$filePath = 'c:\Projects\crittertrack-frontend\src\app.jsx'
$lines = @(Get-Content $filePath)

Write-Host "Original file has $($lines.Count) lines"

# Find insert point for imports (after CommunityPage import)
$importIndex = 0
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -like '*import CommunityPage*') {
        $importIndex = $i + 1
        Write-Host "Found CommunityPage import at line $($i+1), will insert imports after it"
        break
    }
}

# Prepare new imports
$newImports = @(
    "import PrivateAnimalDetail from './components/AnimalDetail/PrivateAnimalDetail';",
    "import ViewOnlyPrivateAnimalDetail from './components/AnimalDetail/ViewOnlyPrivateAnimalDetail';",
    "import ViewOnlyAnimalDetail from './components/AnimalDetail/ViewOnlyAnimalDetail';",
    ""
)

# Insert imports
$lines = @($lines[0..$importIndex]) + $newImports + @($lines[($importIndex+1)..($lines.Count-1)])
Write-Host "After adding imports: $($lines.Count) lines"

# Find Phase 2 boundaries
$startIdx = -1
$endIdx = -1

for ($i = 0; $i -lt $lines.Count; $i++) {
    $trimmed = $lines[$i].Trim()
    if ($trimmed -eq "// Global search bar component with dropdown results") {
        $startIdx = $i
        Write-Host "Found Phase 2 start at line $($i+1): $trimmed"
    }
    if ($trimmed -eq "// Compact species picker modal used in Litter Management") {
        $endIdx = $i
        Write-Host "Found Phase 2 end at line $($i+1): $trimmed"
        break
    }
}

if ($startIdx -ge 0 -and $endIdx -ge 0) {
    $removeCount = $endIdx - $startIdx
    Write-Host "Removing lines $($startIdx+1)-$endIdx ($removeCount lines)"
    
    # Create replacement block
    $replacement = @(
        "// ==================== PHASE 2: EXTRACTED COMPONENTS ====================",
        "// The following components/utilities were extracted to separate files:",
        "// - PrivateAnimalDetail → src/components/AnimalDetail/PrivateAnimalDetail.jsx",
        "// - ViewOnlyPrivateAnimalDetail → src/components/AnimalDetail/ViewOnlyPrivateAnimalDetail.jsx",
        "// - ViewOnlyAnimalDetail → src/components/AnimalDetail/ViewOnlyAnimalDetail.jsx",
        "// - Utilities & Sub-components → src/components/AnimalDetail/utils.js",
        "// These are imported at the top of this file.",
        "",
        "// Compact species picker modal used in Litter Management"
    )
    
    # Replace the block
    $lines = @($lines[0..($startIdx-1)]) + $replacement + @($lines[($endIdx+1)..($lines.Count-1)])
    Write-Host "After removal: $($lines.Count) lines"
} else {
    Write-Error "Could not find Phase 2 boundaries"
    exit 1
}

# Write the new file
$lines | Set-Content $filePath
Write-Host "SUCCESS: File now has $($lines.Count) lines"
Write-Host "Imports added at line 57"
Write-Host "Phase 2 code replaced with placeholder"
