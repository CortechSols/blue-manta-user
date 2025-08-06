// components/CalendlyWidgetWrapper.tsx
import { useEffect, useState, useRef } from "react";

export const CalendlyWidgetWrapper = ({ url }: { url: string }) => {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const widgetInitializedRef = useRef(false);
  const widgetDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!url || widgetInitializedRef.current) return;

    const initializeWidget = () => {
      try {
        if (!window.Calendly || !widgetContainerRef.current) {
          setTimeout(initializeWidget, 100);
          return;
        }

        // Clear previous content safely
        if (widgetDivRef.current && widgetDivRef.current.parentNode) {
          widgetContainerRef.current.removeChild(widgetDivRef.current);
        }

        // Create a fresh div for Calendly to mount into
        widgetDivRef.current = document.createElement("div");
        widgetDivRef.current.className = "calendly-inline-widget";
        widgetDivRef.current.style.minWidth = "320px";
        widgetDivRef.current.style.height = "580px";
        widgetContainerRef.current.appendChild(widgetDivRef.current);

        // Initialize with the clean URL
        window.Calendly.initInlineWidget({
          url: url.split("?")[0].split("#")[0],
          parentElement: widgetDivRef.current,
        });

        widgetInitializedRef.current = true;
        setStatus("ready");
      } catch (error) {
        console.error("Calendly initialization failed:", error);
        setStatus("error");
      }
    };

    const loadScript = () => {
      if (document.querySelector('script[src*="calendly.com"]')) {
        initializeWidget();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      script.onload = initializeWidget;
      script.onerror = () => setStatus("error");
      document.head.appendChild(script);
    };

    loadScript();

    return () => {
      // Safely clean up
      if (widgetDivRef.current && widgetDivRef.current.parentNode) {
        try {
          widgetDivRef.current.parentNode.removeChild(widgetDivRef.current);
        } catch (error) {
          console.warn("Error cleaning up Calendly widget:", error);
        }
      }
      widgetInitializedRef.current = false;
    };
  }, [url]);

  return (
    <div ref={widgetContainerRef} className="relative">
      {status === "loading" && (
        <div className="flex items-center justify-center h-[580px]">
          <p>Loading scheduling widget...</p>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center justify-center h-[580px] text-red-500">
          <p>Failed to load scheduling widget. Please refresh the page.</p>
        </div>
      )}
      {/* The actual widget will be injected here by Calendly */}
    </div>
  );
};
