import React from "react";
import { format } from "date-fns";
import type { CalendarViewProps } from "@/types/calendly";
import { getMeetingsForDate, getStartOfWeek } from "@/lib/calendar-utils";

export const WeekView: React.FC<CalendarViewProps> = ({
  meetings,
  calendarView,
  onMeetingClick,
  onDayClick,
}) => {
  const startOfWeek = getStartOfWeek(new Date(calendarView.date));
  


  return (
    <div className="space-y-4">
      {/* Week Header */}
      <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-2 text-center text-xs md:text-sm font-medium text-gray-700">
          Time
        </div>
        {Array.from({ length: 7 }, (_, i) => {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + i);
          const isToday =
            format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

          return (
            <div
              key={i}
              className={`bg-gray-50 p-2 text-center text-xs md:text-sm font-medium ${
                isToday ? "bg-blue-50 text-blue-700" : "text-gray-700"
              }`}
            >
              <div>{format(date, "EEE")}</div>
              <div className={`text-xs ${isToday ? "font-bold" : ""}`}>
                {format(date, "d")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden max-h-96 md:max-h-[600px] overflow-y-auto">
        {Array.from({ length: 24 }, (_, hourIndex) => {
          const hour = hourIndex; // Start from 0 AM to 11 PM (24 hours)
          
          // Debug: Log first few hours to verify
          if (hourIndex < 3) {
            console.log(`WeekView hour ${hourIndex}: ${hour} (${format(new Date().setHours(hour, 0, 0, 0), "h:mm a")})`);
          }

          return (
            <React.Fragment key={hour}>
              {/* Time column */}
              <div className="bg-white p-1 md:p-2 text-xs text-gray-600 text-center border-r">
                {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
              </div>

              {/* Day columns */}
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const currentDate = new Date(startOfWeek);
                currentDate.setDate(startOfWeek.getDate() + dayIndex);
                // Don't set hours here - we want to check the full day
                const dayDate = new Date(currentDate);
                dayDate.setHours(0, 0, 0, 0);

                const allDayMeetings = getMeetingsForDate(dayDate, meetings);
                

                
                const dayMeetings = allDayMeetings.filter((meeting) => {
                  try {
                    const meetingStartTime =
                      meeting.start_time || meeting.startTime;
                    if (!meetingStartTime) return false;
                    const meetingDate = new Date(meetingStartTime);
                    const hourMatches = meetingDate.getHours() === hour;
                    

                    
                    return hourMatches;
                  } catch {
                    return false;
                  }
                });

                return (
                  <div
                    key={dayIndex}
                    className="bg-white p-1 min-h-[30px] md:min-h-[35px] relative hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      onDayClick?.({
                        date: currentDate,
                        dayNumber: currentDate.getDate(),
                        isCurrentMonth: true,
                        isToday: format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"),
                        meetings: dayMeetings,
                      })
                    }
                  >
                    {dayMeetings.map((meeting, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-500 text-white text-xs p-1 rounded mb-1 cursor-pointer hover:bg-blue-600 truncate"
                        title={meeting.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMeetingClick(meeting, e);
                        }}
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
  );
};