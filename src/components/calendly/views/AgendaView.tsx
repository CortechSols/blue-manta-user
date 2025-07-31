import React from "react";
import { Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { CalendarViewProps } from "@/types/calendly";
import { groupUpcomingMeetingsByDate, formatMeetingTime } from "@/lib/calendar-utils";

export const AgendaView: React.FC<CalendarViewProps> = ({
  meetings,
  onMeetingClick,
}) => {
  const activeMeetings = meetings.filter((m) => m.status === "active");
  const upcomingMeetings = activeMeetings.filter((m) => {
    const meetingStartTime = m.start_time || m.startTime;
    if (!meetingStartTime || meetingStartTime === "null" || meetingStartTime === "") {
      return false;
    }
    
    try {
      const meetingDate = new Date(meetingStartTime);
      if (isNaN(meetingDate.getTime())) {
        return false;
      }
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const meetingStartOfDay = new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate());
      
      return meetingStartOfDay >= today;
    } catch {
      return false;
    }
  });
  
  const groupedMeetings = groupUpcomingMeetingsByDate(activeMeetings);

  return (
    <div className="space-y-4">
      <div className="py-2 md:py-4">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">
            Upcoming Meetings
          </h3>
          <span className="text-xs md:text-sm text-gray-500">
            {upcomingMeetings.length} upcoming meetings
          </span>
        </div>

        {upcomingMeetings.length > 0 ? (
          <div className="space-y-3 md:space-y-4 max-h-64 md:max-h-80 overflow-y-auto">
            {Object.entries(groupedMeetings).map(([dateKey, dayMeetings]) => {
              const date = new Date(dateKey);
              const isToday = format(new Date(), "yyyy-MM-dd") === dateKey;

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
                      {isToday ? "Today" : format(date, "EEEE, MMM d")}
                    </h4>
                  </div>

                  {/* Meetings for this date */}
                  <div className="space-y-2 ml-2 md:ml-4">
                    {dayMeetings.map((meeting, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 md:p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all"
                        onClick={(e) => onMeetingClick(meeting, e)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-xs md:text-sm text-gray-900 truncate">
                              {meeting.name}
                            </h5>
                            {meeting.location?.type === "video" && (
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
                            {formatMeetingTime(meeting)}
                          </p>
                          {meeting.invitees && meeting.invitees[0] && (
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
                            onMeetingClick(meeting, e);
                          }}
                          className="text-xs"
                        >
                          Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 md:py-12 text-gray-500">
            <Users className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-sm md:text-lg font-medium text-gray-700 mb-2">
              No upcoming meetings
            </h4>
            <p className="text-xs md:text-sm">
              You have no upcoming meetings scheduled. Past meetings are not shown in this view.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};