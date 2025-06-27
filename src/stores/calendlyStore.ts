import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  CalendlyEvent,
  CalendlyMeeting,
  EventType,
  AvailabilitySchedule,
  ConnectionStatus,
  MeetingFilters,
  CalendarViewType,
  CalendlyState,
} from '../types/calendly';
import { calendlyService } from '../lib/calendly-service';
import { shouldUseDemoData, demoConnectionStatus, demoEvents, demoMeetings, demoEventTypes } from '../lib/demo-data';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface CalendlyStore extends CalendlyState {
  // UI State
  selectedDate: Date;
  calendarView: CalendarViewType;
  meetingFilters: MeetingFilters;
  selectedMeetings: string[];
  
  // Modals and UI
  modals: {
    cancelMeeting: {
      isOpen: boolean;
      meetingUri: string | null;
    };
    rescheduleMeeting: {
      isOpen: boolean;
      meetingUri: string | null;
    };
    meetingDetails: {
      isOpen: boolean;
      meeting: CalendlyMeeting | null;
    };
    eventTypeDetails: {
      isOpen: boolean;
      eventType: EventType | null;
    };
    availabilityEditor: {
      isOpen: boolean;
    };
    bookingForm: {
      isOpen: boolean;
      eventTypeUri: string | null;
    };
  };
  
  // Actions
  actions: {
    // Connection Management
    setConnectionStatus: (status: ConnectionStatus) => void;
    connectCalendly: (code: string) => Promise<void>;
    disconnectCalendly: () => Promise<void>;
    
    // Data Loading
    loadEvents: (startDate?: Date, endDate?: Date) => Promise<void>;
    loadMeetings: (filters?: MeetingFilters) => Promise<void>;
    loadEventTypes: () => Promise<void>;
    loadAvailability: () => Promise<void>;
    refreshAll: () => Promise<void>;
    
    // Meeting Management
    cancelMeeting: (meetingUri: string, reason: string) => Promise<void>;
    rescheduleMeeting: (meetingUri: string, newStartTime: string, newEndTime: string, reason?: string) => Promise<void>;
    batchCancelMeetings: (meetingUris: string[], reason: string) => Promise<void>;
    
    // Event Type Management
    updateEventType: (eventTypeUri: string, updates: Partial<EventType>) => Promise<void>;
    
    // UI Actions
    setSelectedDate: (date: Date) => void;
    setCalendarView: (view: CalendarViewType) => void;
    setMeetingFilters: (filters: MeetingFilters) => void;
    toggleMeetingSelection: (meetingUri: string) => void;
    selectAllMeetings: () => void;
    clearMeetingSelection: () => void;
    
    // Modal Actions
    openCancelMeetingModal: (meetingUri: string) => void;
    closeCancelMeetingModal: () => void;
    openRescheduleMeetingModal: (meetingUri: string) => void;
    closeRescheduleMeetingModal: () => void;
    openMeetingDetailsModal: (meeting: CalendlyMeeting) => void;
    closeMeetingDetailsModal: () => void;
    openEventTypeDetailsModal: (eventType: EventType) => void;
    closeEventTypeDetailsModal: () => void;
    openAvailabilityEditor: () => void;
    closeAvailabilityEditor: () => void;
    openBookingForm: (eventTypeUri: string) => void;
    closeBookingForm: () => void;
    
    // Error Handling
    setError: (error: string | null) => void;
    clearError: () => void;
    
    // Loading States
    setLoading: (key: keyof CalendlyState['loading'], value: boolean) => void;
  };
}

