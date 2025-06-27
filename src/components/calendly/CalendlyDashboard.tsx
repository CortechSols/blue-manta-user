import React, { useEffect, useState, useCallback } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarView } from './CalendarView';
import { MeetingsList } from './MeetingsList';
import { EventTypesList } from './EventTypesList';
import { 
  useCalendlyDashboard, 
  useCalendlyActions, 
  useCalendlyConnection
} from '@/stores/calendlyStore';
import { format, addDays, subDays } from 'date-fns';
import { shouldUseDemoData } from '@/lib/demo-data';

interface CalendlyDashboardProps {
  className?: string;
}

const ConnectionStatus: React.FC = () => {
  const connectionStatus = useCalendlyConnection();
  const actions = useCalendlyActions();

  if (!connectionStatus) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Loading connection status...
        </AlertDescription>
      </Alert>
    );
  }

  if (!connectionStatus.is_connected) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <div className="flex items-center justify-between">
            <span>Calendly is not connected. Connect your account to manage your calendar.</span>
            <Button 
              size="sm" 
              onClick={() => window.location.href = '/calendar'}
              className="ml-4"
            >
              Connect Calendly
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-green-200 bg-green-50">
      <Calendar className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <div className="flex items-center justify-between">
          <span>Connected as: <strong>{connectionStatus.user_name}</strong></span>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(connectionStatus.scheduling_url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View Public Page
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => actions?.refreshAll?.()}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

const DashboardStats: React.FC = () => {
  const { events, meetings, eventTypes } = useCalendlyDashboard();
  
  const upcomingMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.start_time);
    return meeting.status === 'active' && meetingDate > new Date();
  });

  const todaysMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.start_time);
    const today = new Date();
    return meeting.status === 'active' && 
           meetingDate.toDateString() === today.toDateString();
  });

  const activeEventTypes = eventTypes.filter(et => et.active);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Meetings</p>
              <p className="text-2xl font-semibold text-gray-900">{todaysMeetings.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming Meetings</p>
              <p className="text-2xl font-semibold text-gray-900">{upcomingMeetings.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Event Types</p>
              <p className="text-2xl font-semibold text-gray-900">{activeEventTypes.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-semibold text-gray-900">{events.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const QuickActions: React.FC = () => {
  const { eventTypes } = useCalendlyDashboard();
  const actions = useCalendlyActions();
  const connectionStatus = useCalendlyConnection();

  const handleCreateEventType = () => {
    window.open('https://calendly.com/event_types/user/me', '_blank');
  };

  const handleViewAnalytics = () => {
    window.open('https://calendly.com/analytics', '_blank');
  };

  const activeEventTypes = eventTypes.filter(et => et.active);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button 
            onClick={handleCreateEventType}
            className="w-full"
            disabled={!connectionStatus?.is_connected}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event Type
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleViewAnalytics}
            className="w-full"
            disabled={!connectionStatus?.is_connected}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => actions?.refreshAll?.()}
            className="w-full"
            disabled={!connectionStatus?.is_connected}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.open(connectionStatus?.scheduling_url, '_blank')}
            className="w-full"
            disabled={!connectionStatus?.is_connected}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Public Page
          </Button>
        </div>

        {/* Quick Event Type Links */}
        {activeEventTypes.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Book Links</h4>
            <div className="space-y-2">
              {activeEventTypes.slice(0, 3).map((eventType) => (
                <div key={eventType.uri} className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1">{eventType.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(eventType.scheduling_url, '_blank')}
                    className="h-6 px-2 text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {activeEventTypes.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{activeEventTypes.length - 3} more event types
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const UpcomingMeetingsPreview: React.FC = () => {
  const { meetings } = useCalendlyDashboard();
  const actions = useCalendlyActions();

  const upcomingMeetings = meetings
    .filter(meeting => {
      const meetingDate = new Date(meeting.start_time);
      return meeting.status === 'active' && meetingDate > new Date();
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upcoming Meetings
          </span>
          <Badge variant="secondary">{upcomingMeetings.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingMeetings.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No upcoming meetings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingMeetings.map((meeting) => {
              const startTime = new Date(meeting.start_time);
              const primaryInvitee = meeting.invitees?.[0];
              
              return (
                <div 
                  key={meeting.uri}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => actions?.openMeetingDetailsModal?.(meeting)}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{meeting.name}</h4>
                    <p className="text-sm text-gray-600">
                      {format(startTime, 'MMM d, h:mm a')}
                    </p>
                    {primaryInvitee && (
                      <p className="text-xs text-gray-500 truncate">{primaryInvitee.name}</p>
                    )}
                  </div>
                  <div className="ml-2">
                    <Badge variant="outline" className="text-xs">
                      {Math.round((new Date(meeting.end_time).getTime() - startTime.getTime()) / (1000 * 60))} min
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const CalendlyDashboard: React.FC<CalendlyDashboardProps> = ({ className = '' }) => {
  const { connectionStatus, loading, error } = useCalendlyDashboard();
  const actions = useCalendlyActions();
  const [activeTab, setActiveTab] = useState('overview');

  // Only load data when explicitly requested (not on every mount)
  // Demo data is already loaded, so we don't need to auto-refresh
  // useEffect(() => {
  //   // Only load if actually connected and not using demo data
  //   if (connectionStatus?.is_connected && !shouldUseDemoData()) {
  //     actions.refreshAll().catch(console.error);
  //   }
  // }, [connectionStatus?.is_connected]);

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
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <ConnectionStatus />

      {/* Main Content */}
      {connectionStatus?.is_connected && (
        <>
          {/* Dashboard Stats */}
          <DashboardStats />

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
              <TabsTrigger value="event-types">Event Types</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UpcomingMeetingsPreview />
                <QuickActions />
              </div>
              
              {/* Mini Calendar View */}
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarView className="h-96" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              <CalendarView />
            </TabsContent>

            <TabsContent value="meetings">
              <MeetingsList />
            </TabsContent>

            <TabsContent value="event-types">
              <EventTypesList />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Loading State */}
      {(loading.connection || loading.events || loading.meetings || loading.eventTypes) && (
        <div className="fixed bottom-4 right-4">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}; 