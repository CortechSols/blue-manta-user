import React, { useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { format, parseISO } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MapPin, 
  Video,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CalendlyEvent, CalendlyMeeting, CalendarViewEvent } from '@/types/calendly';
import { useCalendlyEvents, useCalendlyMeetings, useCalendlyActions, useCalendlyCalendarView } from '@/stores/calendlyStore';

// Setup moment localizer for react-big-calendar
const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  onEventClick?: (event: CalendlyEvent | CalendlyMeeting) => void;
  onSlotClick?: (slotInfo: { start: Date; end: Date; slots: Date[] }) => void;
  className?: string;
}

// Custom event component
const EventComponent: React.FC<{ event: CalendarViewEvent }> = ({ event }) => {
  const actions = useCalendlyActions();
  
  const getEventIcon = () => {
    if (event.resource?.type === 'meeting') {
      return event.resource.event.location?.type === 'video' ? 
        <Video className="w-3 h-3" /> : 
        <MapPin className="w-3 h-3" />;
    }
    return <CalendarIcon className="w-3 h-3" />;
  };

  const getEventColor = () => {
    if (event.resource?.type === 'meeting') {
      const meeting = event.resource.event as CalendlyMeeting;
      switch (meeting.status) {
        case 'active':
          return 'bg-blue-500 text-white';
        case 'cancelled':
          return 'bg-red-500 text-white';
        default:
          return 'bg-gray-500 text-white';
      }
    }
    return 'bg-green-500 text-white';
  };

  const handleEventAction = (action: 'view' | 'cancel' | 'reschedule', e: React.MouseEvent) => {
    e.stopPropagation();
    if (event.resource?.type === 'meeting') {
      const meeting = event.resource.event as CalendlyMeeting;
      switch (action) {
        case 'view':
          actions.openMeetingDetailsModal(meeting);
          break;
        case 'cancel':
          actions.openCancelMeetingModal(meeting.uri);
          break;
        case 'reschedule':
          actions.openRescheduleMeetingModal(meeting.uri);
          break;
      }
    }
  };

  return (
    <div className={`flex items-center justify-between p-1 rounded text-xs ${getEventColor()}`}>
      <div className="flex items-center gap-1 min-w-0">
        {getEventIcon()}
        <span className="truncate">{event.title}</span>
      </div>
      {event.resource?.type === 'meeting' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 text-white hover:bg-white/20">
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => handleEventAction('view', e)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleEventAction('reschedule', e)}>
              Reschedule
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => handleEventAction('cancel', e)}
              className="text-red-600"
            >
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

// Custom toolbar component
const CustomToolbar: React.FC<{
  date: Date;
  view: string;
  views: string[];
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onView: (view: string) => void;
}> = ({ date, view, views, onNavigate, onView }) => {
  const formatDate = () => {
    switch (view) {
      case Views.MONTH:
        return format(date, 'MMMM yyyy');
      case Views.WEEK:
        return `Week of ${format(date, 'MMM d, yyyy')}`;
      case Views.DAY:
        return format(date, 'EEEE, MMMM d, yyyy');
      case Views.AGENDA:
        return 'Agenda';
      default:
        return format(date, 'MMMM yyyy');
    }
  };

  return (
    <div className="flex items-center justify-between mb-4 p-4 bg-white border-b">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">{formatDate()}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('PREV')}
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('TODAY')}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('NEXT')}
            className="p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {views.map((viewName) => (
          <Button
            key={viewName}
            variant={view === viewName ? 'default' : 'outline'}
            size="sm"
            onClick={() => onView(viewName)}
            className="capitalize"
          >
            {viewName}
          </Button>
        ))}
      </div>
    </div>
  );
};

// Custom day prop getter for styling
const dayPropGetter = (date: Date) => {
  const isToday = moment(date).isSame(moment(), 'day');
  const isWeekend = moment(date).day() === 0 || moment(date).day() === 6;
  
  return {
    className: `
      ${isToday ? 'bg-blue-50 border-blue-200' : ''}
      ${isWeekend ? 'bg-gray-50' : ''}
    `,
  };
};

