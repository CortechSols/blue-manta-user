import React, { useState, useMemo } from "react";
import { format, parseISO, isPast, isFuture } from "date-fns";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Phone,
  MoreHorizontal,
  X,
  RefreshCw,
  Info,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CalendlyMeeting, MeetingFilters } from "@/types/calendly";
import {
  useCalendlyMeetings,
  useCalendlyActions,
  useCalendlyMeetingFilters,
  useCalendlySelectedMeetings,
  useCalendlyLoading,
} from "@/stores/calendlyStore";
import { BulkCancelMeetingsModal } from "./BulkCancelMeetingsModal";
import { MeetingCancellationGuide } from "./MeetingCancellationGuide";

interface MeetingsListProps {
  className?: string;
}

const MeetingCard: React.FC<{
  meeting: CalendlyMeeting;
  isSelected: boolean;
  onToggleSelect: () => void;
}> = ({ meeting, isSelected, onToggleSelect }) => {
  const actions = useCalendlyActions();

  const getStatusBadge = () => {
    switch (meeting.status) {
      case "active": {
        const meetingStartTime =
          meeting.start_time || (meeting as any).startTime;
        return meetingStartTime && isPast(parseISO(meetingStartTime)) ? (
          <Badge variant="secondary">Completed</Badge>
        ) : (
          <Badge variant="success">Scheduled</Badge>
        );
      }
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{meeting.status}</Badge>;
    }
  };

  const getLocationIcon = () => {
    if (!meeting.location) return <Calendar className="w-4 h-4" />;

    switch (meeting.location.type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
      case "physical":
        return <MapPin className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const primaryInvitee = meeting.invitees?.[0];
  const meetingStartTime = meeting.start_time || (meeting as any).startTime;
  const meetingEndTime = meeting.end_time || (meeting as any).endTime;
  const startTime = meetingStartTime ? parseISO(meetingStartTime) : new Date();
  const endTime = meetingEndTime ? parseISO(meetingEndTime) : new Date();
  const duration = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  );

  return (
    <Card
      className={`transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelect}
              className="mt-1"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {meeting.name}
                </h3>
                {getStatusBadge()}
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(startTime, "MMM d, yyyy • h:mm a")} -{" "}
                    {format(endTime, "h:mm a")}
                  </span>
                  <span className="text-gray-400">({duration} min)</span>
                </div>

                {primaryInvitee && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{primaryInvitee.name}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-blue-600">
                      {primaryInvitee.email}
                    </span>
                  </div>
                )}

                {meeting.location && (
                  <div className="flex items-center gap-2">
                    {getLocationIcon()}
                    <span>
                      {meeting.location.join_url
                        ? "Video Call"
                        : meeting.location.location || meeting.location.type}
                    </span>
                  </div>
                )}

                {meeting.invitees_counter && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>
                      {meeting.invitees_counter.active} of{" "}
                      {meeting.invitees_counter.limit} attendees
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => actions.openMeetingDetailsModal(meeting)}
              >
                View Details
              </DropdownMenuItem>

              {meeting.status === "active" &&
                meetingStartTime &&
                isFuture(startTime) && (
                  <>
                    {/* Show reschedule URL if available */}
                    {primaryInvitee?.reschedule_url && (
                      <DropdownMenuItem
                        onClick={() =>
                          window.open(primaryInvitee.reschedule_url, "_blank")
                        }
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Reschedule (Calendly)
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        actions.openCancelMeetingModal(meeting.uri)
                      }
                      className="text-red-600"
                    >
                      Cancel Meeting
                    </DropdownMenuItem>
                  </>
                )}

              {meeting.location?.join_url && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(meeting.location?.join_url, "_blank")
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Join Meeting
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export const MeetingsList: React.FC<MeetingsListProps> = ({
  className = "",
}) => {
  const meetings = useCalendlyMeetings();
  const actions = useCalendlyActions();
  const meetingFilters = useCalendlyMeetingFilters();
  const selectedMeetings = useCalendlySelectedMeetings();
  const loading = useCalendlyLoading();

  const [searchQuery, setSearchQuery] = useState("");
  const [localFilters, setLocalFilters] =
    useState<MeetingFilters>(meetingFilters);
  const [isBulkCancelModalOpen, setIsBulkCancelModalOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Filter and search meetings
  const filteredMeetings = useMemo(() => {
    let filtered = [...meetings];

    // Apply status filter
    if (localFilters.status && localFilters.status !== "all") {
      if (localFilters.status === "upcoming") {
        filtered = filtered.filter((m) => {
          const startTime = m.start_time || (m as any).startTime;
          return (
            m.status === "active" && startTime && isFuture(parseISO(startTime))
          );
        });
      } else if (localFilters.status === "past") {
        filtered = filtered.filter((m) => {
          const startTime = m.start_time || (m as any).startTime;
          return (
            m.status === "active" && startTime && isPast(parseISO(startTime))
          );
        });
      } else {
        filtered = filtered.filter((m) => m.status === localFilters.status);
      }
    }

    // Apply event type filter
    if (localFilters.eventType) {
      filtered = filtered.filter(
        (m) => m.event_type === localFilters.eventType
      );
    }

    // Apply date range filter
    if (localFilters.dateRange) {
      const startDate = localFilters.dateRange.start
        ? parseISO(localFilters.dateRange.start)
        : null;
      const endDate = localFilters.dateRange.end
        ? parseISO(localFilters.dateRange.end)
        : null;

      filtered = filtered.filter((m) => {
        const startTime = m.start_time || (m as any).startTime;
        if (!startTime) return false;
        const meetingDate = parseISO(startTime);
        return (
          (!startDate || meetingDate >= startDate) &&
          (!endDate || meetingDate <= endDate)
        );
      });
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.invitees.some(
            (invitee) =>
              invitee.name.toLowerCase().includes(query) ||
              invitee.email.toLowerCase().includes(query)
          )
      );
    }

    // Sort by start time (upcoming first, then past)
    return filtered.sort((a, b) => {
      const aStartTime = a.start_time || (a as any).startTime;
      const bStartTime = b.start_time || (b as any).startTime;

      // Handle missing dates
      if (!aStartTime && !bStartTime) return 0;
      if (!aStartTime) return 1;
      if (!bStartTime) return -1;

      const aTime = parseISO(aStartTime);
      const bTime = parseISO(bStartTime);

      const aIsFuture = isFuture(aTime);
      const bIsFuture = isFuture(bTime);

      if (aIsFuture && !bIsFuture) return -1;
      if (!aIsFuture && bIsFuture) return 1;

      return aIsFuture
        ? aTime.getTime() - bTime.getTime()
        : bTime.getTime() - aTime.getTime();
    });
  }, [meetings, localFilters, searchQuery]);

  const handleApplyFilters = () => {
    actions.setMeetingFilters(localFilters);
    actions.loadMeetings(localFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters: MeetingFilters = { status: "all" };
    setLocalFilters(emptyFilters);
    setSearchQuery("");
    actions.setMeetingFilters(emptyFilters);
    actions.loadMeetings();
  };

  const handleSelectAll = () => {
    if (selectedMeetings.length === filteredMeetings.length) {
      actions.clearMeetingSelection();
    } else {
      actions.selectAllMeetings();
    }
  };

  const handleBulkCancel = () => {
    if (selectedMeetings.length > 0) {
      setIsBulkCancelModalOpen(true);
    }
  };

  const handleRefresh = () => {
    actions.loadMeetings(localFilters);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Meetings</h2>
          <p className="text-gray-600">
            {filteredMeetings.length} of {meetings.length} meetings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading.meetings}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${
                loading.meetings ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <Info className="w-4 h-4 mr-2" />
            {showGuide ? "Hide Guide" : "How to Cancel"}
          </Button>
        </div>
      </div>

      {/* API Limitation Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <p className="font-medium mb-1">Meeting Management</p>
          <p className="text-sm">
            Meetings can be cancelled through this interface. For rescheduling,
            use the "Reschedule (Calendly)" link which will open the Calendly
            reschedule page. Direct rescheduling via API is not supported.
          </p>
        </AlertDescription>
      </Alert>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search meetings, attendees, or emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={localFilters.status}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, status: value as any })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meetings</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleApplyFilters} size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Apply
            </Button>

            <Button onClick={handleClearFilters} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Cancellation Guide */}
      {showGuide && <MeetingCancellationGuide />}

      {/* Bulk Actions */}
      {selectedMeetings.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedMeetings.length === filteredMeetings.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedMeetings.length} meeting
                  {selectedMeetings.length !== 1 ? "s" : ""} selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkCancel}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Cancel Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actions.clearMeetingSelection()}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meetings List */}
      <div className="space-y-4">
        {loading.meetings ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading meetings...</span>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No meetings found
              </h3>
              <p className="text-gray-600">
                {searchQuery || localFilters.status !== "all"
                  ? "Try adjusting your search or filters"
                  : "Your meetings will appear here once they are scheduled"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.uri}
              meeting={meeting}
              isSelected={selectedMeetings.includes(meeting.uri)}
              onToggleSelect={() => actions.toggleMeetingSelection(meeting.uri)}
            />
          ))
        )}
      </div>

      {/* Bulk Cancel Modal */}
      <BulkCancelMeetingsModal
        isOpen={isBulkCancelModalOpen}
        onClose={() => setIsBulkCancelModalOpen(false)}
      />
    </div>
  );
};
