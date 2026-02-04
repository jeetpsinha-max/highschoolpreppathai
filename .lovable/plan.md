
# Plan: Bulk State Import & Mass Sports Data Loading

## Summary
Based on my testing, the Niche school import and sports data loading features are working correctly. However, importing all 50 states manually and loading sports data for 467+ schools individually would be extremely time-consuming. This plan adds automation to handle bulk operations.

---

## What I Tested & Confirmed Working

| Feature | Status | Details |
|---------|--------|---------|
| Niche import (CA) | ✅ Working | 14 new schools added, 11 duplicates skipped |
| Niche import (TX) | ✅ Working | 22 new schools added, 3 duplicates skipped |
| Niche import (NY) | ✅ Working | Schools added successfully |
| Sports data loading | ✅ Working | Edge function returns 200, data saved |
| Sports Rankings page | ✅ Working | 7 schools displayed with rankings |

**Current Database Status:**
- 467 total schools
- 7 schools with sports data cached

---

## Proposed Solution

### 1. Add "Import All States" Feature
Create a bulk import button that sequentially imports schools from all 50 states with progress tracking.

**New UI Elements:**
- "Import All States" button on the Import Schools page
- Progress indicator showing current state and overall progress
- Summary of total schools added across all states

### 2. Add "Load All Sports Data" Feature
Create a bulk sports data loading feature that processes all schools without cached sports data.

**New UI Elements:**
- "Load All Sports Data" button on the Admin Status page
- Progress indicator showing schools processed
- Rate limiting to prevent API overload (processing in batches)

---

## Technical Implementation

### Part 1: Bulk State Import

**File: `src/pages/ImportSchools.tsx`**
- Add "Import All States" button
- Add state to track bulk import progress
- Sequential processing with delays between states
- Display running totals and current state being processed

### Part 2: Bulk Sports Data Edge Function

**New File: `supabase/functions/bulk-load-sports/index.ts`**
- Accept batch of school IDs
- Process each school's sports data via the existing enhance-school-grades function
- Return progress and results

### Part 3: Admin Page Enhancement

**File: `src/pages/AdminStatus.tsx`**
- Add "Load All Sports Data" button
- Show schools without sports data count
- Display bulk loading progress

---

## Estimated Processing Time

| Task | Items | Est. Time per Item | Total Time |
|------|-------|-------------------|------------|
| All 50 states | 50 states | ~15s each | ~12-15 minutes |
| All schools sports | ~460 schools | ~10s each | ~75-80 minutes |

**Note:** Processing all schools would use significant AI credits. Consider processing in smaller batches or prioritizing popular schools.

---

## Technical Details

```text
┌─────────────────────────────────────────────────────────┐
│                  Bulk Import Flow                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User clicks "Import All States"                        │
│           │                                             │
│           ▼                                             │
│  ┌─────────────────┐                                    │
│  │ For each state: │◄──────────────────────┐            │
│  │   AL, AK, ...   │                       │            │
│  └────────┬────────┘                       │            │
│           │                                │            │
│           ▼                                │            │
│  ┌─────────────────┐                       │            │
│  │ Call import-    │                       │            │
│  │ niche-schools   │                       │            │
│  └────────┬────────┘                       │            │
│           │                                │            │
│           ▼                                │            │
│  ┌─────────────────┐     More states?      │            │
│  │ Update progress │─────────Yes───────────┘            │
│  │ and totals      │                                    │
│  └────────┬────────┘                                    │
│           │ No                                          │
│           ▼                                             │
│  ┌─────────────────┐                                    │
│  │ Show final      │                                    │
│  │ summary         │                                    │
│  └─────────────────┘                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

```text
┌─────────────────────────────────────────────────────────┐
│              Bulk Sports Load Flow                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User clicks "Load All Sports Data"                     │
│           │                                             │
│           ▼                                             │
│  ┌─────────────────┐                                    │
│  │ Get schools     │                                    │
│  │ without sports  │                                    │
│  │ data            │                                    │
│  └────────┬────────┘                                    │
│           │                                             │
│           ▼                                             │
│  ┌─────────────────┐                                    │
│  │ Process batch   │◄──────────────────────┐            │
│  │ of 5 schools    │                       │            │
│  └────────┬────────┘                       │            │
│           │                                │            │
│           ▼                                │            │
│  ┌─────────────────┐     More batches?     │            │
│  │ Update progress │─────────Yes───────────┘            │
│  │ + delay 2s      │                                    │
│  └────────┬────────┘                                    │
│           │ No                                          │
│           ▼                                             │
│  ┌─────────────────┐                                    │
│  │ Refresh Sports  │                                    │
│  │ Rankings data   │                                    │
│  └─────────────────┘                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/ImportSchools.tsx` | Modify | Add bulk import all states feature |
| `supabase/functions/bulk-load-sports/index.ts` | Create | Process multiple schools' sports data |
| `src/pages/AdminStatus.tsx` | Modify | Add bulk sports loading button & progress |
| `supabase/config.toml` | Modify | Add bulk-load-sports function config |

