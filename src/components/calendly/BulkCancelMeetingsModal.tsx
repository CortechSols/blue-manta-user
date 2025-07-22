import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, X, CheckCircle, Users } from 'lucide-react';
import { useCalendlyActions, useCalendlySelectedMeetings, useCalendlyMeetings } from '@/stores/calendlyStore';
import { format, parseISO } from 'date-fns';

interface BulkCancelMeetingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const BulkCancelMeetingsModal: React.FC<BulkCancelMeetingsModalProps> = ({ 
  isOpen,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [results, setResults] = useState<Array<{ uri: string; success: boolean; error?: string }> | null>(null);

  const actions = useCalendlyActions();
  const selectedMeetingUris = useCalendlySelectedMeetings();
  const meetings = useCalendlyMeetings();

  // Find the selected meetings
  const selectedMeetings = meetings.filter(m => selectedMeetingUris.includes(m.uri));

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setError(null);
      setSuccess(false);
      setResults(null);
      onClose();
    }
  };

  const handleBulkCancel = async () => {
    if (!selectedMeetingUris.length || !reason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const cancelResults = await actions.batchCancelMeetings(selectedMeetingUris, reason.trim());
      setResults(cancelResults);
      setSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error) {
      console.error('Failed to bulk cancel meetings:', error);
      setError(error instanceof Error ? error.message : 'Failed to cancel meetings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickReason = (quickReason: string) => {
    setReason(quickReason);
  };

  const quickReasons = [
    'Cancelled event',
    'Schedule conflicts',
    'Technical difficulties',
    'Emergency situation',
    'Venue unavailable',
    'Organizer unavailable'
  ];

  if (success && results) {
    const successfulCancellations = results.filter(r => r.success).length;
    const failedCancellations = results.filter(r => !r.success).length;

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Bulk Cancellation Complete
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {successfulCancellations > 0 && (
                <div className="mb-2">
                  ✅ {successfulCancellations} meeting{successfulCancellations !== 1 ? 's' : ''} cancelled successfully
                </div>
              )}
              {failedCancellations > 0 && (
                <div className="text-red-600">
                  ❌ {failedCancellations} meeting{failedCancellations !== 1 ? 's' : ''} failed to cancel
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {failedCancellations > 0 && (
            <div className="max-h-32 overflow-y-auto">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Failed Cancellations:
              </Label>
              {results.filter(r => !r.success).map((result, idx) => {
                const meeting = meetings.find(m => m.uri === result.uri);
                return (
                  <div key={idx} className="text-sm bg-red-50 p-2 rounded mb-1">
                    {meeting?.name || 'Unknown Meeting'}: {result.error}
                  </div>
                );
              })}
            </div>
          )}
          
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
            <Users className="w-5 h-5 text-red-500" />
            Cancel {selectedMeetings.length} Meeting{selectedMeetings.length !== 1 ? 's' : ''}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Are you sure you want to cancel {selectedMeetings.length} selected meeting{selectedMeetings.length !== 1 ? 's' : ''}? 
            This action cannot be undone and all participants will be notified.
          </DialogDescription>
        </DialogHeader>

        {/* Selected Meetings List */}
        <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Selected Meetings ({selectedMeetings.length}):
          </Label>
          <div className="space-y-2">
            {selectedMeetings.map((meeting) => {
              const startTime = meeting.start_time || meeting.startTime;
              return (
                <div key={meeting.uri} className="text-sm bg-white p-2 rounded border">
                  <div className="font-medium text-gray-900">{meeting.name}</div>
                  {startTime && (
                    <div className="text-gray-600">
                      {format(parseISO(startTime), 'MMM d, yyyy • h:mm a')}
                    </div>
                  )}
                  {meeting.invitees?.[0] && (
                    <div className="text-gray-500">
                      with {meeting.invitees[0].name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

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
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'hover:bg-gray-50'
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
            <Label htmlFor="bulk-reason" className="text-sm font-medium text-gray-700">
              Cancellation Reason *
            </Label>
            <Textarea
              id="bulk-reason"
              placeholder="Please provide a reason for cancelling these meetings..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              This reason will be shared with all participants of the selected meetings.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Keep Meetings
          </Button>
          <Button
            variant="destructive"
            onClick={handleBulkCancel}
            disabled={isSubmitting || !reason.trim() || selectedMeetings.length === 0}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel {selectedMeetings.length} Meeting{selectedMeetings.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 