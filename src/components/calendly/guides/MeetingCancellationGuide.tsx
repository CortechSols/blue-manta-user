import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Info, 
  Users,
  Clock,
  AlertTriangle
} from 'lucide-react';

export const MeetingCancellationGuide: React.FC = () => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Info className="w-5 h-5" />
          How to Cancel Calendly Meetings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Single Meeting Cancellation */}
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Cancel Individual Meeting
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>Find the meeting you want to cancel in the list below</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>Click the three dots (⋯) menu on the right side of the meeting</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>Select "Cancel Meeting" from the dropdown menu</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <span>Provide a reason and confirm cancellation</span>
              </div>
            </div>
          </div>

          {/* Bulk Meeting Cancellation */}
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Cancel Multiple Meetings
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>Check the checkbox next to each meeting you want to cancel</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>Once meetings are selected, a blue banner will appear</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>Click "Cancel Selected" in the blue banner</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <span>Provide a reason and confirm bulk cancellation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="space-y-2">
              <p className="font-medium">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>You can only cancel meetings where you are the host/organizer</li>
                <li>Meeting cancellations cannot be undone - please double-check before confirming</li>
                <li>All participants will be automatically notified of the cancellation</li>
                <li>You must provide a reason for cancellation (it will be shared with participants)</li>
                <li>Only upcoming meetings can be cancelled - past meetings cannot be modified</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Quick Tips */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Quick Tips
          </h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Use quick reason buttons for faster cancellation</li>
            <li>• Filter meetings by "Upcoming" to see only cancellable meetings</li>
            <li>• Use search to quickly find specific meetings</li>
            <li>• Consider rescheduling instead of canceling when possible</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}; 