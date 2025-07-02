# Modular Calendly Store

A fully refactored, modular, and scalable Calendly store implementation using Zustand with best practices and DRY principles.

## 🏗️ Architecture Overview

The store is organized into several focused modules:

```
src/stores/calendly/
├── index.ts                    # Main export interface
├── store.ts                    # Main store combining all modules
├── types.ts                    # All TypeScript definitions
├── utils.ts                    # Shared utility functions
├── initialState.ts             # Initial state configuration
├── selectors.ts                # Performance-optimized selector hooks
├── actions/
│   ├── connectionActions.ts    # Calendly connection management
│   ├── dataActions.ts          # Data loading and fetching
│   ├── meetingActions.ts       # Meeting operations (cancel, reschedule)
│   ├── eventTypeActions.ts     # Event type management
│   └── uiActions.ts            # UI state and modal management
└── README.md                   # This documentation
```

## 🚀 Key Features

### ✅ Modular Architecture
- **Separation of Concerns**: Each action group is in its own file
- **Single Responsibility**: Each module handles one specific domain
- **Easy to Navigate**: Clear file organization and naming

### ✅ Type Safety
- **Full TypeScript Support**: Comprehensive type definitions
- **Interface Segregation**: Specific interfaces for each action group
- **Type-Safe State Updates**: Immer integration for immutable updates

### ✅ Performance Optimizations
- **Granular Selectors**: Specific hooks prevent unnecessary re-renders
- **Optimized Subscriptions**: Components only subscribe to needed state
- **Memoized Calculations**: Efficient derived state computation

### ✅ DRY Principle Implementation
- **Shared Utilities**: Common operations extracted to utils
- **Reusable Logic**: API response handling, error management
- **Consistent Patterns**: Standardized action patterns across modules

### ✅ Developer Experience
- **Clear Documentation**: Comprehensive inline comments
- **Migration Guide**: Easy transition from old store
- **IDE Support**: Full IntelliSense and autocomplete

## 📖 Usage Guide

### Basic Usage

```typescript
import { 
  useCalendlyEvents,
  useCalendlyMeetings,
  useCalendlyConnectionActions,
  useCalendlyDataActions 
} from '../stores/calendly';

function CalendlyDashboard() {
  // Data selectors
  const events = useCalendlyEvents();
  const meetings = useCalendlyMeetings();
  
  // Action selectors
  const { connectCalendly, checkConnectionStatus } = useCalendlyConnectionActions();
  const { loadEvents, loadMeetings } = useCalendlyDataActions();
  
  // Use the data and actions...
}
```

### Advanced Usage with Combined Selectors

```typescript
import { 
  useCalendlyDashboard,
  useCalendlyStatus,
  useCalendlyUI 
} from '../stores/calendly';

function CalendlyComponent() {
  // Combined selectors for related state
  const dashboard = useCalendlyDashboard();
  const status = useCalendlyStatus();
  const ui = useCalendlyUI();
  
  if (status.isLoading) return <Loading />;
  if (status.hasError) return <Error message={status.error} />;
  if (!status.isConnected) return <ConnectPrompt />;
  
  return <DashboardView data={dashboard} ui={ui} />;
}
```

### Action-Specific Usage

```typescript
import { 
  useCalendlyMeetingActions,
  useCalendlyModalActions 
} from '../stores/calendly';

function MeetingItem({ meeting }) {
  const { cancelMeeting, rescheduleMeeting } = useCalendlyMeetingActions();
  const { openCancelMeetingModal } = useCalendlyModalActions();
  
  return (
    <div>
      <h3>{meeting.name}</h3>
      <button onClick={() => openCancelMeetingModal(meeting.uri)}>
        Cancel Meeting
      </button>
    </div>
  );
}
```

## 🔧 Available Selectors

### Data Selectors
- `useCalendlyConnection()` - Connection status
- `useCalendlyEvents()` - Calendar events
- `useCalendlyMeetings()` - Scheduled meetings
- `useCalendlyEventTypes()` - Available event types
- `useCalendlyAvailability()` - Availability schedules

