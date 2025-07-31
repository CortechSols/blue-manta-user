import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useCalendlyDashboard,
  useCalendlyActions,
  useCalendlyCalendarView,
} from "@/stores/calendlyStore";
import { CalendarHeader, MonthView, WeekView, DayView, AgendaView } from "@/components/calendly";
import type { CalendlyMeeting, CalendarDay } from "@/types/calendly";

export const CalendarOverviewSection: React.FC = () => {
  const { meetings } = useCalendlyDashboard();
  const calendarView = useCalendlyCalendarView();
  const actions = useCalendlyActions();

  const handleViewChange = (view: string) => {
    actions.setCalendarView({
      ...calendarView,
      view: view.toLowerCase() as "month" | "week" | "day" | "agenda",
    });
  };

  const handleNavigate = (direction: "prev" | "next" | "today") => {
    const currentDate = new Date(calendarView.date);
    let newDate: Date;

    switch (direction) {
      case "prev":
        newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case "next":
        newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case "today":
        newDate = new Date();
        break;
      default:
        newDate = currentDate;
    }

    actions.setCalendarView({ ...calendarView, date: newDate });
    actions.setSelectedDate(newDate);
    actions.loadEvents();
  };

  const handleMeetingClick = (meeting: CalendlyMeeting, e: React.MouseEvent) => {
    e.stopPropagation();
    actions.openMeetingDetailsModal(meeting);
  };

  const handleDayClick = (day: CalendarDay) => {
    // TODO: Implement day selection logic
    console.log("Day clicked:", day);
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