export const useCalendlyStore = create<CalendlyStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial State
        connectionStatus: shouldUseDemoData() ? demoConnectionStatus : null,
        events: shouldUseDemoData() ? demoEvents : [],
        meetings: shouldUseDemoData() ? demoMeetings : [],
        eventTypes: shouldUseDemoData() ? demoEventTypes : [],
        availabilitySchedules: [],
        loading: {
          events: false,
          meetings: false,
          eventTypes: false,
          availability: false,
          connection: false,
        },
        error: null,
        
        // UI State
        selectedDate: new Date(),
        calendarView: {
          view: 'month',
          date: new Date(),
        },
        meetingFilters: {
          status: 'all',
        },
        selectedMeetings: [],
        
        // Modals
        modals: {
          cancelMeeting: {
            isOpen: false,
            meetingUri: null,
          },
          rescheduleMeeting: {
            isOpen: false,
            meetingUri: null,
          },
          meetingDetails: {
            isOpen: false,
            meeting: null,
          },
          eventTypeDetails: {
            isOpen: false,
            eventType: null,
          },
          availabilityEditor: {
            isOpen: false,
          },
          bookingForm: {
            isOpen: false,
            eventTypeUri: null,
          },
        },
        
        // Actions
        actions: {
          // Connection Management
          setConnectionStatus: (status) =>
            set((state) => {
              state.connectionStatus = status;
            }),
            
          checkConnectionStatus: async () => {
            if (shouldUseDemoData()) {
              return; // Skip if using demo data
            }
            
            set((state) => {
              state.loading.connection = true;
              state.error = null;
            });
            
            try {
              const response = await calendlyService.getConnectionStatus();
              console.log('Store - Connection status response:', response);
              
              set((state) => {
                state.connectionStatus = response;
                state.loading.connection = false;
              });
              
              console.log('Store - Connection status updated in store');
              
              // If connected, load initial data
              if (response.is_connected) {
                console.log('Store - Loading initial data...');
                await get().actions.refreshAll();
              }
            } catch (error) {
              console.error('Store - Connection status check failed:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to check connection status';
                state.loading.connection = false;
              });
            }
          },
            
          connectCalendly: async (code) => {
            set((state) => {
              state.loading.connection = true;
              state.error = null;
            });
            
            try {
              // Get code_verifier from localStorage (PKCE)
              const codeVerifier = localStorage.getItem('calendly_code_verifier');
              
              const response = await calendlyService.connectCalendly(code, codeVerifier || undefined);
              
              // Clear the code verifier after use
              if (codeVerifier) {
                localStorage.removeItem('calendly_code_verifier');
              }
              
              set((state) => {
                state.connectionStatus = response;
                state.loading.connection = false;
              });
              
              // Load initial data after connection
              await get().actions.refreshAll();
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to connect Calendly';
                state.loading.connection = false;
              });
              throw error;
            }
          },
          
          disconnectCalendly: async () => {
            set((state) => {
              state.loading.connection = true;
            });
            
            try {
              await calendlyService.disconnectCalendly();
              set((state) => {
                state.connectionStatus = { is_connected: false };
                state.events = [];
                state.meetings = [];
                state.eventTypes = [];
                state.availabilitySchedules = [];
                state.loading.connection = false;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to disconnect Calendly';
                state.loading.connection = false;
              });
              throw error;
            }
          },
          
          // Data Loading
          loadEvents: async (startDate, endDate) => {
            const start = startDate || startOfMonth(get().selectedDate);
            const end = endDate || endOfMonth(get().selectedDate);
            
            set((state) => {
              state.loading.events = true;
              state.error = null;
            });
            
            try {
              const response = await calendlyService.getEvents(
                format(start, 'yyyy-MM-dd'),
                format(end, 'yyyy-MM-dd')
              );
              
              console.log('Events response:', response);
              
              set((state) => {
                // Safely handle the response
                if (response && response.events_by_date) {
                  state.events = Object.values(response.events_by_date).flat();
                } else if (response && Array.isArray(response.events)) {
                  state.events = response.events;
                } else {
                  state.events = [];
                }
                state.loading.events = false;
              });
            } catch (error) {
              console.error('Failed to load events:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to load events';
                state.loading.events = false;
                state.events = [];
              });
            }
          },
          
          loadMeetings: async (filters) => {
            set((state) => {
              state.loading.meetings = true;
              state.error = null;
            });
            
            try {
              const params = filters ? {
                status: filters.status,
                start_date: filters.dateRange?.start,
                end_date: filters.dateRange?.end,
              } : undefined;
              
              const response = await calendlyService.getMeetings(params);
              
              console.log('Meetings response:', response);
              
              set((state) => {
                // Safely handle the response
                if (response && Array.isArray(response.meetings)) {
                  state.meetings = response.meetings;
                } else if (response && Array.isArray(response)) {
                  state.meetings = response;
                } else {
                  state.meetings = [];
                }
                state.loading.meetings = false;
              });
            } catch (error) {
              console.error('Failed to load meetings:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to load meetings';
                state.loading.meetings = false;
                state.meetings = [];
              });
            }
          },
          
          loadEventTypes: async () => {
            set((state) => {
              state.loading.eventTypes = true;
              state.error = null;
            });
            
            try {
              const response = await calendlyService.getEventTypes();
              
              console.log('Event types response:', response);
              
              set((state) => {
                // Safely handle the response
                if (response && Array.isArray(response.event_types)) {
                  state.eventTypes = response.event_types;
                } else if (response && Array.isArray(response.eventTypes)) {
                  state.eventTypes = response.eventTypes;
                } else if (response && Array.isArray(response)) {
                  state.eventTypes = response;
                } else {
                  state.eventTypes = [];
                }
                state.loading.eventTypes = false;
              });
            } catch (error) {
              console.error('Failed to load event types:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to load event types';
                state.loading.eventTypes = false;
                state.eventTypes = [];
              });
            }
          },
          
          loadAvailability: async () => {
            set((state) => {
              state.loading.availability = true;
              state.error = null;
            });
            
            try {
              const response = await calendlyService.getAvailability();
              
              console.log('Availability response:', response);
              
              set((state) => {
                // Safely handle the response
                if (response && Array.isArray(response.schedules)) {
                  state.availabilitySchedules = response.schedules;
                } else if (response && Array.isArray(response)) {
                  state.availabilitySchedules = response;
                } else {
                  state.availabilitySchedules = [];
                }
                state.loading.availability = false;
              });
            } catch (error) {
              console.error('Failed to load availability:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to load availability';
                state.loading.availability = false;
                state.availabilitySchedules = [];
              });
            }
          },
          
          refreshAll: async () => {
            const actions = get().actions;
            await Promise.all([
              actions.loadEvents(),
              actions.loadMeetings(),
              actions.loadEventTypes(),
              actions.loadAvailability(),
            ]);
          },
          
          // Meeting Management
          cancelMeeting: async (meetingUri, reason) => {
            try {
              await calendlyService.cancelMeeting({
                meeting_uri: meetingUri,
                reason,
              });
              
              // Refresh meetings and events
              await get().actions.loadMeetings();
              await get().actions.loadEvents();
              
              // Close modal
              get().actions.closeCancelMeetingModal();
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to cancel meeting';
              });
              throw error;
            }
          },
          
          rescheduleMeeting: async (meetingUri, newStartTime, newEndTime, reason) => {
            try {
              await calendlyService.rescheduleMeeting(meetingUri, newStartTime, newEndTime, reason);
              
              // Refresh meetings and events
              await get().actions.loadMeetings();
              await get().actions.loadEvents();
              
              // Close modal
              get().actions.closeRescheduleMeetingModal();
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to reschedule meeting';
              });
              throw error;
            }
          },
          
          batchCancelMeetings: async (meetingUris, reason) => {
            try {
              const results = await calendlyService.batchCancelMeetings(meetingUris, reason);
              
              // Refresh meetings and events
              await get().actions.loadMeetings();
              await get().actions.loadEvents();
              
              // Clear selection
              get().actions.clearMeetingSelection();
              
              // Report results
              const successful = results.filter(r => r.success).length;
              const failed = results.filter(r => !r.success).length;
              
              if (failed > 0) {
                set((state) => {
                  state.error = `Batch cancel completed: ${successful} successful, ${failed} failed`;
                });
              }
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to cancel meetings';
              });
              throw error;
            }
          },
          
          // Event Type Management
          updateEventType: async (eventTypeUri, updates) => {
            try {
              await calendlyService.updateEventType(eventTypeUri, updates);
              await get().actions.loadEventTypes();
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to update event type';
              });
              throw error;
            }
          },
          
          // UI Actions
          setSelectedDate: (date) =>
            set((state) => {
              state.selectedDate = date;
              state.calendarView.date = date;
            }),
            
          setCalendarView: (view) =>
            set((state) => {
              state.calendarView = view;
            }),
            
          setMeetingFilters: (filters) =>
            set((state) => {
              state.meetingFilters = filters;
            }),
            
          toggleMeetingSelection: (meetingUri) =>
            set((state) => {
              const index = state.selectedMeetings.indexOf(meetingUri);
              if (index > -1) {
                state.selectedMeetings.splice(index, 1);
              } else {
                state.selectedMeetings.push(meetingUri);
              }
            }),
            
          selectAllMeetings: () =>
            set((state) => {
              state.selectedMeetings = state.meetings.map(m => m.uri);
            }),
            
          clearMeetingSelection: () =>
            set((state) => {
              state.selectedMeetings = [];
            }),
            
          // Modal Actions
          openCancelMeetingModal: (meetingUri) =>
            set((state) => {
              state.modals.cancelMeeting = {
                isOpen: true,
                meetingUri,
              };
            }),
            
          closeCancelMeetingModal: () =>
            set((state) => {
              state.modals.cancelMeeting = {
                isOpen: false,
                meetingUri: null,
              };
            }),
            
          openRescheduleMeetingModal: (meetingUri) =>
            set((state) => {
              state.modals.rescheduleMeeting = {
                isOpen: true,
                meetingUri,
              };
            }),
            
          closeRescheduleMeetingModal: () =>
            set((state) => {
              state.modals.rescheduleMeeting = {
                isOpen: false,
                meetingUri: null,
              };
            }),
            
          openMeetingDetailsModal: (meeting) =>
            set((state) => {
              state.modals.meetingDetails = {
                isOpen: true,
                meeting,
              };
            }),
            
          closeMeetingDetailsModal: () =>
            set((state) => {
              state.modals.meetingDetails = {
                isOpen: false,
                meeting: null,
              };
            }),
            
          openEventTypeDetailsModal: (eventType) =>
            set((state) => {
              state.modals.eventTypeDetails = {
                isOpen: true,
                eventType,
              };
            }),
            
          closeEventTypeDetailsModal: () =>
            set((state) => {
              state.modals.eventTypeDetails = {
                isOpen: false,
                eventType: null,
              };
            }),
            
          openAvailabilityEditor: () =>
            set((state) => {
              state.modals.availabilityEditor.isOpen = true;
            }),
            
          closeAvailabilityEditor: () =>
            set((state) => {
              state.modals.availabilityEditor.isOpen = false;
            }),
            
          openBookingForm: (eventTypeUri) =>
            set((state) => {
              state.modals.bookingForm = {
                isOpen: true,
                eventTypeUri,
              };
            }),
            
          closeBookingForm: () =>
            set((state) => {
              state.modals.bookingForm = {
                isOpen: false,
                eventTypeUri: null,
              };
            }),
            
          // Error Handling
          setError: (error) =>
            set((state) => {
              state.error = error;
            }),
            
          clearError: () =>
            set((state) => {
              state.error = null;
            }),
            
          // Loading States
          setLoading: (key, value) =>
            set((state) => {
              state.loading[key] = value;
            }),
        },
      })),
      {
        name: 'calendly-store',
        partialize: (state) => ({
          // Only persist UI state, not data
          selectedDate: state.selectedDate,
          calendarView: state.calendarView,
          meetingFilters: state.meetingFilters,
        }),
      }
    ),
    {
      name: 'calendly-store',
    }
  )
);

