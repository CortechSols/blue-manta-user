import React, { useState } from "react";
import {
  Calendar,
  Users,
  Clock,
  Settings,
  AlertCircle,
  BarChart3,
  ExternalLink,
  Download,
  Activity,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshButton } from "@/components/ui/refresh-button";
import { CalendarView } from "./CalendarView";
import { MeetingsList } from "./MeetingsList";
import { EventTypesList } from "./EventTypesList";
import { CancelMeetingModal } from "./CancelMeetingModal";
import {
  useCalendlyDashboard,
  useCalendlyActions,
  useCalendlyConnection,
  useCalendlyCalendarView,
  useSetCalendarView,
  useSetSelectedDate,
  useLoadEvents,
} from "@/stores/calendlyStore";
import { format } from "date-fns";

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
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs md:text-sm font-medium text-gray-500">
              {title}
            </p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-xl md:text-3xl font-bold text-gray-900">
                {value}
              </h3>
              {subtitle && (
                <p className="text-xs md:text-sm text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>
          <div className={`p-2 md:p-3 rounded-full ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const QuickActionsSection: React.FC = () => {
  const actions = useCalendlyActions();

  return (
    <Card className="bg-white border border-gray-100 shadow-sm">
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Settings className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-3">
        <RefreshButton
          onRefresh={() => actions?.refreshAll?.()}
          label="Refresh All Data"
          variant="default"
          className="w-full !bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 font-medium shadow-sm text-sm md:text-base"
        />

        <Button
          variant="outline"
          className="w-full border-gray-200 hover:bg-gray-50 text-gray-700 text-sm md:text-base"
          onClick={() =>
            window.open("https://calendly.com/analytics", "_blank")
          }
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          View Analytics (Calendly)
        </Button>

        <Button
          variant="outline"
          className="w-full border-gray-200 hover:bg-gray-50 text-gray-700 text-sm md:text-base"
          onClick={() => console.log("Export data")}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>

        <Button
          variant="outline"
          className="w-full border-gray-200 hover:bg-gray-50 text-gray-700 text-sm md:text-base"
          onClick={() =>
            window.open("https://calendly.com/event_types", "_blank")
          }
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Manage Event Types
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
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="text-base md:text-lg font-semibold text-gray-800">
          Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <RefreshButton
            onRefresh={() => actions?.refreshAll?.()}
            label="Check Connections"
            size="sm"
            className="border-gray-200 hover:bg-gray-50 text-gray-700 text-xs md:text-sm"
          />
        </div>

        <div className="space-y-3 text-xs md:text-sm">
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
            <span className="font-medium text-gray-900">
              {format(new Date(), "dd/MM/yyyy")}
            </span>
          </div>
        </div>

        {connectionStatus?.is_connected && (
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-blue-600 border-blue-300 hover:bg-blue-50 text-xs md:text-sm"
              onClick={() =>
                window.open("https://calendly.com/integrations", "_blank")
              }
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage in Calendly
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const UserSelectionSection: React.FC = () => {
  const connectionStatus = useCalendlyConnection();

  return (
    <Card className="bg-white border border-gray-100 shadow-sm">
      <CardHeader className="pb-3 md:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            Connected User
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 border border-gray-100 rounded-lg bg-gray-50">
            <input
              type="checkbox"
              defaultChecked
              disabled
              className="w-4 h-4 text-blue-600 rounded border-gray-300 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium text-gray-900 text-sm md:text-base truncate">
                  {connectionStatus?.user_name || "Connected User"}
                </span>
                <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1 flex-shrink-0">
                  Connected
                </Badge>
                <Badge
                  variant="outline"
                  className="text-gray-600 text-xs px-2 py-1 flex-shrink-0"
                >
                  user
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-gray-500 truncate">
                {connectionStatus?.scheduling_url || "Calendly User"}
              </p>
            </div>
          </div>

          <p className="text-xs md:text-sm text-gray-500 mt-3">
            1 user connected
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const CalendarOverviewSection: React.FC = () => {
  const { meetings } = useCalendlyDashboard();
  const calendarView = useCalendlyCalendarView();
  const setCalendarView = useSetCalendarView();
  const setSelectedDate = useSetSelectedDate();
  const loadEvents = useLoadEvents();

  const views = ["Month", "Week", "Day", "Agenda"];

  // Data loading is handled by the parent CalendarPage
  // No need to load data here as it creates infinite loops

  const handleViewChange = (view: string) => {
    setCalendarView({
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

    setCalendarView({ ...calendarView, date: newDate });
    setSelectedDate(newDate);

    // Load events for the new date range
    loadEvents();
  };

  const getCurrentViewName = () => {
    return (
      calendarView.view.charAt(0).toUpperCase() + calendarView.view.slice(1)
    );
  };

  // Get meetings for the current month
  const getMeetingsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.start_time || meeting.startTime || "");
      const meetingDateStr = format(meetingDate, "yyyy-MM-dd");
      return meetingDateStr === dateStr && meeting.status === "active";
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

  return (
    <Card className="bg-white border border-gray-100 shadow-sm">
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
                            new Date(meeting.start_time || meeting.startTime || ""),
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
              <div className="text-center py-6 md:py-8 text-gray-500">
                <Calendar className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-base md:text-lg font-medium text-gray-700 mb-2">
                  Week View
                </h3>
                <p className="text-sm md:text-base">
                  Week view for{" "}
                  {format(new Date(calendarView.date), "MMM d, yyyy")}
                </p>
                {meetings.length > 0 && (
                  <p className="text-xs md:text-sm mt-2">
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
              <div className="text-center py-6 md:py-8 text-gray-500">
                <Clock className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-base md:text-lg font-medium text-gray-700 mb-2">
                  Day View
                </h3>
                <p className="text-sm md:text-base">
                  Day view for{" "}
                  {format(new Date(calendarView.date), "EEEE, MMM d, yyyy")}
                </p>
                {(() => {
                  const dayMeetings = getMeetingsForDate(
                    new Date(calendarView.date)
                  );
                  return dayMeetings.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs md:text-sm font-medium">
                        Meetings today:
                      </p>
                      {dayMeetings.map((meeting, idx) => (
                        <div
                          key={idx}
                          className="text-xs md:textsm bg-blue-50 p-2 rounded"
                        >
                          {meeting.name} -{" "}
                          {format(
                            new Date(meeting.start_time || meeting.startTime || ""),
                            "h:mm a"
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs md:text-sm mt-2">
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
              <div className="text-center py-6 md:py-8 text-gray-500">
                <Activity className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-base md:text-lg font-medium text-gray-700 mb-2">
                  Agenda View
                </h3>
                <p className="text-sm md:text-base">
                  Upcoming meetings and events
                </p>
                {meetings.length > 0 && (
                  <p className="text-xs md:text-sm mt-2">
                    {meetings.filter((m) => m.status === "active").length} total
                    meetings
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const CalendlyDashboard: React.FC<CalendlyDashboardProps> = ({
  className = "",
}) => {
  const { error, meetings, eventTypes } =
    useCalendlyDashboard();
  const actions = useCalendlyActions();
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate metrics
  const todaysMeetings = meetings.filter((meeting) => {
    const startTime = meeting.start_time || meeting.startTime;
    const meetingDate = new Date(startTime || "");
    const today = new Date();
    return (
      meeting.status === "active" &&
      meetingDate.toDateString() === today.toDateString()
    );
  });

  const activeEventTypes = eventTypes.filter((et) => et.active);
  const totalMeetings = meetings.length;

  // Show error state
  if (error) {
    return (
      <div className={`space-y-4 md:space-y-6 ${className}`}>
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-sm md:text-base">Error: {error}</span>
              <RefreshButton
                onRefresh={() => {
                  actions?.clearError?.();
                  actions?.refreshAll?.();
                }}
                label="Try Again"
                size="sm"
                className="text-xs md:text-sm"
              />
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* API Limitations Notice */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <p className="font-medium mb-1 text-sm md:text-base">
              Calendly API v2 Integration
            </p>
            <p className="text-xs md:text-sm">
              This dashboard provides read-only access to your Calendly data
              with limited management capabilities. For full event type
              management and advanced features, use your Calendly dashboard
              directly.
            </p>
          </AlertDescription>
        </Alert>

        {/* Header Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <MetricCard
            title="Today's Meetings"
            value={todaysMeetings.length}
            icon={<Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />}
            color="bg-blue-500"
          />
          <MetricCard
            title="Active Event Types"
            value={activeEventTypes.length}
            icon={<Activity className="w-5 h-5 md:w-6 md:h-6 text-white" />}
            color="bg-purple-500"
          />
          <MetricCard
            title="Total Meetings"
            value={totalMeetings}
            icon={<BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />}
            color="bg-orange-500"
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 text-xs md:text-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="event-types">Event Types</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-0">
              <div className="lg:col-span-2">
                <CalendarOverviewSection />
              </div>
              <div className="space-y-4 md:space-y-6">
                <QuickActionsSection />
                <ConnectionStatusSection />
                <UserSelectionSection />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4 md:space-y-6">
            <CalendarView />
          </TabsContent>

          <TabsContent value="meetings" className="space-y-4 md:space-y-6">
            <MeetingsList />
          </TabsContent>

          <TabsContent value="event-types" className="space-y-4 md:space-y-6">
            <EventTypesList />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CancelMeetingModal />
    </div>
  );
};
