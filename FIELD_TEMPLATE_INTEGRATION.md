# Field Template Edit Form - Integration Guide

## Phase 1-3 Implementation Complete! ✅

This guide explains how to integrate the new Field Template Edit Form into the existing animal editing workflow.

## What's Been Implemented

### Backend (crittertrack-pedigree)
- ✅ Feature flags in `/routes/fieldTemplateRoutes.js`
- ✅ Enhanced `/api/field-templates/species/:speciesId` endpoint with `uiEnabled` flag
- ✅ Safe templates enabled: Bird, Fish, Amphibian, Invertebrate (0 animals = 0 risk)
- ✅ Critical templates disabled: Small Mammal, Full Mammal, Reptile (1,053 animals protected)

### Frontend (crittertrack-frontend)
- ✅ New component: `/src/components/FieldTemplateEditForm.jsx`
- ✅ 12-tab structure implemented
- ✅ Species-specific field grouping (Variety fields, etc.)
- ✅ Automatic fallback to legacy UI if template not enabled
- ✅ Field validation and dirty state tracking

## Integration into app.jsx

### Step 1: Import the Component

```javascript
// At the top of app.jsx
import FieldTemplateEditForm from './components/FieldTemplateEditForm';
```

### Step 2: Add State to Track Template Availability

```javascript
// In your animal edit modal/section component
const [useTemplateUI, setUseTemplateUI] = useState(false);
```

### Step 3: Check Template Availability When Opening Edit Mode

```javascript
const handleEditAnimal = async (animal) => {
    try {
        // Check if field template UI is available for this species
        const templateResponse = await axios.get(
            `${API_BASE_URL}/field-templates/species/${encodeURIComponent(animal.species)}`,
            { headers: { Authorization: `Bearer ${authToken}` } }
        );
        
        // Use new UI only if enabled via feature flag
        if (templateResponse.data.uiEnabled && !templateResponse.data.fallbackToLegacy) {
            setUseTemplateUI(true);
        } else {
            setUseTemplateUI(false);
        }
        
        setEditingAnimal(animal);
        setShowEditModal(true);
    } catch (error) {
        console.error('Error checking template availability:', error);
        // Fallback to legacy UI on error
        setUseTemplateUI(false);
        setEditingAnimal(animal);
        setShowEditModal(true);
    }
};
```

### Step 4: Conditional Rendering in Edit Modal

```javascript
{showEditModal && editingAnimal && (
    <div className="edit-modal">
        <div className="modal-content">
            <h2>Edit Animal</h2>
            
            {useTemplateUI ? (
                // NEW: Field Template UI (for safe species only)
                <FieldTemplateEditForm
                    animal={editingAnimal}
                    onSave={handleSaveAnimal}
                    onCancel={handleCancelEdit}
                    API_BASE_URL={API_BASE_URL}
                    authToken={authToken}
                />
            ) : (
                // EXISTING: Legacy edit form (preserved for critical species)
                <div className="legacy-edit-form">
                    {/* Your existing edit form JSX */}
                    {/* This remains unchanged */}
                </div>
            )}
        </div>
    </div>
)}
```

### Step 5: Handle Save Function

