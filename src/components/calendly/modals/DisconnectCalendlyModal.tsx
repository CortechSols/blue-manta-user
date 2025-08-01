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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Unlink } from 'lucide-react';

interface DisconnectCalendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DisconnectCalendlyModal: React.FC<DisconnectCalendlyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsDisconnecting(true);
    setError(null);

    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Failed to disconnect Calendly:', error);
      setError(error instanceof Error ? error.message : 'Failed to disconnect Calendly');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleClose = () => {
    if (!isDisconnecting) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Unlink className="w-6 h-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Disconnect Calendly
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Are you sure you want to disconnect your Calendly account? This will remove the connection and you'll need to reconnect to access Calendly features.
          </DialogDescription>
        </DialogHeader>

        {/* Warning Alert */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="space-y-2">
              <p className="font-medium">What happens when you disconnect:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All Calendly data will be removed from this dashboard</li>
                <li>You won't be able to view meetings or event types</li>
                <li>You can reconnect anytime by going to your profile settings</li>
                <li>Your Calendly account and data remain unchanged</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDisconnecting}
            className="flex-1"
          >
            Keep Connected
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDisconnecting}
            className="flex-1 min-w-[140px]"
          >
            {isDisconnecting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Disconnecting...
              </>
            ) : (
              <>
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 