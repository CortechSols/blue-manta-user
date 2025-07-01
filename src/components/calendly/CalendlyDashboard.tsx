import React, { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  Users,
  Clock,
  Settings,
  AlertCircle,
  RefreshCw,
  Plus,
  BarChart3,
  ExternalLink,
  CalendarPlus,
  Download,
  CheckCircle,
  UserCheck,
  Activity,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Filter,
  Search,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { CalendarView } from "./CalendarView";
import { MeetingsList } from "./MeetingsList";
import { EventTypesList } from "./EventTypesList";
import { BookingModal } from "./BookingModal";
import { CreateEventTypeModal } from "./CreateEventTypeModal";
import { CancelMeetingModal } from "./CancelMeetingModal";
import type { EventTypeFormData } from "@/types/calendly";
import {
  useCalendlyDashboard,
  useCalendlyActions,
  useCalendlyConnection,
  useCalendlyCalendarView,
} from "@/stores/calendlyStore";
import { format, addDays, subDays } from "date-fns";
import { shouldUseDemoData } from "@/lib/demo-data";

interface CalendlyDashboardProps {
  className?: string;
}

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, subtitle, icon, color }) => {
  return (
    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
              {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
            </div>
          </div>
          <div className={`p-3 rounded-full ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const QuickActionsSection: React.FC = () => {
  const actions = useCalendlyActions();
  const connectionStatus = useCalendlyConnection();

  return (
    <Card className="bg-white border border-gray-100 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          className="w-full !bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 font-medium shadow-sm"
          onClick={() => actions?.refreshAll?.()}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All Data
        </Button>

        <Button
          variant="outline"
          className="w-full border-gray-200 hover:bg-gray-50 text-gray-700"
          onClick={() =>
            window.open("https://calendly.com/analytics", "_blank")
          }
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          View Analytics
        </Button>

        <Button
          variant="outline"
          className="w-full border-gray-200 hover:bg-gray-50 text-gray-700"
          onClick={() => console.log("Export data")}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>

        <Button
          variant="outline"
          className="w-full border-gray-200 hover:bg-gray-50 text-gray-700"
          onClick={() => console.log("Bulk operations")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Bulk Operations
        </Button>
      </CardContent>
    </Card>
  );
};

const ConnectionStatusSection: React.FC = () => {
  const connectionStatus = useCalendlyConnection();
  const actions = useCalendlyActions();

  return (
    <Card className="bg-white border border-gray-100 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 hover:bg-gray-50 text-gray-700"
            onClick={() => actions?.refreshAll?.()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Check Connections
          </Button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Organization Connected:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {connectionStatus?.is_connected ? "Yes" : "No"}
              </span>
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus?.is_connected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Connected Users:</span>
            <span className="font-medium text-gray-900">1 / 1</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Last Sync:</span>
            <span className="font-medium text-gray-900">30/06/2025</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const UserSelectionSection: React.FC = () => {
  const connectionStatus = useCalendlyConnection();

  return (
    <Card className="bg-white border border-gray-100 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            User Selection
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="!text-blue-600 hover:!text-blue-700 hover:!bg-blue-50 text-xs"
            >
              Show All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="!text-blue-600 hover:!text-blue-700 hover:!bg-blue-50 text-xs"
            >
              Deselect All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">Waleed Amjad</span>
                <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                  Connected
                </Badge>
                <Badge
                  variant="outline"
                  className="text-gray-600 text-xs px-2 py-1"
                >
                  user
                </Badge>
              </div>
              <p className="text-sm text-gray-500">waleedamjad56@gmail.com</p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-3">1 user selected</p>
        </div>
      </CardContent>
    </Card>
  );
};

const CalendarOverviewSection: React.FC = () => {
  const { meetings } = useCalendlyDashboard();
  const calendarView = useCalendlyCalendarView();
  const actions = useCalendlyActions();

  const views = ["Month", "Week", "Day", "Agenda"];

  // Load data when component mounts
  React.useEffect(() => {
    actions.refreshAll();
  }, []);

  const handleViewChange = (view: string) => {
    actions.setCalendarView({ 
      ...calendarView, 
      view: view.toLowerCase() as any 
    });
  };

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    // Ensure we have a proper Date object
    const currentDate = new Date(calendarView.date);
    let newDate: Date;

    switch (direction) {
      case 'prev':
        newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'next':
        newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'today':
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
    return calendarView.view.charAt(0).toUpperCase() + calendarView.view.slice(1);
  };

  // Get meetings for the current month
  const getMeetingsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.start_time || meeting.startTime);
      const meetingDateStr = format(meetingDate, 'yyyy-MM-dd');
      return meetingDateStr === dateStr && meeting.status === 'active';
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
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the Sunday before the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generate 42 days (6 weeks) to fill the calendar grid
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
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
    <Card className="bg-white border border-gray-100 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Calendar Overview
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
                  variant={getCurrentViewName() === view ? "default" : "outline"}
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
              {format(new Date(calendarView.date), 'MMMM yyyy')}
            </h3>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="p-2 border-gray-200 hover:bg-gray-50"
                onClick={() => handleNavigate('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-4 border-gray-200 hover:bg-gray-50"
                onClick={() => handleNavigate('today')}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="p-2 border-gray-200 hover:bg-gray-50"
                onClick={() => handleNavigate('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid - Only show for Month view */}
          {getCurrentViewName() === 'Month' && (
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
                  className={`bg-white aspect-square p-2 text-center text-sm border-0 relative ${
                    day.isCurrentMonth
                      ? "hover:bg-gray-50 cursor-pointer text-gray-900"
                      : "text-gray-300"
                  } ${
                    day.isToday
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : ""
                  }`}
                >
                  <div className="font-medium">
                    {day.dayNumber.toString().padStart(2, "0")}
                  </div>
                  
                  {/* Meeting indicators */}
                  {day.meetings.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {day.meetings.slice(0, 2).map((meeting, idx) => (
                        <div
                          key={idx}
                          className="w-full h-1 bg-blue-500 rounded-full"
                          title={`${meeting.name} - ${format(new Date(meeting.start_time || meeting.startTime), 'h:mm a')}`}
                        />
                      ))}
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
          {getCurrentViewName() === 'Week' && (
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Week View</h3>
                <p>Week view for {format(new Date(calendarView.date), 'MMM d, yyyy')}</p>
                {meetings.length > 0 && (
                  <p className="text-sm mt-2">
                    {meetings.filter(m => m.status === 'active').length} active meetings this period
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Day View */}
          {getCurrentViewName() === 'Day' && (
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Day View</h3>
                <p>Day view for {format(new Date(calendarView.date), 'EEEE, MMM d, yyyy')}</p>
                {(() => {
                  const dayMeetings = getMeetingsForDate(new Date(calendarView.date));
                  return dayMeetings.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Meetings today:</p>
                      {dayMeetings.map((meeting, idx) => (
                        <div key={idx} className="text-sm bg-blue-50 p-2 rounded">
                          {meeting.name} - {format(new Date(meeting.start_time || meeting.startTime), 'h:mm a')}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm mt-2">No meetings scheduled for this day</p>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Agenda View */}
          {getCurrentViewName() === 'Agenda' && (
            <div className="space-y-4">
              <div className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700">Upcoming Meetings</h3>
                  <span className="text-sm text-gray-500">
                    {meetings.filter(m => m.status === 'active').length} active meetings
                  </span>
                </div>
                
                {meetings.filter(m => m.status === 'active').length > 0 ? (
                  <div className="space-y-3">
                    {meetings
                      .filter(m => m.status === 'active')
                      .sort((a, b) => {
                        const aTime = new Date(a.start_time || a.startTime).getTime();
                        const bTime = new Date(b.start_time || b.startTime).getTime();
                        return aTime - bTime;
                      })
                      .slice(0, 5)
                      .map((meeting, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{meeting.name}</h4>
                            <p className="text-sm text-gray-600">
                              {format(new Date(meeting.start_time || meeting.startTime), 'MMM d, yyyy • h:mm a')}
                            </p>
                            {meeting.invitees && meeting.invitees[0] && (
                              <p className="text-xs text-gray-500">
                                with {meeting.invitees[0].name}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            {meeting.location?.type || 'Meeting'}
                          </Badge>
                        </div>
                      ))}
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

export const CalendlyDashboard: React.FC<CalendlyDashboardProps> = ({
  className = "",
}) => {
  const { connectionStatus, loading, error, events, meetings, eventTypes } =
    useCalendlyDashboard();
  const actions = useCalendlyActions();
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate metrics
  const todaysMeetings = meetings.filter((meeting) => {
    const startTime = meeting.start_time || meeting.startTime;
    const meetingDate = new Date(startTime);
    const today = new Date();
    return (
      meeting.status === "active" &&
      meetingDate.toDateString() === today.toDateString()
    );
  });

  const connectedUsers = connectionStatus?.is_connected ? 1 : 0;
  const activeEventTypes = eventTypes.filter((et) => et.active);
  const totalMeetings = meetings.length;

  // Show error state
  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <span>Error: {error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  actions?.clearError?.();
                  actions?.refreshAll?.();
                }}
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Today's Meetings"
            value={todaysMeetings.length}
            icon={<Calendar className="w-6 h-6 text-white" />}
            color="bg-blue-500"
          />
          <MetricCard
            title="Connected Users"
            value={connectedUsers}
            subtitle="of 1 total"
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-green-500"
          />
          <MetricCard
            title="Active Event Types"
            value={activeEventTypes.length}
            icon={<Activity className="w-6 h-6 text-white" />}
            color="bg-purple-500"
          />
          <MetricCard
            title="Total Meetings"
            value={totalMeetings}
            icon={<BarChart3 className="w-6 h-6 text-white" />}
            color="bg-orange-500"
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="event-types">Event Types</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CalendarOverviewSection />
              </div>
              <div className="space-y-6">
                <QuickActionsSection />
                <ConnectionStatusSection />
                <UserSelectionSection />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarView />
          </TabsContent>

          <TabsContent value="meetings" className="space-y-6">
            <MeetingsList />
          </TabsContent>

          <TabsContent value="event-types" className="space-y-6">
            <EventTypesList />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardContent className="p-12">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Analytics Coming Soon
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Detailed analytics and insights will be available here to
                    help you understand your meeting patterns and performance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="space-y-6">
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardContent className="p-12">
                <div className="text-center">
                  <Settings className="w-16 h-16 mx-auto text-gray-300 mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Connection Management
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Manage your Calendly connections and integrations here to
                    ensure seamless synchronization.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modals */}
      <CancelMeetingModal />
    </div>
  );
};
