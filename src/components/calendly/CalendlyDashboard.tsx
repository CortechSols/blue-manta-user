import React, { useState } from "react";
import {
  Calendar,
  BarChart3,
  Activity,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarView } from "./CalendarView";
import { MeetingsList } from "./MeetingsList";
import { EventTypesList } from "./EventTypesList";
import { CancelMeetingModal } from "./CancelMeetingModal";
import { MeetingDetailsModal } from "./MeetingDetailsModal";
import { CalendlyMetricCard } from "./MetricCard";
import { QuickActionsSection } from "./QuickActionsSection";
import { ConnectionStatusSection } from "./ConnectionStatusSection";
import { UserSelectionSection } from "./UserSelectionSection";
import { CalendarOverviewSection } from "./CalendarOverviewSection";
import { useCalendlyDashboard } from "@/stores/calendlyStore";

interface CalendlyDashboardProps {
  className?: string;
}

export const CalendlyDashboard: React.FC<CalendlyDashboardProps> = ({
  className = "",
}) => {
  const { error, meetings, eventTypes } = useCalendlyDashboard();
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

  // Only count upcoming meetings (today and future)
  const upcomingMeetings = meetings.filter((meeting) => {
    const startTime = meeting.start_time || meeting.startTime;
    const meetingDate = new Date(startTime || "");
    const today = new Date();
    // Set today to start of day for proper comparison
    today.setHours(0, 0, 0, 0);
    meetingDate.setHours(0, 0, 0, 0);
    return meeting.status === "active" && meetingDate >= today;
  });

  const totalMeetings = upcomingMeetings.length;

  // Show error state
  if (error) {
    return (
      <div className={`space-y-4 md:space-y-6 ${className}`}>
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-sm md:text-base">Error: {error}</span>
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
          <CalendlyMetricCard
            title="Today's Meetings"
            value={todaysMeetings.length}
            icon={<Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />}
            color="bg-blue-500"
          />
          <CalendlyMetricCard
            title="Active Event Types"
            value={activeEventTypes.length}
            icon={<Activity className="w-5 h-5 md:w-6 md:h-6 text-white" />}
            color="bg-purple-500"
          />
          <CalendlyMetricCard
            title="Upcoming Meetings"
            value={totalMeetings}
            icon={<BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />}
            color="bg-orange-500"
          />
          <CalendlyMetricCard
            title="Total Meetings"
            value={meetings.length}
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
      <MeetingDetailsModal />
    </div>
  );
};