// Custom slot prop getter
const slotPropGetter = (date: Date) => {
  const hour = moment(date).hour();
  const isBusinessHour = hour >= 9 && hour <= 17;
  
  return {
    className: isBusinessHour ? 'bg-green-50' : 'bg-gray-50',
  };
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  onEventClick,
  onSlotClick,
  className = '',
}) => {
  const events = useCalendlyEvents();
  const meetings = useCalendlyMeetings();
  const calendarView = useCalendlyCalendarView();
  const actions = useCalendlyActions();

  // Transform Calendly events and meetings into calendar events
  const calendarEvents = useMemo((): CalendarViewEvent[] => {
    const eventList: CalendarViewEvent[] = [];

    // Add regular events (available times)
    events.forEach((event) => {
      eventList.push({
        id: event.uri,
        title: event.name,
        start: parseISO(event.start_time),
        end: parseISO(event.end_time),
        resource: {
          type: 'available',
          event,
          status: event.status,
        },
        color: '#10B981', // Green for available
      });
    });

    // Add meetings (busy times)
    meetings.forEach((meeting) => {
      eventList.push({
        id: meeting.uri,
        title: `${meeting.name} ${meeting.invitees.length > 0 ? `(${meeting.invitees[0].name})` : ''}`,
        start: parseISO(meeting.start_time),
        end: parseISO(meeting.end_time),
        resource: {
          type: 'meeting',
          event: meeting,
          status: meeting.status,
        },
        color: meeting.status === 'cancelled' ? '#EF4444' : '#3B82F6', // Red for cancelled, blue for active
      });
    });

    return eventList;
  }, [events, meetings]);

  const handleNavigate = useCallback((action: 'PREV' | 'NEXT' | 'TODAY') => {
    const currentDate = calendarView.date;
    let newDate: Date;

    switch (action) {
      case 'PREV':
        newDate = moment(currentDate).subtract(1, calendarView.view).toDate();
        break;
      case 'NEXT':
        newDate = moment(currentDate).add(1, calendarView.view).toDate();
        break;
      case 'TODAY':
        newDate = new Date();
        break;
      default:
        newDate = currentDate;
    }

    actions.setCalendarView({ ...calendarView, date: newDate });
    actions.setSelectedDate(newDate);
  }, [calendarView, actions]);

  const handleViewChange = useCallback((view: string) => {
    actions.setCalendarView({ ...calendarView, view: view as any });
  }, [calendarView, actions]);

  const handleSelectEvent = useCallback((event: CalendarViewEvent) => {
    if (event.resource) {
      onEventClick?.(event.resource.event);
      
      // Auto-open appropriate modal
      if (event.resource.type === 'meeting') {
        actions.openMeetingDetailsModal(event.resource.event as CalendlyMeeting);
      }
    }
  }, [onEventClick, actions]);

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date; slots: Date[] }) => {
    onSlotClick?.(slotInfo);
  }, [onSlotClick]);

  const eventStyleGetter = useCallback((event: CalendarViewEvent) => {
    return {
      style: {
        backgroundColor: event.color || '#3B82F6',
        borderRadius: '4px',
        opacity: event.resource?.status === 'cancelled' ? 0.6 : 1,
        border: 'none',
        color: 'white',
        fontSize: '12px',
      },
    };
  }, []);

  return (
    <Card className={`h-full ${className}`}>
      <div className="h-full flex flex-col">
        <CustomToolbar
          date={calendarView.date}
          view={calendarView.view}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          onNavigate={handleNavigate}
          onView={handleViewChange}
        />
        
        <div className="flex-1 p-4">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            view={calendarView.view}
            date={calendarView.date}
            onNavigate={() => {}} // Handled by custom toolbar
            onView={() => {}} // Handled by custom toolbar
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            popup
            popupOffset={30}
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
            slotPropGetter={slotPropGetter}
            components={{
              event: EventComponent,
            }}
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) => 
                `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
              agendaTimeFormat: 'HH:mm',
              agendaDateFormat: 'MMM dd',
            }}
            step={30}
            timeslots={2}
            min={new Date(2024, 0, 1, 8, 0)} // 8 AM
            max={new Date(2024, 0, 1, 20, 0)} // 8 PM
            scrollToTime={new Date(2024, 0, 1, 9, 0)} // Scroll to 9 AM
            className="h-full"
            style={{ height: '600px' }}
          />
        </div>
        
        {/* Legend */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded opacity-60"></div>
              <span>Cancelled</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}; 