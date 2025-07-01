import { useEffect, useRef } from 'react';

interface CalendlyInlineWidgetProps {
  url: string;
  height?: number;
  prefill?: {
    name?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    customAnswers?: Record<string, string>;
  };
  utm?: {
    utmCampaign?: string;
    utmSource?: string;
    utmMedium?: string;
    utmContent?: string;
    utmTerm?: string;
  };
  onEventScheduled?: (event: any) => void;
  onDateAndTimeSelected?: (event: any) => void;
  onEventTypeViewed?: (event: any) => void;
}

declare global {
  interface Window {
    Calendly: {
      initInlineWidget: (options: any) => void;
      closePopupWidget: () => void;
      showPopupWidget: (url: string, options?: any) => void;
    };
  }
}

export const CalendlyInlineWidget: React.FC<CalendlyInlineWidgetProps> = ({
  url,
  height = 630,
  prefill,
  utm,
  onEventScheduled,
  onDateAndTimeSelected,
  onEventTypeViewed,
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Load Calendly script if not already loaded
    if (!window.Calendly && !scriptRef.current) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => {
        initializeWidget();
      };
      document.head.appendChild(script);
      scriptRef.current = script;
    } else if (window.Calendly) {
      initializeWidget();
    }

    // Set up event listeners
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://calendly.com') return;

      if (event.data.event) {
        switch (event.data.event) {
          case 'calendly.event_scheduled':
            onEventScheduled?.(event.data.payload);
            break;
          case 'calendly.date_and_time_selected':
            onDateAndTimeSelected?.(event.data.payload);
            break;
          case 'calendly.event_type_viewed':
            onEventTypeViewed?.(event.data.payload);
            break;
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      // Clean up script when component unmounts
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, [url, onEventScheduled, onDateAndTimeSelected, onEventTypeViewed]);

  const initializeWidget = () => {
    if (!widgetRef.current || !window.Calendly) return;

    // Clear any existing content
    widgetRef.current.innerHTML = '';

    // Build the data URL with parameters
    const urlParams = new URLSearchParams();
    
    // Add prefill data
    if (prefill) {
      if (prefill.name) urlParams.append('name', prefill.name);
      if (prefill.email) urlParams.append('email', prefill.email);
      if (prefill.firstName) urlParams.append('first_name', prefill.firstName);
      if (prefill.lastName) urlParams.append('last_name', prefill.lastName);
      
      // Add custom answers
      if (prefill.customAnswers) {
        Object.entries(prefill.customAnswers).forEach(([key, value]) => {
          urlParams.append(`a1`, value); // Calendly uses a1, a2, etc. for custom answers
        });
      }
    }

    // Add UTM parameters
    if (utm) {
      if (utm.utmCampaign) urlParams.append('utm_campaign', utm.utmCampaign);
      if (utm.utmSource) urlParams.append('utm_source', utm.utmSource);
      if (utm.utmMedium) urlParams.append('utm_medium', utm.utmMedium);
      if (utm.utmContent) urlParams.append('utm_content', utm.utmContent);
      if (utm.utmTerm) urlParams.append('utm_term', utm.utmTerm);
    }

    const fullUrl = urlParams.toString() ? `${url}?${urlParams.toString()}` : url;

    // Initialize the widget
    window.Calendly.initInlineWidget({
      url: fullUrl,
      parentElement: widgetRef.current,
      prefill: prefill || {},
      utm: utm || {},
    });
  };

  return (
    <div className="calendly-widget-container">
      <div 
        ref={widgetRef}
        className="calendly-inline-widget"
        style={{ 
          minWidth: '320px', 
          height: `${height}px`,
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
    </div>
  );
}; 