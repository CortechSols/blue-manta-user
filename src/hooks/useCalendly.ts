import { calendlyAuth } from "@/lib/calendly-api";
import { useCalendlyActions, useCalendlyCalendarView } from "@/stores/calendlyStore";
import { useState, useCallback } from "react";
import { navigateCalendarDate } from "@/lib/calendar-utils";

// Hook to handle OAuth connection
export function useCalendlyConnect() {
	const actions = useCalendlyActions();
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);

	const initiateOAuth = async () => {
		try {
			await calendlyAuth.initiateOAuth();
		} catch (error) {
			console.error("Failed to initiate Calendly OAuth:", error);
			setError(error instanceof Error ? error : new Error('Failed to initiate OAuth'));
		}
	};

	const connect = async (code: string) => {
		setIsPending(true);
		setError(null);
		setIsSuccess(false);
		
		try {
			await actions.connectCalendly(code);
			setIsSuccess(true);
			return true;
		} catch (err) {
			const error = err instanceof Error ? err : new Error('Failed to connect');
			setError(error);
			throw error;
		} finally {
			setIsPending(false);
		}
	};

	return {
		initiateOAuth,
		connect,
		isPending,
		error,
		isSuccess,
	};
}

export const useCalendly = () => {
  const actions = useCalendlyActions();
  const calendarView = useCalendlyCalendarView();

  const navigateCalendar = useCallback(
    (direction: "prev" | "next" | "today") => {
      const newDate = navigateCalendarDate(
        new Date(calendarView.date),
        calendarView.view,
        direction
      );

      actions.setCalendarView({ ...calendarView, date: newDate });
      actions.setSelectedDate(newDate);
      actions.loadEvents();
    },
    [calendarView, actions]
  );

  const changeCalendarView = useCallback(
    (view: "month" | "week" | "day" | "agenda") => {
      actions.setCalendarView({
        ...calendarView,
        view,
      });
    },
    [calendarView, actions]
  );

  return {
    navigateCalendar,
    changeCalendarView,
    calendarView,
  };
};
