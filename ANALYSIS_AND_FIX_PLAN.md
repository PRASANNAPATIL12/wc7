# Analysis and Fix Plan for Input Focus Loss Issue

## Problem Statement
Input fields in the following sections lose focus after typing one character:
- Our Story section
- Wedding Schedule section
- Gallery section
- Wedding Party section

The FAQ and HOME sections work correctly.

## Root Cause Analysis

### Working Pattern (HOME Section)
The HOME section uses this pattern in FormPopup component:
1. **State**: `formData` object managed by `setFormData`
2. **Handler**: Generic `handleChange` function that updates formData
3. **Memoized Handlers**: Individual handlers like `handleCoupleName1Change` wrapped with `useCallback`
4. **Input Value**: `formData.field_name !== undefined ? formData.field_name : (localWeddingData.field_name || '')`
5. **No Manager Component**: Fields are directly in FormPopup, not in a separate Manager component

### Current Pattern (Manager Components - OurStoryManager, ScheduleManager, etc.)
1. **Separate Component**: Each section has its own Manager component
2. **Own State**: Manager components have their own local state
3. **Problem**: Despite using separate state variables and useCallback, there's still a re-render issue causing focus loss

### Verified Issue
Testing confirmed that in "Our Story" section:
- Typing "Test" only resulted in "T" appearing
- Focus is lost after first character
- Subsequent keystrokes don't register

## Solution Plan

### Option 1: Convert Manager Components to Direct Input Fields (Like HOME)
Follow the exact HOME section pattern:
- Remove OurStoryManager, ScheduleManager, GalleryManager, WeddingPartyManager components
- Add direct input fields in FormPopup for each section
- Use formData state with individual memoized handlers
- This guarantees the same behavior as the working HOME section

### Option 2: Fix Manager Components (More Complex)
- Identify why Manager components re-render despite optimization
- May require deeper React optimization (React.memo, useMemo, etc.)
- Risk: Might not fully resolve the issue

## Recommended Approach: Option 1

Implement the HOME section pattern for all problematic sections:

1. **Our Story**: Add form fields directly in FormPopup case 'story'
2. **Schedule**: Add form fields directly in FormPopup case 'schedule'
3. **Gallery**: Add form fields directly in FormPopup case 'gallery'
4. **Wedding Party**: Add form fields directly in FormPopup case 'wedding_party'

## Implementation Steps

### Step 1: Update Our Story Section
- Remove OurStoryManager component call
- Add direct input fields like HOME section
- Use formData state for: year, title, description, image
- Add memoized handlers
- Handle array management (add/edit/delete stages)

### Step 2: Update Schedule Section
- Remove ScheduleManager component call
- Add direct input fields
- Use formData for: time, title, description, location, duration, highlight
- Manage schedule_events array

### Step 3: Update Gallery Section
- Remove GalleryManager component call
- Add direct input fields
- Use formData for: url, title, description, category
- Manage gallery_photos array

### Step 4: Update Wedding Party Section
- Remove WeddingPartyManager component call
- Add direct input fields for both bridal and groom parties
- Use formData for: name, designation, description, photo
- Manage separate arrays for bridal_party and groom_party

### Step 5: Testing
- Test each section individually
- Verify no focus loss when typing
- Verify data saves correctly to MongoDB
- Verify data displays correctly on wedding card

## Expected Outcome
All form sections will behave exactly like the HOME section:
- ✅ No focus loss when typing
- ✅ Smooth input experience
- ✅ Data saves correctly
- ✅ Same UI/UX as current design
