import React from 'react';
import { X, ExternalLink, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTypeUrl: string;
  eventTypeName: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  eventTypeUrl,
  eventTypeName,
}) => {
  if (!isOpen) return null;

  const handleBookNow = () => {
    window.open(eventTypeUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Book Meeting
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <p className="font-medium mb-1">Direct Booking Not Available</p>
              <p className="text-sm">
                The Calendly API v2 doesn't support direct booking. You'll be redirected to the 
                Calendly booking page to complete your appointment scheduling.
              </p>
            </AlertDescription>
          </Alert>

          <div className="text-center py-4">
            <Calendar className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {eventTypeName}
            </h3>
            <p className="text-gray-600 mb-6">
              Click below to open the Calendly booking page in a new tab.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={handleBookNow}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Calendly Booking Page
              </Button>
              
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Booking URL */}
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">Booking URL:</p>
            <div className="p-2 bg-gray-50 rounded text-xs font-mono break-all text-gray-700">
              {eventTypeUrl}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 