### Status Selectors
- `useCalendlyLoading()` - Loading states
- `useCalendlyError()` - Error state
- `useCalendlyStatus()` - Combined status (connected, loading, error)

### UI Selectors
- `useCalendlySelectedDate()` - Currently selected date
- `useCalendlyCalendarView()` - Calendar view settings
- `useCalendlyMeetingFilters()` - Applied filters
- `useCalendlySelectedMeetings()` - Selected meetings for batch operations
- `useCalendlyModals()` - Modal states

### Action Selectors
- `useCalendlyConnectionActions()` - Connection management
- `useCalendlyDataActions()` - Data loading
- `useCalendlyMeetingActions()` - Meeting operations
- `useCalendlyEventTypeActions()` - Event type management
- `useCalendlyUIActions()` - UI state management
- `useCalendlyModalActions()` - Modal management
- `useCalendlyUtilityActions()` - Utility functions

### Combined Selectors
- `useCalendlyDashboard()` - All dashboard data
- `useCalendlyUI()` - All UI state
- `useCalendlyData()` - All Calendly data
- `useCalendlyStatus()` - Status with computed properties

## 🛠️ Utility Functions

The store includes shared utility functions for common operations:

```typescript
import { 
  extractEventsFromResponse,
  formatDateForAPI,
  createErrorMessage 
} from '../stores/calendly';

// Safe API response handling
const events = extractEventsFromResponse(apiResponse);

// Consistent date formatting
const dateString = formatDateForAPI(new Date());

// Standardized error messages
const errorMsg = createErrorMessage('load events', error);
```

## 🔄 Migration from Old Store

### Step 1: Update Imports

**Before:**
```typescript
import { useCalendlyStore, useCalendlyActions } from '../stores/calendlyStore';
```

**After:**
```typescript
import { 
  useCalendlyStore,
  useCalendlyActions,
  useCalendlyEvents,
  useCalendlyConnectionActions 
} from '../stores/calendly';
```

### Step 2: Use Specific Selectors

**Before:**
```typescript
const store = useCalendlyStore();
const events = store.events;
const loadEvents = store.actions.loadEvents;
```

**After:**
```typescript
const events = useCalendlyEvents();
const { loadEvents } = useCalendlyDataActions();
```

### Step 3: Benefits You'll Get
- **Fewer Re-renders**: Components only update when their specific data changes
- **Better Performance**: More granular subscriptions
- **Clearer Code**: Obvious what data each component uses
- **Type Safety**: Better IDE support and error catching

## 🧪 Testing

The modular architecture makes testing much easier:

```typescript
// Test individual action groups
import { createConnectionActions } from '../actions/connectionActions';

// Test utility functions
import { extractEventsFromResponse } from '../utils';

// Mock specific parts without affecting others
```

## 📈 Extending the Store

### Adding New Actions

1. Create a new action file: `src/stores/calendly/actions/newFeatureActions.ts`
2. Define the action interface in `types.ts`
3. Implement the actions using the StateCreator pattern
4. Add to main store in `store.ts`
5. Export selectors in `selectors.ts`

### Adding New State

1. Define new state in `types.ts`
2. Add to initial state in `initialState.ts`
3. Create selectors in `selectors.ts`
4. Update actions as needed

## 🎯 Best Practices

### Do ✅
- Use specific selectors instead of the main store
- Group related actions together
- Handle errors consistently using utility functions
- Keep actions focused on single responsibilities
- Use TypeScript interfaces for better type safety

### Don't ❌
- Subscribe to the entire store unnecessarily
- Mix different concerns in the same action file
- Ignore TypeScript warnings
- Duplicate logic between actions
- Access store state directly in components

## 🔍 Performance Tips

1. **Use Specific Selectors**: `useCalendlyEvents()` instead of `useCalendlyStore()`
2. **Combine Related State**: Use combined selectors like `useCalendlyDashboard()`
3. **Avoid Unnecessary Subscriptions**: Only subscribe to state you actually use
4. **Leverage Memoization**: Selectors are automatically memoized by Zustand

## 📚 Further Reading

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Immer Documentation](https://immerjs.github.io/immer/)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [React Performance Patterns](https://react.dev/learn/render-and-commit) 