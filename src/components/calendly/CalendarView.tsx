import React from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CalendlyEvent, CalendlyMeeting } from "@/types/calendly";
import {
  useCalendlyMeetings,
  useCalendlyActions,
  useCalendlyCalendarView,
} from "@/stores/calendlyStore";

interface CalendarViewProps {
  onEventClick?: (event: CalendlyEvent | CalendlyMeeting) => void;
  onSlotClick?: (slotInfo: { start: Date; end: Date; slots: Date[] }) => void;
  className?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onEventClick,
  onSlotClick,
  className = "",
}) => {
  const meetings = useCalendlyMeetings();
  const calendarView = useCalendlyCalendarView();
  const actions = useCalendlyActions();

  const views = ["Month", "Week", "Day", "Agenda"];

  // Data loading is handled by the parent CalendarPage
  // No need to load data here as it creates infinite loops

  // Navigate to month with meetings when meetings are loaded (removed to prevent infinite rendering)

  const handleViewChange = (view: string) => {
    actions.setCalendarView({
      ...calendarView,
      view: view.toLowerCase() as "month" | "week" | "day" | "agenda",
    });
  };

  const handleNavigate = (direction: "prev" | "next" | "today") => {
    // Ensure we have a proper Date object
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

    // Load events for the new date range
    actions.loadEvents();
  };

  const getCurrentViewName = () => {
    return (
      calendarView.view.charAt(0).toUpperCase() + calendarView.view.slice(1)
    );
  };

  // Get meetings for the current date
  const getMeetingsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");

    return meetings.filter((meeting) => {
      // Check for both possible field names: start_time (snake_case) or startTime (camelCase)
      const meetingStartTime = meeting.start_time || (meeting as any).startTime;

      // Validate meeting has a start time and it's a valid date
      if (
        !meetingStartTime ||
        meetingStartTime === "null" ||
        meetingStartTime === ""
      ) {
        return false;
      }

      try {
        const meetingDate = new Date(meetingStartTime);
        // Check if the date is valid
        if (isNaN(meetingDate.getTime())) {
          return false;
        }
        const meetingDateStr = format(meetingDate, "yyyy-MM-dd");
        return meetingDateStr === dateStr && meeting.status === "active";
      } catch (error) {
        console.warn("Error processing meeting date:", meetingStartTime, error);
        return false;
      }
    });
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    // Ensure we have a proper Date object
    const currentDate = new Date(calendarView.date);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);

    // Start from the Sunday before the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Generate 42 days (6 weeks) to fill the calendar grid
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === month;
      const isToday =
        format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
      const dayMeetings = getMeetingsForDate(date);

      days.push({
        date,
        dayNumber: date.getDate(),
        isCurrentMonth,
        isToday,
        meetings: dayMeetings,
      });
    }

    return days;
  };

  const handleDayClick = (day: any) => {
    if (day.meetings.length > 0) {
      // If there are meetings, we could show a detailed view
      onSlotClick?.({
        start: day.date,
        end: new Date(day.date.getTime() + 24 * 60 * 60 * 1000),
        slots: [day.date],
      });
    }
  };

  const handleMeetingClick = (
    meeting: CalendlyMeeting,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    onEventClick?.(meeting);
    actions.openMeetingDetailsModal(meeting);
  };

  return (
    <Card className={`bg-white border border-gray-100 shadow-sm ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Calendar View
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Users:</span>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span className="font-medium">1 selected</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {views.map((view) => (
                <Button
                  key={view}
                  variant={
                    getCurrentViewName() === view ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleViewChange(view)}
                  className={`text-xs px-3 py-1 ${
                    getCurrentViewName() === view
                      ? "!bg-blue-600 !text-white hover:!bg-blue-700 !border-blue-600"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {view}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {format(new Date(calendarView.date), "MMMM yyyy")}
            </h3>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="p-2 border-gray-200 hover:bg-gray-50"
                onClick={() => handleNavigate("prev")}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-4 border-gray-200 hover:bg-gray-50"
                onClick={() => handleNavigate("today")}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="p-2 border-gray-200 hover:bg-gray-50"
                onClick={() => handleNavigate("next")}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid - Only show for Month view */}
          {getCurrentViewName() === "Month" && (
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {/* Days of week header */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {generateCalendarDays().map((day, i) => (
                <div
                  key={i}
                  className={`bg-white aspect-square p-2 text-center text-sm border-0 relative cursor-pointer ${
                    day.isCurrentMonth
                      ? "hover:bg-gray-50 text-gray-900"
                      : "text-gray-300"
                  } ${
                    day.isToday ? "bg-blue-50 text-blue-700 font-semibold" : ""
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="font-medium">
                    {day.dayNumber.toString().padStart(2, "0")}
                  </div>

                  {/* Meeting indicators */}
                  {day.meetings.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {day.meetings.slice(0, 2).map((meeting, idx) => {
                        const formatMeetingTime = () => {
                          try {
                            const meetingStartTime =
                              meeting.start_time || (meeting as any).startTime;
                            if (!meetingStartTime) return "Time TBD";
                            const meetingDate = new Date(meetingStartTime);
                            if (isNaN(meetingDate.getTime()))
                              return "Invalid time";
                            return format(meetingDate, "h:mm a");
                          } catch {
                            return "Invalid time";
                          }
                        };

                        return (
                          <div
                            key={idx}
                            className="w-full h-1 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600"
                            title={`${meeting.name} - ${formatMeetingTime()}`}
                            onClick={(e) => handleMeetingClick(meeting, e)}
                          />
                        );
                      })}
                      {day.meetings.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{day.meetings.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Week View */}
          {getCurrentViewName() === "Week" && (
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Week View
                </h3>
                <p>
                  Week view for{" "}
                  {format(new Date(calendarView.date), "MMM d, yyyy")}
                </p>
                {meetings.length > 0 && (
                  <p className="text-sm mt-2">
                    {meetings.filter((m) => m.status === "active").length}{" "}
                    active meetings this period
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Day View */}
          {getCurrentViewName() === "Day" && (
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Day View
                </h3>
                <p>
                  Day view for{" "}
                  {format(new Date(calendarView.date), "EEEE, MMM d, yyyy")}
                </p>
                {(() => {
                  const dayMeetings = getMeetingsForDate(
                    new Date(calendarView.date)
                  );
                  return dayMeetings.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Meetings today:</p>
                      {dayMeetings.map((meeting, idx) => {
                        const formatMeetingTime = () => {
                          try {
                            const meetingStartTime =
                              meeting.start_time || (meeting as any).startTime;
                            if (!meetingStartTime) return "Time TBD";
                            const meetingDate = new Date(meetingStartTime);
                            if (isNaN(meetingDate.getTime()))
                              return "Invalid time";
                            return format(meetingDate, "h:mm a");
                          } catch {
                            return "Invalid time";
                          }
                        };

                        return (
                          <div
                            key={idx}
                            className="text-sm bg-blue-50 p-2 rounded cursor-pointer hover:bg-blue-100"
                            onClick={() =>
                              handleMeetingClick(
                                meeting,
                                {} as React.MouseEvent
                              )
                            }
                          >
                            {meeting.name} - {formatMeetingTime()}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm mt-2">
                      No meetings scheduled for this day
                    </p>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Agenda View */}
          {getCurrentViewName() === "Agenda" && (
            <div className="space-y-4">
              <div className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700">
                    Upcoming Meetings
                  </h3>
                  <span className="text-sm text-gray-500">
                    {meetings.filter((m) => m.status === "active").length}{" "}
                    active meetings
                  </span>
                </div>

                {meetings.filter((m) => m.status === "active").length > 0 ? (
                  <div className="space-y-3">
                    {meetings
                      .filter((m) => {
                        const meetingStartTime =
                          m.start_time || (m as any).startTime;
                        return (
                          m.status === "active" &&
                          meetingStartTime &&
                          meetingStartTime !== "null" &&
                          meetingStartTime !== ""
                        );
                      })
                      .sort((a, b) => {
                        try {
                          const aStartTime =
                            a.start_time || (a as any).startTime;
                          const bStartTime =
                            b.start_time || (b as any).startTime;
                          const aTime = new Date(aStartTime).getTime();
                          const bTime = new Date(bStartTime).getTime();
                          // Handle invalid dates
                          if (isNaN(aTime) && isNaN(bTime)) return 0;
                          if (isNaN(aTime)) return 1;
                          if (isNaN(bTime)) return -1;
                          return aTime - bTime;
                        } catch {
                          return 0;
                        }
                      })
                      .slice(0, 10)
                      .map((meeting, idx) => {
                        const formatMeetingDateTime = () => {
                          try {
                            const meetingStartTime =
                              meeting.start_time || (meeting as any).startTime;
                            if (!meetingStartTime) return "Date/Time TBD";
                            const meetingDate = new Date(meetingStartTime);
                            if (isNaN(meetingDate.getTime()))
                              return "Invalid date/time";
                            return format(meetingDate, "MMM d, yyyy • h:mm a");
                          } catch {
                            return "Invalid date/time";
                          }
                        };

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              handleMeetingClick(
                                meeting,
                                {} as React.MouseEvent
                              )
                            }
                          >
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {meeting.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {formatMeetingDateTime()}
                              </p>
                              {meeting.invitees && meeting.invitees[0] && (
                                <p className="text-xs text-gray-500">
                                  with {meeting.invitees[0].name}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant="outline"
                              className="text-blue-600 border-blue-200"
                            >
                              {meeting.location?.type || "Meeting"}
                            </Badge>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No upcoming meetings scheduled</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-8 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Cancelled</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
