import { format } from "date-fns";
import type { CalendlyMeeting, CalendarDay, CalendarViewType } from "@/types/calendly";

/**
 * Get meetings for a specific date
 */
export const getMeetingsForDate = (date: Date, meetings: CalendlyMeeting[]): CalendlyMeeting[] => {
  const dateStr = format(date, "yyyy-MM-dd");

  const filtered = meetings.filter((meeting) => {
    try {
      const meetingStartTime = meeting.start_time || meeting.startTime;
      if (!meetingStartTime || meetingStartTime === "null" || meetingStartTime === "") {
        return false;
      }
      if (meeting.status !== "active") {
        return false;
      }
      const meetingDate = new Date(meetingStartTime);
      if (isNaN(meetingDate.getTime())) {
        return false;
      }
      const meetingDateStr = format(meetingDate, "yyyy-MM-dd");
      return meetingDateStr === dateStr;
    } catch (error) {
      console.error('Error filtering meeting:', error, meeting);
      return false;
    }
  });

  return filtered;
};

/**
 * Generate calendar days for month view
 */
export const generateCalendarDays = (calendarView: CalendarViewType, meetings: CalendlyMeeting[]): CalendarDay[] => {
  const currentDate = new Date(calendarView.date);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const isCurrentMonth = date.getMonth() === month;
    const isToday =
      format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
    const dayMeetings = getMeetingsForDate(date, meetings);

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

/**
 * Format meeting time range
 */
export const formatMeetingTimeRange = (meeting: CalendlyMeeting): string => {
  try {
    const startTime = meeting.start_time || meeting.startTime;
    const endTime = meeting.end_time;
    if (!startTime || !endTime) return "Time TBD";
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Invalid time";
    return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
  } catch {
    return "Invalid time";
  }
};

/**
 * Format single meeting time
 */
export const formatMeetingTime = (meeting: CalendlyMeeting): string => {
  try {
    const startTime = meeting.start_time || meeting.startTime;
    if (!startTime) return "Time TBD";
    const start = new Date(startTime);
    if (isNaN(start.getTime())) return "Invalid time";
    return format(start, "h:mm a");
  } catch {
    return "Invalid time";
  }
};

/**
 * Get start of week date
 */
export const getStartOfWeek = (date: Date): Date => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - day);
  return startOfWeek;
};

/**
 * Group meetings by date (all meetings)
 */
export const groupMeetingsByDate = (meetings: CalendlyMeeting[]): Record<string, CalendlyMeeting[]> => {
  return meetings
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
    .reduce((groups: Record<string, CalendlyMeeting[]>, meeting) => {
      try {
        const meetingStartTime = meeting.start_time || meeting.startTime;
        const meetingDate = new Date(meetingStartTime || "");
        if (!isNaN(meetingDate.getTime())) {
          const dateKey = format(meetingDate, "yyyy-MM-dd");
          if (!groups[dateKey]) groups[dateKey] = [];
          groups[dateKey].push(meeting);
        }
      } catch {
        // Skip invalid dates
      }
      return groups;
    }, {});
};

/**
 * Group upcoming meetings by date (future only)
 */
export const groupUpcomingMeetingsByDate = (meetings: CalendlyMeeting[]): Record<string, CalendlyMeeting[]> => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
  
  return meetings
    .filter((m) => {
      const meetingStartTime = m.start_time || m.startTime;
      
      // Basic validation
      if (!meetingStartTime || meetingStartTime === "null" || meetingStartTime === "") {
        return false;
      }
      
      if (m.status !== "active") {
        return false;
      }
      
      // Check if meeting is in the future (including today)
      try {
        const meetingDate = new Date(meetingStartTime);
        if (isNaN(meetingDate.getTime())) {
          return false;
        }
        
        // Only include meetings that are today or in the future
        const meetingStartOfDay = new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate());
        return meetingStartOfDay >= today;
      } catch {
        return false;
      }
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
    .reduce((groups: Record<string, CalendlyMeeting[]>, meeting) => {
      try {
        const meetingStartTime = meeting.start_time || meeting.startTime;
        const meetingDate = new Date(meetingStartTime || "");
        if (!isNaN(meetingDate.getTime())) {
          const dateKey = format(meetingDate, "yyyy-MM-dd");
          if (!groups[dateKey]) groups[dateKey] = [];
          groups[dateKey].push(meeting);
        }
      } catch {
        // Skip invalid dates
      }
      return groups;
    }, {});
};

/**
 * Navigate calendar date based on view type and direction
 */
export const navigateCalendarDate = (
  currentDate: Date,
  view: "month" | "week" | "day" | "agenda",
  direction: "prev" | "next" | "today"
): Date => {
  const newDate = new Date(currentDate);

  switch (direction) {
    case "prev":
      switch (view) {
        case "month":
          newDate.setMonth(newDate.getMonth() - 1);
          break;
        case "week":
          newDate.setDate(newDate.getDate() - 7);
          break;
        case "day":
          newDate.setDate(newDate.getDate() - 1);
          break;
        case "agenda":
          newDate.setDate(newDate.getDate() - 7);
          break;
        default:
          newDate.setMonth(newDate.getMonth() - 1);
      }
      break;
    case "next":
      switch (view) {
        case "month":
          newDate.setMonth(newDate.getMonth() + 1);
          break;
        case "week":
          newDate.setDate(newDate.getDate() + 7);
          break;
        case "day":
          newDate.setDate(newDate.getDate() + 1);
          break;
        case "agenda":
          newDate.setDate(newDate.getDate() + 7);
          break;
        default:
          newDate.setMonth(newDate.getMonth() + 1);
      }
      break;
    case "today":
      return new Date();
    default:
      return currentDate;
  }

  return newDate;
};

/**
 * Format calendar header title based on view type
 */
export const formatCalendarHeaderTitle = (
  date: Date,
  view: "month" | "week" | "day" | "agenda"
): string => {
  switch (view) {
    case "month":
      return format(date, "MMMM yyyy");
    case "week": {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return `${format(startOfWeek, "MMM d")} - ${format(endOfWeek, "MMM d, yyyy")}`;
    }
    case "day":
      return format(date, "EEEE, MMMM d, yyyy");
    case "agenda": {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return `${format(startOfWeek, "MMM d")} - ${format(endOfWeek, "MMM d, yyyy")}`;
    }
    default:
      return format(date, "MMMM yyyy");
  }
};