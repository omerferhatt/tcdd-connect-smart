# TCDD Connected Travels - Planning Guide

A web application that finds multi-leg train connections for Turkish State Railways (TCDD) when direct routes are unavailable, enabling travelers to reach their destinations through strategic intermediate stops.

**Experience Qualities**: 
1. **Efficient** - Quickly surfaces viable travel options that the official TCDD site misses
2. **Reliable** - Provides accurate connection timing and feasibility information  
3. **Intuitive** - Simple search interface that anyone can use without training

**Complexity Level**: Light Application (multiple features with basic state)
- The app handles route searching, connection analysis, and journey planning with persistent user preferences, but doesn't require user accounts or complex data management.

## Essential Features

**Multi-Leg Route Search**
- Functionality: Searches for train connections through intermediate stations when direct routes aren't available
- Purpose: Solves the core problem where TCDD's official site fails to show connected journeys
- Trigger: User enters origin and destination stations
- Progression: Enter stations → Search routes → View direct + connected options → Select preferred journey → View detailed itinerary
- Success criteria: Shows at least 2-3 viable connection options when direct routes are unavailable

**Station Database & Search**
- Functionality: Comprehensive searchable database of Turkish railway stations with autocomplete
- Purpose: Ensures users can easily find and select correct station names
- Trigger: User starts typing in origin/destination fields
- Progression: Type station name → See matching suggestions → Select from dropdown → Confirm selection
- Success criteria: Finds stations within 2-3 characters typed, covers all major TCDD stations

**Journey Time Calculator**
- Functionality: Calculates total travel time including connection wait times and transfer duration
- Purpose: Helps users evaluate if multi-leg journeys are worth the time investment
- Trigger: Route search completes
- Progression: Routes found → Calculate segment times → Add connection buffers → Display total journey time
- Success criteria: Shows realistic travel times within 15-minute accuracy

**Connection Feasibility Analysis**
- Functionality: Analyzes whether connections are actually possible based on arrival/departure times
- Purpose: Prevents suggesting impossible connections that would strand travelers
- Trigger: Multi-leg route identified
- Progression: Check arrival time → Verify departure time → Calculate transfer time → Validate feasibility
- Success criteria: Only shows connections with minimum 30-45 minute transfer windows

## Edge Case Handling

- **No Connections Found**: Display alternative travel suggestions (bus, flight) and nearby station options
- **Invalid Station Names**: Show "did you mean" suggestions and popular station alternatives  
- **Server Unavailable**: Cache recent searches and show offline message with retry option
- **Same Origin/Destination**: Gentle error message suggesting nearby destinations
- **Multiple Route Options**: Prioritize by total time, then by number of connections, then by departure time

## Design Direction

The design should feel professional and efficient like a modern transit app - clean, focused, and trustworthy with subtle Turkish cultural elements. Minimal interface that prioritizes the search functionality and route results.

## Color Selection

Triadic color scheme using Turkish flag red as the primary, complemented by deep blue and warm gold accents to create a distinctly Turkish yet modern travel application feeling.

- **Primary Color**: Deep Turkish Red (oklch(0.55 0.15 25)) - Represents national identity and important actions
- **Secondary Colors**: Steel Blue (oklch(0.45 0.08 240)) for information elements, Warm Gold (oklch(0.75 0.12 85)) for highlights
- **Accent Color**: Bright Gold (oklch(0.80 0.15 85)) - Attention-grabbing highlight for search buttons and successful connections
- **Foreground/Background Pairings**: 
  - Background (White oklch(1 0 0)): Dark Gray text (oklch(0.2 0 0)) - Ratio 12.6:1 ✓
  - Card (Light Gray oklch(0.98 0 0)): Dark Gray text (oklch(0.2 0 0)) - Ratio 12.1:1 ✓  
  - Primary (Turkish Red oklch(0.55 0.15 25)): White text (oklch(1 0 0)) - Ratio 5.2:1 ✓
  - Secondary (Steel Blue oklch(0.45 0.08 240)): White text (oklch(1 0 0)) - Ratio 6.8:1 ✓
  - Accent (Bright Gold oklch(0.80 0.15 85)): Dark Gray text (oklch(0.2 0 0)) - Ratio 8.4:1 ✓

## Font Selection

Typography should convey reliability and efficiency with excellent readability for travel information - using Inter for its clarity at all sizes and international character support.

- **Typographic Hierarchy**: 
  - H1 (App Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter Semibold/24px/normal spacing  
  - H3 (Station Names): Inter Medium/18px/normal spacing
  - Body (Travel Details): Inter Regular/16px/relaxed spacing
  - Small (Times/Prices): Inter Medium/14px/normal spacing

## Animations

Subtle and functional animations that guide attention to search results and connection status - minimal motion that feels efficient rather than playful.

- **Purposeful Meaning**: Smooth transitions communicate system reliability and guide users through the search process
- **Hierarchy of Movement**: Search button gets primary animation focus, then results appearance, with subtle hover states on route cards

## Component Selection

- **Components**: 
  - Cards for route display with subtle shadows
  - Input with autocomplete dropdown for station search
  - Button (primary) for search action
  - Badge components for connection status (direct/1-stop/2-stop)
  - Separator for dividing route segments
  - Alert for error states and notifications
  
- **Customizations**: 
  - Custom route timeline component showing train connections
  - Station autocomplete with Turkish station database
  - Journey summary cards with time/price breakdown
  
- **States**: 
  - Search button: Rest/hover/loading with spinner
  - Route cards: Default/hover with subtle lift
  - Inputs: Empty/focused/filled/error states
  
- **Icon Selection**: 
  - Train icon for route segments
  - Clock for duration display  
  - MapPin for station locations
  - ArrowRight for connection flow
  
- **Spacing**: Consistent 16px base unit, 24px for section separation, 8px for inline elements

- **Mobile**: 
  - Stack station inputs vertically on mobile
  - Full-width route cards with simplified details
  - Sticky search bar for easy re-searching
  - Progressive disclosure of route details on tap