import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useCalendlyDashboard,
  useCalendlyActions,
} from "@/stores/calendlyStore";
import { CalendarHeader, MonthView, WeekView, DayView, AgendaView } from "@/components/calendly";
import { useCalendly } from "@/hooks/useCalendly";
import type { CalendlyMeeting } from "@/types/calendly";

export const CalendarOverviewSection: React.FC = () => {
  const { meetings } = useCalendlyDashboard();
  const actions = useCalendlyActions();
  const { navigateCalendar, changeCalendarView, calendarView } = useCalendly();

  const handleViewChange = (view: string) => {
    changeCalendarView(view.toLowerCase() as "month" | "week" | "day" | "agenda");
  };

  const handleNavigate = (direction: "prev" | "next" | "today") => {
    navigateCalendar(direction);
  };

  const handleMeetingClick = (meeting: CalendlyMeeting, e: React.MouseEvent) => {
    e.stopPropagation();
    actions.openMeetingDetailsModal(meeting);
  };

  const handleDayClick = () => {
    // TODO: Implement day selection logic
  };

  const getCurrentViewName = () => {
    return (
      calendarView.view.charAt(0).toUpperCase() + calendarView.view.slice(1)
    );
  };

  return (
    <Card className="bg-white border border-gray-100 shadow-sm h-full">
      <CardHeader>
        <CalendarHeader
          calendarView={calendarView}
          onViewChange={handleViewChange}
          onNavigate={handleNavigate}
        />
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4 md:space-y-6">
          {getCurrentViewName() === "Month" && (
            <MonthView
              meetings={meetings}
              calendarView={calendarView}
              onMeetingClick={handleMeetingClick}
              onDayClick={handleDayClick}
            />
          )}

          {getCurrentViewName() === "Week" && (
            <WeekView
              meetings={meetings}
              calendarView={calendarView}
              onMeetingClick={handleMeetingClick}
              onDayClick={handleDayClick}
            />
          )}

          {getCurrentViewName() === "Day" && (
            <DayView
              meetings={meetings}
              calendarView={calendarView}
              onMeetingClick={handleMeetingClick}
            />
          )}

          {getCurrentViewName() === "Agenda" && (
            <AgendaView
              meetings={meetings}
              calendarView={calendarView}
              onMeetingClick={handleMeetingClick}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 