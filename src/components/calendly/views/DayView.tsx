import React from "react";
import { format } from "date-fns";
import type { CalendarViewProps } from "@/types/calendly";
import { getMeetingsForDate, formatMeetingTimeRange } from "@/lib/calendar-utils";

export const DayView: React.FC<CalendarViewProps> = ({
  meetings,
  calendarView,
  onMeetingClick,
}) => {
  const currentDate = new Date(calendarView.date);
  

  
  const dayMeetings = getMeetingsForDate(currentDate, meetings);

  return (
    <div className="space-y-4">
      {/* Day Header */}
      <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
          {format(currentDate, "EEEE, MMMM d, yyyy")}
        </h3>
        <p className="text-xs md:text-sm text-gray-600">
          {dayMeetings.length === 0
            ? "No meetings scheduled"
            : `${dayMeetings.length} meeting${
                dayMeetings.length === 1 ? "" : "s"
              } scheduled`}
        </p>
      </div>

      {/* Day Schedule */}
      <div className="border rounded-lg overflow-hidden max-h-96 md:max-h-[600px] overflow-y-auto">
        <div className="grid grid-cols-1 divide-y">
          {Array.from({ length: 24 }, (_, hourIndex) => {
            const hour = hourIndex; // Start from 0 AM to 11 PM (24 hours)

            const currentHour = new Date(currentDate);
            currentHour.setHours(hour, 0, 0, 0);

            const hourMeetings = dayMeetings.filter((meeting) => {
              try {
                const meetingStartTime = meeting.start_time || meeting.startTime;
                if (!meetingStartTime) return false;
                const meetingDate = new Date(meetingStartTime);
                return meetingDate.getHours() === hour;
              } catch {
                return false;
              }
            });

            const isCurrentHour =
              new Date().getHours() === hour &&
              format(new Date(), "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd");

            return (
              <div
                key={hour}
                className={`p-2 md:p-3 hover:bg-gray-50 ${
                  isCurrentHour ? "bg-blue-50" : "bg-white"
                }`}
              >
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="text-xs md:text-sm font-medium text-gray-600 w-16 md:w-20 flex-shrink-0">
                    {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
                  </div>
                  <div className="flex-1 min-w-0">
                    {hourMeetings.length > 0 ? (
                      <div className="space-y-1 md:space-y-2">
                        {hourMeetings.map((meeting, idx) => (
                          <div
                            key={idx}
                            className="bg-blue-500 text-white p-2 md:p-3 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
                            onClick={(e) => onMeetingClick(meeting, e)}
                          >
                            <div className="font-medium text-xs md:text-sm truncate">
                              {meeting.name}
                            </div>
                            <div className="text-xs text-blue-100">
                              {formatMeetingTimeRange(meeting)}
                            </div>
                            {meeting.invitees && meeting.invitees[0] && (
                              <div className="text-xs text-blue-200 mt-1 truncate">
                                with {meeting.invitees[0].name}
                              </div>
                            )}
                          </div>
                        ))}
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
  );
};