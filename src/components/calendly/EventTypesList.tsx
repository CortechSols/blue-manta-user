import React, { useState } from 'react';
import {
  Clock,
  Users,
  Link,
  Copy,
  QrCode,
  BarChart3,
  Settings,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  Plus,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EventType } from '@/types/calendly';
import { 
  useCalendlyEventTypes, 
  useCalendlyActions, 
  useCalendlyLoading 
} from '@/stores/calendlyStore';

interface EventTypesListProps {
  className?: string;
}

const EventTypeCard: React.FC<{ eventType: EventType }> = ({ eventType }) => {
  const actions = useCalendlyActions();
  const [isToggling, setIsToggling] = useState(false);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(eventType.scheduling_url);
      // You could add a toast notification here
      console.log('URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleToggleActive = async () => {
    setIsToggling(true);
    try {
      await actions.updateEventType(eventType.uri, { active: !eventType.active });
    } catch (error) {
      console.error('Failed to toggle event type:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const generateQRCode = () => {
    // This would typically generate a QR code for the scheduling URL
    console.log('Generate QR code for:', eventType.scheduling_url);
  };

  const viewAnalytics = () => {
    // This would open analytics for the event type
    console.log('View analytics for:', eventType.name);
  };

  return (
    <Card className={`transition-all hover:shadow-md ${!eventType.active ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg truncate">{eventType.name}</CardTitle>
              <Badge 
                variant={eventType.active ? 'success' : 'secondary'}
                className="shrink-0"
              >
                {eventType.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {eventType.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{eventType.description}</p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => actions.openEventTypeDetailsModal(eventType)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={viewAnalytics}>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyUrl}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Booking URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={generateQRCode}>
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR Code
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.open(eventType.scheduling_url, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Booking Page
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Event Type Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{formatDuration(eventType.duration)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="capitalize">{eventType.kind}</span>
          </div>
        </div>

        {/* Color Indicator */}
        {eventType.color && (
          <div className="flex items-center gap-2 text-sm">
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: eventType.color }}
            />
            <span>Event Color</span>
          </div>
        )}

        {/* Booking URL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Booking URL</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyUrl}
              className="h-6 px-2 text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
          </div>
          <div className="p-2 bg-gray-50 rounded text-xs font-mono break-all">
            {eventType.scheduling_url}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Switch
              checked={eventType.active}
              onCheckedChange={handleToggleActive}
              disabled={isToggling}
              size="sm"
            />
            <span className="text-sm text-gray-600">
              {eventType.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(eventType.scheduling_url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Book
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={viewAnalytics}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Stats
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const EventTypesList: React.FC<EventTypesListProps> = ({ className = '' }) => {
  const eventTypes = useCalendlyEventTypes();
  const actions = useCalendlyActions();
  const loading = useCalendlyLoading();

  const handleRefresh = () => {
    actions.loadEventTypes();
  };

  const handleCreateEventType = () => {
    // This would typically open a modal to create a new event type
    // For now, redirect to Calendly's event type creation page
    window.open('https://calendly.com/event_types/user/me', '_blank');
  };

  const activeEventTypes = eventTypes.filter(et => et.active);
  const inactiveEventTypes = eventTypes.filter(et => !et.active);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Event Types</h2>
          <p className="text-gray-600">
            {activeEventTypes.length} active, {inactiveEventTypes.length} inactive
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading.eventTypes}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading.eventTypes ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            onClick={handleCreateEventType}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event Type
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
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
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Inactive Event Types</p>
                <p className="text-2xl font-semibold text-gray-900">{inactiveEventTypes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Duration</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {eventTypes.length > 0 
                    ? Math.round(eventTypes.reduce((sum, et) => sum + et.duration, 0) / eventTypes.length)
                    : 0
                  } min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Types List */}
      {loading.eventTypes ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading event types...</span>
        </div>
      ) : eventTypes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No event types found</h3>
            <p className="text-gray-600 mb-4">
              Create your first event type to start accepting bookings
            </p>
            <Button onClick={handleCreateEventType}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event Type
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Event Types */}
          {activeEventTypes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                Active Event Types ({activeEventTypes.length})
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activeEventTypes.map((eventType) => (
                  <EventTypeCard key={eventType.uri} eventType={eventType} />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Event Types */}
          {inactiveEventTypes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <EyeOff className="w-5 h-5 text-gray-600" />
                Inactive Event Types ({inactiveEventTypes.length})
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {inactiveEventTypes.map((eventType) => (
                  <EventTypeCard key={eventType.uri} eventType={eventType} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 