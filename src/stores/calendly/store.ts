import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { CalendlyStore } from './types';
import { createInitialState, createPersistConfig } from './initialState';
import { createConnectionActions } from './actions/connectionActions';
import { createDataActions } from './actions/dataActions';
import { createMeetingActions } from './actions/meetingActions';
import { createEventTypeActions } from './actions/eventTypeActions';
import { createUIActions, createModalActions, createUtilityActions } from './actions/uiActions';

/**
 * Main Calendly store combining all modular actions and state
 * 
 * This store is designed to be:
 * - Modular: Each action group is in its own file
 * - Scalable: Easy to add new features without cluttering
 * - Readable: Clear separation of concerns
 * - Type-safe: Full TypeScript support
 * - Performant: Optimized selectors and state updates
 */
export const useCalendlyStore = create<CalendlyStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...createInitialState(),
        
        // Combine all action creators into a single actions object
        actions: {
          // Connection management
          ...createConnectionActions(set, get).actions,
          
          // Data loading
          ...createDataActions(set, get).actions,
          
          // Meeting management
          ...createMeetingActions(set, get).actions,
          
          // Event type management
          ...createEventTypeActions(set, get).actions,
          
          // UI management
          ...createUIActions(set, get).actions,
          
          // Modal management
          ...createModalActions(set, get).actions,
          
          // Utility functions
          ...createUtilityActions(set, get).actions,
        },
      })),
      createPersistConfig()
    ),
    {
      name: 'calendly-store',
    }
  )
); 