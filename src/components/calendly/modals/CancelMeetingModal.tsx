import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, AlertCircle, X, CheckCircle } from "lucide-react";
import {
  useCalendlyActions,
  useCalendlyModals,
  useCalendlyMeetings,
} from "@/stores/calendlyStore";
import { format, parseISO } from "date-fns";

interface CancelMeetingModalProps {
  className?: string;
}

export const CancelMeetingModal: React.FC<CancelMeetingModalProps> = () => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const actions = useCalendlyActions();
  const modals = useCalendlyModals();
  const meetings = useCalendlyMeetings();

  const isOpen = modals.cancelMeeting.isOpen;
  const meetingUri = modals.cancelMeeting.meetingUri;

  // Find the meeting details
  const meeting = meetings.find((m) => m.uri === meetingUri);

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setError(null);
      setSuccess(false);
      actions.closeCancelMeetingModal();
    }
  };

  const handleCancel = async () => {
    if (!meetingUri || !reason.trim()) {
      setError("Please provide a reason for cancellation");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await actions.cancelMeeting(meetingUri, reason.trim());
      setSuccess(true);

      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to cancel meeting:", error);
      setError(
        error instanceof Error ? error.message : "Failed to cancel meeting"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickReason = (quickReason: string) => {
    setReason(quickReason);
  };

  const quickReasons = [
    "Unable to attend",
    "Schedule conflict",
    "Meeting no longer needed",
    "Emergency came up",
    "Technical difficulties",
    "Need to reschedule",
  ];

  const getMeetingInfo = () => {
    if (!meeting) return null;

    const startTime = meeting.start_time || (meeting as any).startTime;
    const endTime = meeting.end_time || (meeting as any).endTime;
    const primaryInvitee = meeting.invitees?.[0];

    return {
      name: meeting.name,
      startTime: startTime ? parseISO(startTime) : null,
      endTime: endTime ? parseISO(endTime) : null,
      inviteeName: primaryInvitee?.name,
      inviteeEmail: primaryInvitee?.email,
    };
  };

  const meetingInfo = getMeetingInfo();

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Meeting Cancelled Successfully
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              The meeting has been cancelled and all participants have been
              notified.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              onClick={handleClose}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Calendar className="w-5 h-5 text-red-500" />
            Cancel Meeting
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Are you sure you want to cancel this meeting? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        {/* Meeting Details */}
        {meetingInfo && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="font-medium text-gray-900">{meetingInfo.name}</h3>
            {meetingInfo.startTime && (
              <p className="text-sm text-gray-600">
                📅 {format(meetingInfo.startTime, "EEEE, MMMM d, yyyy")}
              </p>
            )}
            {meetingInfo.startTime && meetingInfo.endTime && (
              <p className="text-sm text-gray-600">
                🕐 {format(meetingInfo.startTime, "h:mm a")} -{" "}
                {format(meetingInfo.endTime, "h:mm a")}
              </p>
            )}
            {meetingInfo.inviteeName && (
              <p className="text-sm text-gray-600">
                👤 {meetingInfo.inviteeName}
                {meetingInfo.inviteeEmail && (
                  <span className="text-gray-500">
                    {" "}
                    ({meetingInfo.inviteeEmail})
                  </span>
                )}
              </p>
            )}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Quick Reason Buttons */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Quick Reasons
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {quickReasons.map((quickReason) => (
                <Button
                  key={quickReason}
                  variant="outline"
                  size="sm"
                  className={`justify-start text-left h-auto p-2 ${
                    reason === quickReason
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleQuickReason(quickReason)}
                >
                  {quickReason}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          <div className="space-y-2">
            <Label
              htmlFor="reason"
              className="text-sm font-medium text-gray-700"
            >
              Cancellation Reason *
            </Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for cancelling this meeting..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              This reason will be shared with all meeting participants.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Keep Meeting
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isSubmitting || !reason.trim()}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel Meeting
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
