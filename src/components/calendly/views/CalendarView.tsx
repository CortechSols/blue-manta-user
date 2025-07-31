import React from "react";
import { format } from "date-fns";
import { Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
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
              {/* Week Header */}
              <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
                  Time
                </div>
                {(() => {
                  const startOfWeek = new Date(calendarView.date);
                  const day = startOfWeek.getDay();
                  startOfWeek.setDate(startOfWeek.getDate() - day);

                  return Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + i);
                    const isToday =
                      format(date, "yyyy-MM-dd") ===
                      format(new Date(), "yyyy-MM-dd");

                    return (
                      <div
                        key={i}
                        className={`bg-gray-50 p-2 text-center text-sm font-medium ${
                          isToday ? "bg-blue-50 text-blue-700" : "text-gray-700"
                        }`}
                      >
                        <div>{format(date, "EEE")}</div>
                        <div
                          className={`text-xs ${isToday ? "font-bold" : ""}`}
                        >
                          {format(date, "d")}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                {Array.from({ length: 12 }, (_, hourIndex) => {
                  const hour = hourIndex + 8; // Start from 8 AM

                  return (
                    <React.Fragment key={hour}>
                      {/* Time column */}
                      <div className="bg-white p-2 text-xs text-gray-600 text-center border-r">
                        {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
                      </div>

                      {/* Day columns */}
                      {Array.from({ length: 7 }, (_, dayIndex) => {
                        const startOfWeek = new Date(calendarView.date);
                        const day = startOfWeek.getDay();
                        startOfWeek.setDate(startOfWeek.getDate() - day);

                        const currentDate = new Date(startOfWeek);
                        currentDate.setDate(startOfWeek.getDate() + dayIndex);
                        currentDate.setHours(hour, 0, 0, 0);

                        const dayMeetings = getMeetingsForDate(
                          currentDate
                        ).filter((meeting) => {
                          try {
                            const meetingStartTime =
                              meeting.start_time || (meeting as any).startTime; // eslint-disable-line @typescript-eslint/no-explicit-any
                            if (!meetingStartTime) return false;
                            const meetingDate = new Date(meetingStartTime);
                            return meetingDate.getHours() === hour;
                          } catch {
                            return false;
                          }
                        });

                        return (
                          <div
                            key={dayIndex}
                            className="bg-white p-1 min-h-[40px] relative hover:bg-gray-50 cursor-pointer"
                            onClick={() =>
                              handleDayClick({
                                date: currentDate,
                                meetings: dayMeetings,
                              })
                            }
                          >
                            {dayMeetings.map((meeting, idx) => (
                              <div
                                key={idx}
                                className="bg-blue-500 text-white text-xs p-1 rounded mb-1 cursor-pointer hover:bg-blue-600"
                                title={meeting.name}
                                onClick={(e) => handleMeetingClick(meeting, e)}
                              >
                                <div className="truncate">{meeting.name}</div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Day View */}
          {getCurrentViewName() === "Day" && (
            <div className="space-y-4">
              {/* Day Header */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {format(new Date(calendarView.date), "EEEE, MMMM d, yyyy")}
                </h3>
                <p className="text-sm text-gray-600">
                  {(() => {
                    const dayMeetings = getMeetingsForDate(
                      new Date(calendarView.date)
                    );
                    return dayMeetings.length === 0
                      ? "No meetings scheduled"
                      : `${dayMeetings.length} meeting${
                          dayMeetings.length === 1 ? "" : "s"
                        } scheduled`;
                  })()}
                </p>
              </div>

              {/* Day Schedule */}
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 divide-y">
                  {Array.from({ length: 12 }, (_, hourIndex) => {
                    const hour = hourIndex + 8; // Start from 8 AM
                    const currentHour = new Date(calendarView.date);
                    currentHour.setHours(hour, 0, 0, 0);

                    const hourMeetings = getMeetingsForDate(
                      new Date(calendarView.date)
                    ).filter((meeting) => {
                      try {
                        const meetingStartTime =
                          meeting.start_time || (meeting as any).startTime; // eslint-disable-line @typescript-eslint/no-explicit-any
                        if (!meetingStartTime) return false;
                        const meetingDate = new Date(meetingStartTime);
                        return meetingDate.getHours() === hour;
                      } catch {
                        return false;
                      }
                    });

                    const isCurrentHour =
                      new Date().getHours() === hour &&
                      format(new Date(), "yyyy-MM-dd") ===
                        format(new Date(calendarView.date), "yyyy-MM-dd");

                    return (
                      <div
                        key={hour}
                        className={`p-4 hover:bg-gray-50 ${
                          isCurrentHour ? "bg-blue-50" : "bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-sm font-medium text-gray-600 w-20">
                            {format(
                              new Date().setHours(hour, 0, 0, 0),
                              "h:mm a"
                            )}
                          </div>
                          <div className="flex-1">
                            {hourMeetings.length > 0 ? (
                              <div className="space-y-2">
                                {hourMeetings.map((meeting, idx) => {
                                  const formatMeetingTimeRange = () => {
                                    try {
                                      const startTime =
                                        meeting.start_time ||
                                        (meeting as any).startTime; // eslint-disable-line @typescript-eslint/no-explicit-any
                                      const endTime =
                                        meeting.end_time ||
                                        (meeting as any).endTime; // eslint-disable-line @typescript-eslint/no-explicit-any
                                      if (!startTime || !endTime)
                                        return "Time TBD";
                                      const start = new Date(startTime);
                                      const end = new Date(endTime);
                                      if (
                                        isNaN(start.getTime()) ||
                                        isNaN(end.getTime())
                                      )
                                        return "Invalid time";
                                      return `${format(
                                        start,
                                        "h:mm a"
                                      )} - ${format(end, "h:mm a")}`;
                                    } catch {
                                      return "Invalid time";
                                    }
                                  };

                                  return (
                                    <div
                                      key={idx}
                                      className="bg-blue-500 text-white p-3 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
                                      onClick={(e) =>
                                        handleMeetingClick(meeting, e)
                                      }
                                    >
                                      <div className="font-medium">
                                        {meeting.name}
                                      </div>
                                      <div className="text-sm text-blue-100">
                                        {formatMeetingTimeRange()}
                                      </div>
                                      {meeting.invitees &&
                                        meeting.invitees[0] && (
                                          <div className="text-xs text-blue-200 mt-1">
                                            with {meeting.invitees[0].name}
                                          </div>
                                        )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm italic">
                                No meetings
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Agenda View */}
          {getCurrentViewName() === "Agenda" && (
            <div className="space-y-4">
              <div className="py-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Upcoming Meetings
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {meetings.filter((m) => m.status === "active").length}{" "}
                      active meetings
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => actions.loadEvents()}
                      className="text-xs"
                    >
                      Refresh
                    </Button>
                  </div>
                </div>

                {meetings.filter((m) => m.status === "active").length > 0 ? (
                  <div className="space-y-4">
                    {/* Group meetings by date */}
                    {(() => {
                      const groupedMeetings = meetings
                        .filter((m) => {
                          const meetingStartTime =
                            m.start_time || (m as any).startTime; // eslint-disable-line @typescript-eslint/no-explicit-any
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
                              a.start_time || (a as any).startTime; // eslint-disable-line @typescript-eslint/no-explicit-any
                            const bStartTime =
                              b.start_time || (b as any).startTime; // eslint-disable-line @typescript-eslint/no-explicit-any
                            const aTime = new Date(aStartTime).getTime();
                            const bTime = new Date(bStartTime).getTime();
                            if (isNaN(aTime) && isNaN(bTime)) return 0;
                            if (isNaN(aTime)) return 1;
                            if (isNaN(bTime)) return -1;
                            return aTime - bTime;
                          } catch {
                            return 0;
                          }
                        })
                        .reduce(
                          (
                            groups: Record<string, typeof meetings>,
                            meeting
                          ) => {
                            try {
                              const meetingStartTime =
                                meeting.start_time ||
                                (meeting as any).startTime; // eslint-disable-line @typescript-eslint/no-explicit-any
                              const meetingDate = new Date(meetingStartTime);
                              if (!isNaN(meetingDate.getTime())) {
                                const dateKey = format(
                                  meetingDate,
                                  "yyyy-MM-dd"
                                );
                                if (!groups[dateKey]) groups[dateKey] = [];
                                groups[dateKey].push(meeting);
                              }
                            } catch {
                              // Skip invalid dates
                            }
                            return groups;
                          },
                          {}
                        );

                      return Object.entries(groupedMeetings).map(
                        ([dateKey, dayMeetings]) => {
                          const date = new Date(dateKey);
                          const isToday =
                            format(new Date(), "yyyy-MM-dd") === dateKey;
                          const isPast = date < new Date();

                          return (
                            <div key={dateKey} className="space-y-3">
                              {/* Date Header */}
                              <div
                                className={`p-3 rounded-lg ${
                                  isToday
                                    ? "bg-blue-100"
                                    : isPast
                                    ? "bg-gray-100"
                                    : "bg-green-50"
                                }`}
                              >
                                <h4
                                  className={`font-semibold ${
                                    isToday
                                      ? "text-blue-900"
                                      : isPast
                                      ? "text-gray-700"
                                      : "text-green-900"
                                  }`}
                                >
                                  {isToday
                                    ? "Today"
                                    : format(date, "EEEE, MMMM d, yyyy")}
                                  {isPast && " (Past)"}
                                </h4>
                                <p
                                  className={`text-sm ${
                                    isToday
                                      ? "text-blue-700"
                                      : isPast
                                      ? "text-gray-600"
                                      : "text-green-700"
                                  }`}
                                >
                                  {dayMeetings.length} meeting
                                  {dayMeetings.length === 1 ? "" : "s"}
                                </p>
                              </div>

                              {/* Meetings for this date */}
                              <div className="space-y-2 ml-4">
                                {dayMeetings.map((meeting, idx) => {
                                  const formatMeetingTimeRange = () => {
                                    try {
                                      const startTime =
                                        meeting.start_time ||
                                        (meeting as any).startTime; // eslint-disable-line @typescript-eslint/no-explicit-any
                                      const endTime =
                                        meeting.end_time ||
                                        (meeting as any).endTime; // eslint-disable-line @typescript-eslint/no-explicit-any
                                      if (!startTime) return "Time TBD";
                                      const start = new Date(startTime);
                                      if (isNaN(start.getTime()))
                                        return "Invalid time";

                                      if (endTime) {
                                        const end = new Date(endTime);
                                        if (!isNaN(end.getTime())) {
                                          const duration = Math.round(
                                            (end.getTime() - start.getTime()) /
                                              (1000 * 60)
                                          );
                                          return `${format(
                                            start,
                                            "h:mm a"
                                          )} - ${format(
                                            end,
                                            "h:mm a"
                                          )} (${duration} min)`;
                                        }
                                      }
                                      return format(start, "h:mm a");
                                    } catch {
                                      return "Invalid time";
                                    }
                                  };

                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all"
                                      onClick={(e) =>
                                        handleMeetingClick(meeting, e)
                                      }
                                    >
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <h5 className="font-medium text-gray-900">
                                            {meeting.name}
                                          </h5>
                                          {meeting.location?.type ===
                                            "video" && (
                                            <Badge
                                              variant="outline"
                                              className="text-blue-600 border-blue-200"
                                            >
                                              Video Call
                                            </Badge>
                                          )}
                                          {meeting.location?.type ===
                                            "phone" && (
                                            <Badge
                                              variant="outline"
                                              className="text-green-600 border-green-200"
                                            >
                                              Phone Call
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                          <Clock className="w-3 h-3 inline mr-1" />
                                          {formatMeetingTimeRange()}
                                        </p>
                                        {meeting.invitees &&
                                          meeting.invitees[0] && (
                                            <p className="text-xs text-gray-500">
                                              <Users className="w-3 h-3 inline mr-1" />
                                              with {meeting.invitees[0].name} (
                                              {meeting.invitees[0].email})
                                            </p>
                                          )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {meeting.location?.join_url && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              window.open(
                                                meeting.location?.join_url,
                                                "_blank"
                                              );
                                            }}
                                          >
                                            Join
                                          </Button>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleMeetingClick(meeting, e);
                                          }}
                                        >
                                          Details
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium text-gray-700 mb-2">
                      No upcoming meetings
                    </h4>
                    <p className="text-sm">
                      Your upcoming meetings will appear here
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => actions.loadEvents()}
                      className="mt-4"
                    >
                      Refresh Meetings
                    </Button>
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
