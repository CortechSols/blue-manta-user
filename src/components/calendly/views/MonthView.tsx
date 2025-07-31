import React from "react";
import { format } from "date-fns";
import type { CalendarViewProps } from "@/types/calendly";
import { generateCalendarDays } from "@/lib/calendar-utils";

export const MonthView: React.FC<CalendarViewProps> = ({
  meetings,
  calendarView,
  onMeetingClick,
  onDayClick,
}) => {
  const calendarDays = generateCalendarDays(calendarView, meetings);

  return (
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
      {calendarDays.map((day, i) => (
        <div
          key={i}
          className={`bg-white aspect-square p-1 md:p-2 text-center text-xs md:text-sm border-0 relative ${
            day.isCurrentMonth
              ? "hover:bg-gray-50 cursor-pointer text-gray-900"
              : "text-gray-300"
          } ${
            day.isToday ? "bg-blue-50 text-blue-700 font-semibold" : ""
          }`}
          onClick={() => onDayClick?.(day)}
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
                  className="w-full h-0.5 md:h-1 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600"
                  title={`${meeting.name} - ${format(
                    new Date(meeting.start_time || meeting.startTime || ""),
                    "h:mm a"
                  )}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMeetingClick(meeting, e);
                  }}
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
  );
};