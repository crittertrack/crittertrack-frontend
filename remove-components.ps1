# PowerShell script to safely remove duplicate component definitions from app.jsx
# Removes: LitterManagement, AnimalForm, and AnimalList definitions

$filePath = "src/app.jsx"
$lines = @(Get-Content $filePath -Encoding UTF8)
$totalLines = $lines.Count

Write-Host "Total lines in file: $totalLines"

# Find line numbers for components
$litterLine = $null
$animalFormLine = $null
$animalListLine = $null

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Find LitterManagement
    if ($line -match "^const LitterManagement = " -and $litterLine -eq $null) {
        $litterLine = $i
        Write-Host "Found LitterManagement at line $($i+1)"
    }
    
    # Find AnimalForm
    if ($line -match "^const AnimalForm = " -and $animalFormLine -eq $null) {
        $animalFormLine = $i
        Write-Host "Found AnimalForm at line $($i+1)"
    }
    
    # Find AnimalList (exact match, not nested inside another definition)
    if ($line -match "^const AnimalList = " -and $animalListLine -eq $null) {
        $animalListLine = $i
        Write-Host "Found AnimalList at line $($i+1)"
    }
}

if ($litterLine -eq $null) {
    Write-Host "ERROR: Could not find LitterManagement component"
    exit 1
}

if ($animalFormLine -eq $null) {
    Write-Host "ERROR: Could not find AnimalForm component"
    exit 1
}

if ($animalListLine -eq $null) {
    Write-Host "ERROR: Could not find AnimalList component"
    exit 1
}

# Function to find closing brace of a component
function Find-ComponentEnd {
    param([int]$startLine, [object[]]$lines)
    
    $braceCount = 0
    $inComponent = $false
    $startFound = $false
    
    for ($i = $startLine; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        
        # Count opening/closing braces to find the component end
        $openCount = ($line | Select-String "{" -AllMatches).Matches.Count
        $closeCount = ($line | Select-String "}" -AllMatches).Matches.Count
        
        if ($i -eq $startLine) {
            # First line should have the opening function brace
            $openCount += 1  # The arrow function has {
            $startFound = $true
        }
        
        $braceCount += $openCount - $closeCount
        
        # When braceCount reaches 0, we've found the end
        if ($startFound -and $braceCount -eq 0 -and $line -match "^};$") {
            return $i
        }
    }
    
    return -1
}

# Find ending lines for each component
$litterEnd = Find-ComponentEnd $litterLine $lines
$animalFormEnd = Find-ComponentEnd $animalFormLine $lines
$animalListEnd = Find-ComponentEnd $animalListLine $lines

Write-Host "LitterManagement ends at line $($litterEnd + 1)"
Write-Host "AnimalForm ends at line $($animalFormEnd + 1)"
Write-Host "AnimalList ends at line $($animalListEnd + 1)"

# Verify we found all ends
if ($litterEnd -eq -1 -or $animalFormEnd -eq -1 -or $animalListEnd -eq -1) {
    Write-Host "ERROR: Could not find component endings"
    exit 1
}

# Also need to remove the comment line before LitterManagement
$litterStart = $litterLine - 1  # Include the "// Litter Management Component" comment
while ($litterStart -ge 0 -and $lines[$litterStart].Trim() -eq "") {
    $litterStart--
}
if ($litterStart -ge 0 -and $lines[$litterStart] -match "Litter Management Component") {
    $litterStart = $litterStart
} else {
    $litterStart = $litterLine
}

# Build the list of line ranges to remove (in reverse order to avoid index shifting)
$rangesToRemove = @(
    @($animalListLine, $animalListEnd),      # Remove AnimalList
    @($animalFormLine, $animalFormEnd),      # Remove AnimalForm
    @($litterStart, $litterEnd)              # Remove LitterManagement + comment
)

Write-Host "`nRanges to remove (in reverse order):"
foreach ($range in $rangesToRemove) {
    Write-Host "Lines $($range[0]+1) to $($range[1]+1)"
}

# Remove lines in reverse order
$newLines = $lines
foreach ($range in $rangesToRemove) {
    $start = $range[0]
    $end = $range[1]
    $count = $end - $start + 1
    
    Write-Host "Removing $count lines starting at line $($start+1)"
    $newLines = $newLines[0..($start-1)] + $newLines[($end+1)..($newLines.Count-1)]
}

# Write the modified file
Set-Content -Path $filePath -Value $newLines -Encoding UTF8

Write-Host "`nFile updated successfully!"
Write-Host "Original lines: $totalLines"
Write-Host "New lines: $($newLines.Count)"
Write-Host "Removed: $($totalLines - $newLines.Count) lines"