```javascript
const handleSaveAnimal = async (updatedAnimalData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/animals/${editingAnimal.id_public}`,
            updatedAnimalData,
            { headers: { Authorization: `Bearer ${authToken}` } }
        );
        
        // Update local state
        setAnimals(animals.map(a => 
            a.id_public === response.data.id_public ? response.data : a
        ));
        
        // Close modal
        setShowEditModal(false);
        setEditingAnimal(null);
        setUseTemplateUI(false);
        
        // Show success message
        alert('Animal updated successfully!');
    } catch (error) {
        console.error('Error saving animal:', error);
        alert('Failed to save animal changes');
    }
};
```

## Testing Phase 1-3

### Safe Testing Species (Currently Enabled)
Since these have **0 animals** in the database, you can test without risk:

1. **Bird Template** - ✅ Enabled
   - Create a test bird (e.g., "Canary", "Budgie")
   - Edit using new template UI
   - Test all 12 tabs
   - Verify field saving

2. **Fish Template** - ✅ Enabled
   - Create a test fish (e.g., "Betta", "Goldfish")
   - Test UI functionality
   
3. **Amphibian Template** - ✅ Enabled
   - Create a test amphibian (e.g., "Axolotl")
   - Test UI functionality

4. **Invertebrate Template** - ✅ Enabled
   - Create a test invertebrate (e.g., "Tarantula")
   - Test UI functionality

### Protected Species (Currently Disabled)
These will automatically use the **legacy UI** until Phase 4+:

- **Fancy Mouse** (948 animals) - ❌ Disabled - Uses legacy UI
- **Fancy Rat** (95 animals) - ❌ Disabled - Uses legacy UI
- **Guinea Pig** (5 animals) - ❌ Disabled - Uses legacy UI
- **Cat** (4 animals) - ❌ Disabled - Uses legacy UI
- **Dog** (1 animal) - ❌ Disabled - Uses legacy UI
- **Corn Snake** (1 animal) - ❌ Disabled - Uses legacy UI

## Example: Complete Integration

```javascript
// In app.jsx or your main component
const AnimalManagement = () => {
    const [animals, setAnimals] = useState([]);
    const [editingAnimal, setEditingAnimal] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [useTemplateUI, setUseTemplateUI] = useState(false);
    
    const checkAndEnableTemplateUI = async (animal) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/field-templates/species/${encodeURIComponent(animal.species)}`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            return response.data.uiEnabled && !response.data.fallbackToLegacy;
        } catch (error) {
            console.error('Template check failed:', error);
            return false;  // Fallback to legacy
        }
    };
    
    const handleEditClick = async (animal) => {
        const shouldUseTemplate = await checkAndEnableTemplateUI(animal);
        setUseTemplateUI(shouldUseTemplate);
        setEditingAnimal(animal);
        setShowEditModal(true);
    };
    
    const handleSave = async (updatedData) => {
        // Save logic here
        // ...
        setShowEditModal(false);
        setUseTemplateUI(false);
    };
    
    const handleCancel = () => {
        setShowEditModal(false);
        setEditingAnimal(null);
        setUseTemplateUI(false);
    };
    
    return (
        <div>
            {/* Animal list */}
            {animals.map(animal => (
                <div key={animal.id_public}>
                    <button onClick={() => handleEditClick(animal)}>Edit</button>
                </div>
            ))}
            
            {/* Edit modal */}
            {showEditModal && editingAnimal && (
                <div className="edit-modal">
                    {useTemplateUI ? (
                        <FieldTemplateEditForm
                            animal={editingAnimal}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            API_BASE_URL={API_BASE_URL}
                            authToken={authToken}
                        />
                    ) : (
                        <LegacyEditForm
                            animal={editingAnimal}
                            onSave={handleSave}
                            onCancel={handleCancel}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
```

## Next Steps

### Phase 4: Enable for Low-Risk Species
After 30 days of successful testing with Bird/Fish/Amphibian/Invertebrate:

```javascript
// In fieldTemplateRoutes.js, update feature flags:
const FEATURE_FLAGS = {
    FIELD_TEMPLATES_UI_ENABLED: {
        // ... safe templates stay enabled ...
        'Reptile Template': true,      // Enable for 1 Corn Snake
        'Full Mammal Template': true,  // Enable for 5 cats/dogs
    }
};
```

### Phase 5-6: Small Mammal Rollout
Only after Phases 1-4 are completely successful with zero bugs:

```javascript
// Gradual enable with user-based feature flags
'Small Mammal Template': checkUserBetaFlag(userId),  // Beta users only
```

## Monitoring & Alerts

Add error tracking to detect issues immediately:

```javascript
// In FieldTemplateEditForm.jsx
useEffect(() => {
    if (error) {
        // Log to error tracking service
        console.error('[Field Template Error]', {
            species: animal.species,
            templateName: template?.name,
            error: error
        });
        
        // In production, send to error monitoring (Sentry, etc.)
    }
}, [error]);
```

## Troubleshooting

**Q: Template UI isn't showing for test bird**
A: Check the backend feature flags are set to `true` for Bird Template

**Q: Getting "fallback to legacy" message**
A: This is correct behavior for disabled templates (Fancy Mouse, etc.)

**Q: Save button stays disabled**
A: The form needs changes before enabling (dirty state check)

**Q: Fields not showing in tabs**
A: Check that fields have `enabled: true` and match the tab name

---

## Safety Reminders

- ✅ **DO** test thoroughly with Bird/Fish/Amphibian/Invertebrate
- ✅ **DO** gather user feedback for 30+ days before Phase 4
- ✅ **DO** monitor for any errors or bugs
- ❌ **DON'T** enable Small Mammal Template until Phases 3-4 perfect
- ❌ **DON'T** rush the rollout - 948 fancy mice depend on stability
- ❌ **DON'T** skip the gradual rollout process

**Remember: We can't break what we don't touch. Safe templates first! 🛡️**
