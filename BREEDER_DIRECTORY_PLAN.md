# Breeders Feature - Implementation Plan

## Overview
Create a breeders feature that allows users to find breeders of specific species, with clear distinction between active breeders and hobbyist owners.

---

## 1. User Profile Settings (Configuration)

Add a new section in user settings where users can manage their breeding status:

### "Species & Breeding Status" Section

- Display all species the user has animals for
- For each species, allow them to select:
  - ⭐ **Active Breeder** - "I actively breed this species" (Star icon)
  - 🏠 **Owner** - "I keep these as pets only" **(DEFAULT)**
  - 🌙 **Retired Breeder** - "I bred before but not currently" (Moon icon)
- Users must manually select their breeding status - no automatic suggestions
- **Note**: Include explanation that marking yourself as a breeder will make you visible in Breeders
- Species marked as "Active Breeder" or "Retired Breeder" remain visible even if animal count drops to 0 (user must manually change status to remove from directory)
- **Removal**: Users can remove a species from their breeder profile by changing the status back to "Owner" - this will remove them from the directory for that species, and if they have 0 animals of that species, it will also disappear from their settings list

---

## 2. Header Navigation Button

Add a button in the main header next to the profile button:

- **Icon**: `MoonStar` (Lucide icon)
- **Label**: "Breeders" (tooltip/title)
- **Action**: Opens the breeders page
- **Placement**: Next to profile button in header for prominent access

---

## 3. Breeders Page

### Header Section
- **Title**: "Breeders"
- **Search bar**: Search by username (personal name or breeder name)

### Filter Options
- **Species filter**: Multi-select checkboxes for each species
- **Sort options**:
  - Username (A-Z / Z-A)
  - Country (A-Z / Z-A)
  - Join Date (Newest / Oldest)

### User Cards Display

**Layout**: List layout (vertical stacking)

**Each card shows**:
- Profile picture (left side)
- Personal Name and/or Breeder Name with [CTU] badge (show both if both are public)
- Bio (indented below name)
- **Breeding Species** - show status for each:
  - ⭐ **Active** - Currently breeding (Star icon)
  - 🌙 **Retired** - No longer breeding (Moon icon)
  - (No animal counts or litter counts shown)
- "View Profile" button (vertically centered on right side of card)

### Example Card Visual:
```
┌────────────────────────────────────────────────────────┐
│ [Profile] Personal Name (Breeder Name)   [CTU]        │
│     "    " Bio text goes here, can be     [View Profile│
│     "    " multi-line and provides        Button]     │
│     "    " context about the breeder                   │
│                                                         │
│     "    " ⭐ Rats (Active)                            │
│     "    " 🌙 Mice (Retired)                           │
│     "    " ⭐ Guinea Pigs (Active)                     │
└────────────────────────────────────────────────────────┘
```

**Directory Visibility Rules**:
- Only show users who have at least one species marked as "Active Breeder" OR "Retired Breeder"
- Exclude users marked as "unknown breeder"
- No opt-out option - users control visibility by not marking themselves as breeders

---

## 4. Data Structure

### User Profile Schema Addition

Add to user profile/settings:

```javascript
breedingStatus: {
  "Rats": "breeder",      // active breeder
  "Mice": "breeder",
  "Guinea Pigs": "owner"
}
```

### Possible Values:
- `"breeder"` - Active breeder
- `"retired"` - Retired breeder
- `"owner"` - Owner only (not shown in directory) **[DEFAULT]**
- `null` or undefined - Not set (defaults to "owner")

---

## 5. Implementation Steps

### Step 1: Backend Changes
- [ ] Add `breedingStatus` field to user profile schema
- [ ] Create API endpoint: `GET /api/users/breeders`
  - Returns only users with at least one "breeder" or "retired" status
  - Excludes "unknown breeder" users
  - Includes user's country and join date for sorting
  - Filter by species (only show users breeding selected species)
  - Support sorting by: username, country, join date (newest/oldest)
- [ ] Create API endpoint: `PUT /api/users/breeding-status`
  - Update user's breeding status for species
  - Validate status values: "breeder", "retired", "owner", or null

### Step 2: Settings UI
- [ ] Add "Species & Breeding Status" section to user settings
- [ ] Display user's species with radio/dropdown for status selection
  - Options: Active Breeder, Retired Breeder, Owner
  - **Default**: Owner for all species
- [ ] Users must manually select breeder status - no automatic suggestions
- [ ] Add informational text: "Marking yourself as an Active or Retired breeder will make you visible in Breeders"
- [ ] Persist species with "breeder" or "retired" status even if animal count reaches 0
- [ ] Save breeding status changes

### Step 3: Header Navigation Button
- [ ] Add "Breeders" button to main header
- [ ] Position next to the search button
- [ ] Use `MoonStar` icon from Lucide
- [ ] Add tooltip: "Breeders"
- [ ] Link to `/breeder-directory` route

### Step 4: Breeders Page
- [ ] Create new component: `Breeders.jsx`
- [ ] Add route: `/breeders`
- [ ] Implement header with search and species filter
- [ ] Create user card component (list layout)
  - Profile picture on left
  - Personal Name and/or Breeder Name with [CTU] badge (show both if both are public)
  - Bio text (indented)
  - Species list with Active (Star ⭐) / Retired (Moon 🌙) status icons
  - View Profile button (vertically centered on right side)
- [ ] Implement list layout (vertical stacking)
- [ ] Add sorting functionality (Username, Country, Newest/Oldest Breeder)
- [ ] Species filter (multi-select checkboxes)
- [ ] Search by name functionality
- [ ] Handle loading and empty states
- [ ] No contact info displayed (users click View Profile)

### Step 5: Testing & Polish
- [ ] Test with various user scenarios
- [ ] Verify species persist even with 0 animals
- [ ] Test all sorting options (username, country, newest/oldest)
- [ ] Mobile responsiveness for list layout
- [ ] Performance optimization

---

## Open Questions - RESOLVED ✅

### 1. Species Display in Settings ✅
**Decision**: Auto-hide species from the settings if they have 0 animals, EXCEPT species marked as "Active Breeder" or "Retired Breeder" should remain visible even at 0 animals (user must manually change status to remove).

### 2. Retired Breeder Status ✅
**Decision**: YES - Include "Retired Breeder" status as a third option alongside Active Breeder and Hobbyist.

### 3. Directory User Filtering ✅
**Decision**: Show ALL users who have at least one species marked as "Active Breeder" OR "Retired Breeder", regardless of animal count.

### 4. Privacy Options ✅
**Decision**: NO opt-out setting. Users control their visibility by choosing not to mark themselves as breeders. Settings will explain that marking as breeder makes you visible in Breeders.

### 5. Contact Information ✅
**Decision**: NO contact info on directory cards. Users click "View Profile" to access profile page where they can message or view any public contact info.

---

## Technical Notes

### Frontend Files to Modify/Create
- `src/app.jsx` - Add route for breeders
- `src/components/Breeders.jsx` - New component
- User settings component - Add breeding status section

### Backend Files to Modify/Create
- User model - Add `breedingStatus` field
- Routes for breeders endpoints
- Controller for breeders logic

### Database Considerations
- Migration needed for existing users (default all species to "owner")
- Index on breeding status for efficient filtering
- Species with "breeder" or "retired" status must persist even when animal count = 0

---

## Future Enhancements (Post-MVP)

- [ ] Waitlist/interest system for specific species
- [ ] Breeder verification badges
- [ ] Direct messaging from directory
- [ ] Advanced filters (location, genetics specialization, etc.)
- [ ] Featured breeders
- [ ] Reviews/ratings system
