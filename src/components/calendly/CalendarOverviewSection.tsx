import React from "react";
import {
  Users,
  ChevronRight,
  ChevronLeft,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import {
  useCalendlyDashboard,
  useCalendlyActions,
  useCalendlyCalendarView,
  useSetCalendarView,
  useSetSelectedDate,
  useLoadEvents,
} from "@/stores/calendlyStore";

export const CalendarOverviewSection: React.FC = () => {
  const { meetings } = useCalendlyDashboard();
  const calendarView = useCalendlyCalendarView();
  const setCalendarView = useSetCalendarView();
  const setSelectedDate = useSetSelectedDate();
  const loadEvents = useLoadEvents();
  const actions = useCalendlyActions();

  const views = ["Month", "Week", "Day", "Agenda"];

  const handleViewChange = (view: string) => {
    setCalendarView({
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

    setCalendarView({ ...calendarView, date: newDate });
    setSelectedDate(newDate);
    loadEvents();
  };

  const getCurrentViewName = () => {
    return (
      calendarView.view.charAt(0).toUpperCase() + calendarView.view.slice(1)
    );
  };

  const getMeetingsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return meetings.filter((meeting) => {
      const meetingDate = new Date(
        meeting.start_time || meeting.startTime || ""
      );
      const meetingDateStr = format(meetingDate, "yyyy-MM-dd");
      return meetingDateStr === dateStr && meeting.status === "active";
    });
  };

  const handleMeetingClick = (meeting: any, e: React.MouseEvent) => {
    e.stopPropagation();
    actions.openMeetingDetailsModal(meeting);
  };

  const handleDayClick = (day: any) => {
    // TODO: Implement day selection logic
  };

  const generateCalendarDays = () => {
    const currentDate = new Date(calendarView.date);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

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

  return (
    <Card className="bg-white border border-gray-100 shadow-sm h-full">
      <CardHeader className="pb-3 md:pb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-base md:text-lg font-semibold text-gray-800">
            Calendar Overview
          </CardTitle>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
              <span>Users:</span>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 md:w-4 md:h-4" />
                <span className="font-medium">1 selected</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {views.map((view) => (
                <Button
                  key={view}
                  variant={
                    getCurrentViewName() === view ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleViewChange(view)}
                  className={`text-xs px-2 md:px-3 py-1 ${
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
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4 md:space-y-6">
          {/* Calendar Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">
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
                className="px-3 md:px-4 border-gray-200 hover:bg-gray-50 text-xs md:text-sm"
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
                  className="bg-gray-50 p-2 md:p-3 text-center text-xs md:text-sm font-medium text-gray-700"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {generateCalendarDays().map((day, i) => (
                <div
                  key={i}
                  className={`bg-white aspect-square p-1 md:p-2 text-center text-xs md:text-sm border-0 relative ${
                    day.isCurrentMonth
                      ? "hover:bg-gray-50 cursor-pointer text-gray-900"
                      : "text-gray-300"
                  } ${
                    day.isToday ? "bg-blue-50 text-blue-700 font-semibold" : ""
                  }`}
                >
                  <div className="font-medium">
                    {day.dayNumber.toString().padStart(2, "0")}
                  </div>

                  {/* Meeting indicators */}
                  {day.meetings.length > 0 && (
                    <div className="mt-1 space-y-0.5 md:space-y-1">
                      {day.meetings.slice(0, 2).map((meeting, idx) => (
                        <div
                          key={idx}
                          className="w-full h-0.5 md:h-1 bg-blue-500 rounded-full"
                          title={`${meeting.name} - ${format(
                            new Date(
                              meeting.start_time || meeting.startTime || ""
                            ),
                            "h:mm a"
                          )}`}
                        />
                      ))}
                      {day.meetings.length > 2 && (
                        <div className="text-xs text-gray-500 hidden md:block">
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
                <div className="bg-gray-50 p-2 text-center text-xs md:text-sm font-medium text-gray-700">
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
                        className={`bg-gray-50 p-2 text-center text-xs md:text-sm font-medium ${
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
              <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden max-h-64 md:max-h-80 overflow-y-auto">
                {Array.from({ length: 10 }, (_, hourIndex) => {
                  const hour = hourIndex + 8; // Start from 8 AM

                  return (
                    <React.Fragment key={hour}>
                      {/* Time column */}
                      <div className="bg-white p-1 md:p-2 text-xs text-gray-600 text-center border-r">
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
                              meeting.start_time || meeting.startTime;
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
                            className="bg-white p-1 min-h-[30px] md:min-h-[35px] relative hover:bg-gray-50 cursor-pointer"
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
                                className="bg-blue-500 text-white text-xs p-1 rounded mb-1 cursor-pointer hover:bg-blue-600 truncate"
                                title={meeting.name}
                                onClick={(e) => handleMeetingClick(meeting, e)}
                              >
                                {meeting.name.length > 10
                                  ? meeting.name.substring(0, 10) + "..."
                                  : meeting.name}
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
              <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                  {format(new Date(calendarView.date), "EEEE, MMMM d, yyyy")}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
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
              <div className="border rounded-lg overflow-hidden max-h-64 md:max-h-80 overflow-y-auto">
                <div className="grid grid-cols-1 divide-y">
                  {Array.from({ length: 10 }, (_, hourIndex) => {
                    const hour = hourIndex + 8; // Start from 8 AM
                    const currentHour = new Date(calendarView.date);
                    currentHour.setHours(hour, 0, 0, 0);

                    const hourMeetings = getMeetingsForDate(
                      new Date(calendarView.date)
                    ).filter((meeting) => {
                      try {
                        const meetingStartTime =
                          meeting.start_time || meeting.startTime;
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
                        className={`p-2 md:p-3 hover:bg-gray-50 ${
                          isCurrentHour ? "bg-blue-50" : "bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-2 md:gap-3">
                          <div className="text-xs md:text-sm font-medium text-gray-600 w-16 md:w-20 flex-shrink-0">
                            {format(
                              new Date().setHours(hour, 0, 0, 0),
                              "h:mm a"
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {hourMeetings.length > 0 ? (
                              <div className="space-y-1 md:space-y-2">
                                {hourMeetings.map((meeting, idx) => {
                                  const formatMeetingTimeRange = () => {
                                    try {
                                      const startTime =
                                        meeting.start_time || meeting.startTime;
                                      const endTime =
                                        meeting.end_time ||
                                        (meeting as any).endTime;
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
                                      className="bg-blue-500 text-white p-2 md:p-3 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
                                      onClick={(e) =>
                                        handleMeetingClick(meeting, e)
                                      }
                                    >
                                      <div className="font-medium text-xs md:text-sm truncate">
                                        {meeting.name}
                                      </div>
                                      <div className="text-xs text-blue-100">
                                        {formatMeetingTimeRange()}
                                      </div>
                                      {meeting.invitees &&
                                        meeting.invitees[0] && (
                                          <div className="text-xs text-blue-200 mt-1 truncate">
                                            with {meeting.invitees[0].name}
                                          </div>
                                        )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-gray-400 text-xs md:text-sm italic">
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
              <div className="py-2 md:py-4">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    Upcoming Meetings
                  </h3>
                  <span className="text-xs md:text-sm text-gray-500">
                    {meetings.filter((m) => m.status === "active").length}{" "}
                    active meetings
                  </span>
                </div>

                {meetings.filter((m) => m.status === "active").length > 0 ? (
                  <div className="space-y-3 md:space-y-4 max-h-64 md:max-h-80 overflow-y-auto">
                    {(() => {
                      const groupedMeetings = meetings
                        .filter((m) => {
                          const meetingStartTime = m.start_time || m.startTime;
                          return (
                            m.status === "active" &&
                            meetingStartTime &&
                            meetingStartTime !== "null" &&
                            meetingStartTime !== ""
                          );
                        })
                        .sort((a, b) => {
                          try {
                            const aStartTime = a.start_time || a.startTime;
                            const bStartTime = b.start_time || b.startTime;
                            const aTime = new Date(aStartTime || "").getTime();
                            const bTime = new Date(bStartTime || "").getTime();
                            if (isNaN(aTime) && isNaN(bTime)) return 0;
                            if (isNaN(aTime)) return 1;
                            if (isNaN(bTime)) return -1;
                            return aTime - bTime;
                          } catch {
                            return 0;
                          }
                        })
                        .slice(0, 6) // Limit to 6 meetings for overview
                        .reduce(
                          (
                            groups: Record<string, typeof meetings>,
                            meeting
                          ) => {
                            try {
                              const meetingStartTime =
                                meeting.start_time || meeting.startTime;
                              const meetingDate = new Date(
                                meetingStartTime || ""
                              );
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

                          return (
                            <div key={dateKey} className="space-y-2">
                              {/* Date Header */}
                              <div
                                className={`p-2 md:p-3 rounded-lg ${
                                  isToday ? "bg-blue-100" : "bg-gray-100"
                                }`}
                              >
                                <h4
                                  className={`font-semibold text-sm md:text-base ${
                                    isToday ? "text-blue-900" : "text-gray-700"
                                  }`}
                                >
                                  {isToday
                                    ? "Today"
                                    : format(date, "EEEE, MMM d")}
                                </h4>
                              </div>

                              {/* Meetings for this date */}
                              <div className="space-y-2 ml-2 md:ml-4">
                                {dayMeetings.map((meeting, idx) => {
                                  const formatMeetingTimeRange = () => {
                                    try {
                                      const startTime =
                                        meeting.start_time || meeting.startTime;
                                      if (!startTime) return "Time TBD";
                                      const start = new Date(startTime);
                                      if (isNaN(start.getTime()))
                                        return "Invalid time";
                                      return format(start, "h:mm a");
                                    } catch {
                                      return "Invalid time";
                                    }
                                  };

                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-2 md:p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all"
                                      onClick={(e) =>
                                        handleMeetingClick(meeting, e)
                                      }
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h5 className="font-medium text-xs md:text-sm text-gray-900 truncate">
                                            {meeting.name}
                                          </h5>
                                          {meeting.location?.type ===
                                            "video" && (
                                            <Badge
                                              variant="outline"
                                              className="text-blue-600 border-blue-200 text-xs"
                                            >
                                              Video
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-600">
                                          <Clock className="w-3 h-3 inline mr-1" />
                                          {formatMeetingTimeRange()}
                                        </p>
                                        {meeting.invitees &&
                                          meeting.invitees[0] && (
                                            <p className="text-xs text-gray-500 truncate">
                                              with {meeting.invitees[0].name}
                                            </p>
                                          )}
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMeetingClick(meeting, e);
                                        }}
                                        className="text-xs"
                                      >
                                        Details
                                      </Button>
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
                  <div className="text-center py-8 md:py-12 text-gray-500">
                    <Users className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-sm md:text-lg font-medium text-gray-700 mb-2">
                      No upcoming meetings
                    </h4>
                    <p className="text-xs md:text-sm">
                      Your upcoming meetings will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 