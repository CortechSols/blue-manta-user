/**
 * Modular Calendly Store
 * 
 * This module provides a fully refactored, modular Calendly store with:
 * - Clear separation of concerns
 * - Type safety
 * - Performance optimizations
 * - DRY principle implementation
 * - Scalable architecture
 */

// Main store
export { useCalendlyStore } from './store';

// Selector hooks for better performance
export * from './selectors';

// Types for external usage
export type {
  CalendlyStore,
  CalendlyUIState,
  CalendlyModals,
  CreateEventTypeResponse,
  BatchCancelResult,
  ConnectionActions,
  DataLoadingActions,
  MeetingManagementActions,
  EventTypeManagementActions,
  UIActions,
  ModalActions,
  UtilityActions,
  CalendlyActions,
} from './types';

// Utility functions (if needed externally)
export {
  extractEventsFromResponse,
  extractMeetingsFromResponse,
  separateEventsAndMeetings,
  formatDateForAPI,
  createErrorMessage,
} from './utils';

/**
 * Migration Guide:
 * 
 * OLD USAGE:
 * ```typescript
 * import { useCalendlyStore, useCalendlyActions, useCalendlyEvents } from '../stores/calendlyStore';
 * ```
 * 
 * NEW USAGE:
 * ```typescript
 * import { 
 *   useCalendlyStore,
 *   useCalendlyActions,
 *   useCalendlyEvents,
 *   useCalendlyConnectionActions,
 *   useCalendlyDataActions,
 *   // ... other specific selectors
 * } from '../stores/calendly';
 * ```
 * 
 * BENEFITS:
 * - Better tree-shaking
 * - More granular subscriptions (less re-renders)
 * - Clearer action organization
 * - Type safety improvements
 * - Easier testing and maintenance
 */ 