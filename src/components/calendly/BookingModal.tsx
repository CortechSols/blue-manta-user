import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendlyInlineWidget } from './CalendlyInlineWidget';
import { useAuthUser } from '@/stores/authStore';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTypeUrl: string;
  eventTypeName?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  eventTypeUrl,
  eventTypeName,
}) => {
  const user = useAuthUser();

  const handleEventScheduled = (event: any) => {
    console.log('Event scheduled:', event);
    // You can add notifications here
    alert('Meeting scheduled successfully!');
    onClose();
  };

  const handleDateAndTimeSelected = (event: any) => {
    console.log('Date and time selected:', event);
  };

  const handleEventTypeViewed = (event: any) => {
    console.log('Event type viewed:', event);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {eventTypeName ? `Book: ${eventTypeName}` : 'Schedule Meeting'}
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

        {/* Calendly Widget */}
        <div className="p-4">
          <CalendlyInlineWidget
            url={eventTypeUrl}
            height={600}
            prefill={{
              name: user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}` 
                : undefined,
              email: user?.contact_email,
              firstName: user?.first_name,
              lastName: user?.last_name,
            }}
            utm={{
              utmSource: 'blue-manta-dashboard',
              utmMedium: 'embedded-widget',
              utmCampaign: 'calendar-booking',
            }}
            onEventScheduled={handleEventScheduled}
            onDateAndTimeSelected={handleDateAndTimeSelected}
            onEventTypeViewed={handleEventTypeViewed}
          />
        </div>
      </div>
    </div>
  );
}; 