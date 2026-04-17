# Phase 7 Extraction: Modals & Species (~2,500 lines)
# This script will extract 10 components into 5 modular files

Write-Host "=== PHASE 7 EXTRACTION: MODALS & SPECIES ===" -ForegroundColor Green
Write-Host ""

# Step 1: Create necessary directories
$dirs = @(
    'c:\Projects\crittertrack-frontend\src\components\Modals',
    'c:\Projects\crittertrack-frontend\src\components\Messages'
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✓ Created directory: $dir" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Read Phase 7 component line ranges from app.jsx"
Write-Host "2. Create 5 new component files with proper imports"
Write-Host "3. Add imports to app.jsx"
Write-Host "4. Remove Phase 7 components from app.jsx"
Write-Host "5. Test build"
Write-Host "6. Commit Phase 7"
Write-Host ""
Write-Host "Component files to create:" -ForegroundColor Cyan
Write-Host "- src/components/Modals/LitterConflictModals.jsx (ConflictResolutionModal + LitterSyncConflictModal)"
Write-Host "- src/components/Modals/SearchModals.jsx (ParentSearchModal + LocalAnimalSearchModal + UserSearchModal)"
Write-Host "- src/components/Modals/SpeciesModals.jsx (SpeciesPickerModal + SpeciesManager + SpeciesSelector)"
Write-Host "- src/components/Modals/CommunityGeneticsModal.jsx"
Write-Host "- src/components/Messages/MessagesView.jsx"
