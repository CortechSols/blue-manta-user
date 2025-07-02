import type { StateCreator } from 'zustand';
import type { CalendlyStore, MeetingManagementActions } from '../types';
import { calendlyService } from '../../../lib/calendly-service';
import { createErrorMessage, processBatchResults } from '../utils';

/**
 * Meeting management actions for Calendly store
 */
export const createMeetingActions: StateCreator<
  CalendlyStore,
  [],
  [],
  { actions: Pick<CalendlyStore['actions'], keyof MeetingManagementActions> }
> = (set, get) => ({
  actions: {
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
          state.error = createErrorMessage('cancel meeting', error);
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
          state.error = createErrorMessage('reschedule meeting', error);
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

        // Process and report results
        const { hasErrors, message } = processBatchResults(results);

        if (hasErrors && message) {
          set((state) => {
            state.error = message;
          });
        }
      } catch (error) {
        set((state) => {
          state.error = createErrorMessage('cancel meetings', error);
        });
        throw error;
      }
    },
  },
}); 