// Selector hooks for better performance
export const useCalendlyConnection = () => useCalendlyStore((state) => state.connectionStatus);
export const useCalendlyEvents = () => useCalendlyStore((state) => state.events);
export const useCalendlyMeetings = () => useCalendlyStore((state) => state.meetings);
export const useCalendlyEventTypes = () => useCalendlyStore((state) => state.eventTypes);
export const useCalendlyLoading = () => useCalendlyStore((state) => state.loading);
export const useCalendlyError = () => useCalendlyStore((state) => state.error);
export const useCalendlyActions = () => useCalendlyStore((state) => state.actions);
// Individual UI selectors to prevent infinite loops
export const useCalendlySelectedDate = () => useCalendlyStore((state) => state.selectedDate);
export const useCalendlyCalendarView = () => useCalendlyStore((state) => state.calendarView);
export const useCalendlyMeetingFilters = () => useCalendlyStore((state) => state.meetingFilters);
export const useCalendlySelectedMeetings = () => useCalendlyStore((state) => state.selectedMeetings);
export const useCalendlyModals = () => useCalendlyStore((state) => state.modals);

// Combined UI selector with proper memoization
export const useCalendlyUI = () => {
  const selectedDate = useCalendlyStore((state) => state.selectedDate);
  const calendarView = useCalendlyStore((state) => state.calendarView);
  const meetingFilters = useCalendlyStore((state) => state.meetingFilters);
  const selectedMeetings = useCalendlyStore((state) => state.selectedMeetings);
  const modals = useCalendlyStore((state) => state.modals);
  
  return {
    selectedDate,
    calendarView,
    meetingFilters,
    selectedMeetings,
    modals,
  };
};

// Combined selectors with proper memoization
export const useCalendlyDashboard = () => {
  const connectionStatus = useCalendlyStore((state) => state.connectionStatus);
  const events = useCalendlyStore((state) => state.events);
  const meetings = useCalendlyStore((state) => state.meetings);
  const eventTypes = useCalendlyStore((state) => state.eventTypes);
  const loading = useCalendlyStore((state) => state.loading);
  const error = useCalendlyStore((state) => state.error);
  
  return {
    connectionStatus,
    events,
    meetings,
    eventTypes,
    loading,
    error,
  };
}; 