import React, { useState } from "react";
import {
  Clock,
  Users,
  Copy,
  QrCode,
  BarChart3,
  Settings,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EventType } from "@/types/calendly";
import {
  useCalendlyEventTypes,
  useCalendlyActions,
  useCalendlyLoading,
} from "@/stores/calendlyStore";
import { BookingModal } from "@/components/calendly";

interface EventTypesListProps {
  className?: string;
}

const EventTypeCard: React.FC<{ eventType: EventType }> = ({ eventType }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(eventType.scheduling_url);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  const generateQRCode = () => {
    window.open(
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        eventType.scheduling_url
      )}`,
      "_blank"
    );
  };

  const viewAnalytics = () => {
    // Redirect to Calendly analytics since API doesn't provide detailed analytics
    window.open("https://calendly.com/analytics", "_blank");
  };

  return (
    <Card
      className={`transition-all hover:shadow-md ${
        !eventType.active ? "opacity-60" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg truncate">
                {eventType.name}
              </CardTitle>
              <Badge
                variant={eventType.active ? "success" : "secondary"}
                className="shrink-0"
              >
                {eventType.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            {eventType.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {eventType.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={viewAnalytics}>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics (Calendly)
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
              <DropdownMenuItem
                onClick={() => window.open(eventType.scheduling_url, "_blank")}
              >
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
            <span className="text-sm font-medium text-gray-700">
              Booking URL
            </span>
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
            <div
              className={`w-2 h-2 rounded-full ${
                eventType.active ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            <span className="text-sm text-gray-600">
              {eventType.active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowBookingModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Book Now
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(eventType.scheduling_url, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open Page
            </Button>

            <Button variant="outline" size="sm" onClick={viewAnalytics}>
              <BarChart3 className="w-4 h-4 mr-1" />
              Analytics
            </Button>
          </div>

          {/* Booking Modal */}
          <BookingModal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            eventTypeUrl={eventType.scheduling_url}
            eventTypeName={eventType.name}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export const EventTypesList: React.FC<EventTypesListProps> = ({
  className = "",
}) => {
  const eventTypes = useCalendlyEventTypes();
  const actions = useCalendlyActions();
  const loading = useCalendlyLoading();

  const handleRefresh = () => {
    actions.loadEventTypes();
  };

  const activeEventTypes = eventTypes.filter((et) => et.active);
  const inactiveEventTypes = eventTypes.filter((et) => !et.active);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Event Types</h2>
          <p className="text-gray-600">
            {activeEventTypes.length} active, {inactiveEventTypes.length}{" "}
            inactive
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading.eventTypes}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${
                loading.eventTypes ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open("https://calendly.com/event_types", "_blank")
            }
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Manage in Calendly
          </Button>
        </div>
      </div>

      {/* API Limitation Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <p className="font-medium mb-1">Event Type Management</p>
          <p className="text-sm">
            Event types can only be created and modified in your Calendly
            dashboard. Use the "Manage in Calendly" button above to create new
            event types or modify existing ones.
          </p>
        </AlertDescription>
      </Alert>

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
                <p className="text-2xl font-semibold text-gray-900">
                  {activeEventTypes.length}
                </p>
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
                <p className="text-2xl font-semibold text-gray-900">
                  {inactiveEventTypes.length}
                </p>
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
                    ? Math.round(
                        eventTypes.reduce((sum, et) => sum + et.duration, 0) /
                          eventTypes.length
                      )
                    : 0}{" "}
                  min
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No event types found
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first event type in your Calendly dashboard
            </p>
            <Button
              onClick={() =>
                window.open("https://calendly.com/event_types", "_blank")
              }
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Create in Calendly
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
