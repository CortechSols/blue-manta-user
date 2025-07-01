import { useState } from 'react';
import { X, Clock, Calendar, Type, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EventTypeFormData } from '@/types/calendly';

interface CreateEventTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventTypeData: EventTypeFormData) => Promise<void>;
  isLoading?: boolean;
}

const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

const DAYS_AVAILABLE_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
];

export const CreateEventTypeModal: React.FC<CreateEventTypeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<EventTypeFormData>({
    name: '',
    description: '',
    duration: 30,
    days_available: 30,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  // Static API information since backend endpoint might not be available yet
  const apiInfo = {
    limitations: [
      'Creates one-off event types with limited availability',
      'Advanced settings must be configured in Calendly dashboard'
    ],
    supported_features: [
      'Basic event type creation',
      'Custom duration and availability period'
    ],
    notes: [
      'This creates a temporary event type due to Calendly API limitations',
      'For permanent event types, use your Calendly dashboard'
    ]
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.duration < 15 || formData.duration > 120) {
      newErrors.duration = 'Duration must be between 15 and 120 minutes';
    }

    if (formData.days_available && (formData.days_available < 1 || formData.days_available > 365)) {
      newErrors.days_available = 'Days available must be between 1 and 365';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        name: '',
        description: '',
        duration: 30,
        days_available: 30,
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to create event type:', error);
    }
  };

  const updateFormData = (field: keyof EventTypeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Create New Event Type
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="p-2"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* API Information */}
        <div className="p-6 border-b">
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">One-off Event Types</p>
                <p className="text-sm">Due to Calendly API limitations, this creates a one-off event type with limited availability period.</p>
                {apiInfo.notes.map((note, index) => (
                  <p key={index} className="text-sm text-gray-600">• {note}</p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Type className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="e.g., Pool Consultation"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="e.g., 30-minute pool service consultation"
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Select value={formData.duration.toString()} onValueChange={(value) => updateFormData('duration', parseInt(value))}>
                    <SelectTrigger className={errors.duration ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.duration && <p className="text-sm text-red-600 mt-1">{errors.duration}</p>}
                </div>

                <div>
                  <Label htmlFor="days_available">Availability Period</Label>
                  <Select value={formData.days_available?.toString() || '30'} onValueChange={(value) => updateFormData('days_available', parseInt(value))}>
                    <SelectTrigger className={errors.days_available ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_AVAILABLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.days_available && <p className="text-sm text-red-600 mt-1">{errors.days_available}</p>}
                  <p className="text-xs text-gray-500 mt-1">How long this event type will be available for booking</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limitations Notice */}
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <p className="font-medium mb-1">Important Limitations</p>
              <ul className="text-sm space-y-1">
                <li>• This creates a one-off event type (temporary availability)</li>
                <li>• Advanced settings (location, buffer times, etc.) must be configured in Calendly</li>
                <li>• For permanent event types, create them directly in your Calendly account</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Event Type
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 