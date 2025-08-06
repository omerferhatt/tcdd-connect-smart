# Fixes Applied

## Issue 1: Available Seats Display
- Fixed the available seats calculation in TCDD API service
- Now prioritizes car availabilities over cabin class capacities for accurate available seat count
- Updated the available seats parsing order to get actual available seats, not total capacity

## Issue 2: Pre-loaded Destinations
- Added popular destinations list that shows when clicking on empty from/to inputs
- Added Star icon to distinguish popular destinations from search results
- Implemented proper focus/blur handling to show popular destinations when input is empty

## Issue 3: Calendar Layout Fix
- Updated calendar to show outside days (`showOutsideDays={true}`)
- Fixed date handling to prevent timezone-related date shifting
- Removed problematic timezone offset calculations that were causing wrong dates

## Additional Fixes:
- Fixed departure time sorting by using actual timestamps instead of parsed time strings
- Added departureTimestamp field to RouteSegment interface for accurate sorting
- Fixed date handling to prevent August 8th showing August 9th results
- Improved available seats display in journey cards

## Technical Changes:
1. `StationSearch.tsx`: Added popular destinations functionality
2. `DateTimePicker.tsx`: Fixed calendar layout and date handling
3. `tcdd-api.ts`: Fixed available seats calculation priority
4. `railway-data.ts`: Fixed date conversion and added timestamp sorting
5. `JourneyCard.tsx`: Already had proper available seats display

These fixes should resolve:
✅ Show actual available seats instead of total capacity
✅ Pre-loaded destinations when clicking on from/to inputs
✅ Calendar showing properly in grid layout
✅ Correct date selection and API requests
✅ Results ordered by departure time