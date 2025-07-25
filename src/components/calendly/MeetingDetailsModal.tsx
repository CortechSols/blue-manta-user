import React from "react";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Phone,
  ExternalLink,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCalendlyModals, useCalendlyActions } from "@/stores/calendlyStore";

interface MeetingDetailsModalProps {
  className?: string;
}

export const MeetingDetailsModal: React.FC<MeetingDetailsModalProps> = () => {
  const modals = useCalendlyModals();
  const actions = useCalendlyActions();

  const isOpen = modals.meetingDetails.isOpen;
  const meeting = modals.meetingDetails.meeting;

  const handleClose = () => {
    actions.closeMeetingDetailsModal();
  };

  if (!meeting) return null;

  const getStatusBadge = () => {
    switch (meeting.status) {
      case "active": {
        const meetingStartTime =
          meeting.start_time || (meeting as any).startTime; // eslint-disable-line @typescript-eslint/no-explicit-any
        const isPastMeeting =
          meetingStartTime && new Date(meetingStartTime) < new Date();
        return isPastMeeting ? (
          <Badge variant="secondary">Completed</Badge>
        ) : (
          <Badge className="bg-green-100 text-green-800">Scheduled</Badge>
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
  const meetingStartTime =
    meeting.start_time || (meeting as Record<string, any>).startTime; // eslint-disable-line @typescript-eslint/no-explicit-any
  const meetingEndTime =
    meeting.end_time || (meeting as Record<string, any>).endTime; // eslint-disable-line @typescript-eslint/no-explicit-any
  const startTime = meetingStartTime ? parseISO(meetingStartTime) : null;
  const endTime = meetingEndTime ? parseISO(meetingEndTime) : null;
  const duration =
    startTime && endTime
      ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
      : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">
                Meeting Details
              </span>
            </div>
            {getStatusBadge()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meeting Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {meeting.name}
            </h2>
          </div>

          {/* Meeting Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date & Time */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Date & Time
              </h3>
              {startTime && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{format(startTime, "EEEE, MMMM d, yyyy")}</span>
                </div>
              )}
              {startTime && endTime && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                    {duration && (
                      <span className="text-gray-400 ml-2">
                        ({duration} min)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Location
              </h3>
              {meeting.location ? (
                <div className="flex items-center gap-2 text-gray-600">
                  {getLocationIcon()}
                  <span>
                    {meeting.location.join_url
                      ? "Video Call"
                      : meeting.location.location || meeting.location.type}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>No location specified</span>
                </div>
              )}

              {meeting.location?.join_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    window.open(meeting.location?.join_url, "_blank")
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Join Meeting
                </Button>
              )}
            </div>
          </div>

          {/* Attendees */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Attendees
            </h3>

            {meeting.invitees && meeting.invitees.length > 0 ? (
              <div className="space-y-3">
                {meeting.invitees.map((invitee, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {invitee.name}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {invitee.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {invitee.status || "Invited"}
                      </Badge>

                      {invitee.reschedule_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(invitee.reschedule_url, "_blank")
                          }
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                No attendees information available
              </div>
            )}

            {meeting.invitees_counter && (
              <div className="text-sm text-gray-600 mt-2">
                {meeting.invitees_counter.active} of{" "}
                {meeting.invitees_counter.limit} spots filled
              </div>
            )}
          </div>

          {/* Event Type & URI */}
          {(meeting.event_type || meeting.uri) && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Additional Information
              </h3>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {meeting.event_type && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Event Type:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {meeting.event_type}
                    </span>
                  </div>
                )}

                {meeting.uri && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Meeting ID:</span>
                    <span className="text-sm font-mono text-gray-900">
                      {meeting.uri.split("/").pop()}
                    </span>
                  </div>
                )}

                {(meeting as any).created_at && ( // eslint-disable-line @typescript-eslint/no-explicit-any
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm text-gray-900">
                      {format(
                        parseISO((meeting as any).created_at), // eslint-disable-line @typescript-eslint/no-explicit-any
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {meeting.status === "active" &&
              startTime &&
              startTime > new Date() &&
              primaryInvitee?.reschedule_url && (
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(primaryInvitee.reschedule_url, "_blank")
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Reschedule
                </Button>
              )}

            {meeting.status === "active" &&
              startTime &&
              startTime > new Date() && (
                <Button
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => {
                    actions.closeMeetingDetailsModal();
                    actions.openCancelMeetingModal(meeting.uri);
                  }}
                >
                  Cancel Meeting
                </Button>
              )}
          </div>

          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
