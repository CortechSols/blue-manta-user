import { useEffect } from "react";
import { Calendar, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/ui/refresh-button";
import { DashboardLayout } from "@/components/layout";
import { CalendlyDashboard } from "@/components/calendly";
import { useCalendlyConnect } from "@/hooks/useCalendly";
import {
  useCalendlyConnection,
  useCalendlyActions,
  useCalendlyLoading,
} from "@/stores/calendly";
import { useAuthStore } from "@/stores/authStore";

const CalendlyConnectState = ({
  onConnect,
  isLoading,
}: {
  onConnect: () => void;
  isLoading: boolean;
}) => {

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-16 px-4 md:px-8">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 md:mb-6">
        <Calendar className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
      </div>
      <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4 text-center">
        Connect Your Calendly Account
      </h3>
      <p className="text-sm md:text-base text-gray-600 text-center max-w-sm md:max-w-md mb-6 md:mb-8 px-2">
        To manage your appointment scheduling, connect your Calendly account to
        sync your event types and bookings.
      </p>
      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm md:text-base px-4 md:px-6"
        onClick={onConnect}
        disabled={isLoading}
      >
        {isLoading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <ExternalLink className="w-4 h-4" />
        )}
        {isLoading ? "Connecting..." : "Connect to Calendly"}
      </Button>
      <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4 text-center px-2">
        You'll be redirected to Calendly to authorize the connection
      </p>
    </div>
  );
};

export default function CalendarPage() {
  const { initiateOAuth, isPending, error } = useCalendlyConnect();
  const connectionStatus = useCalendlyConnection();
  const { checkConnectionStatus } = useCalendlyActions();
  const loading = useCalendlyLoading();
  const { user } = useAuthStore();

  // Debug environment variables
  useEffect(() => {
    console.log("CalendarPage mounted - checking environment variables:");
    console.log(
      "VITE_CALENDLY_CLIENT_ID:",
      import.meta.env.VITE_CALENDLY_CLIENT_ID
    );
    console.log(
      "VITE_CALENDLY_REDIRECT_URI:",
      import.meta.env.VITE_CALENDLY_REDIRECT_URI
    );
    console.log("VITE_APP_ENV:", import.meta.env.VITE_APP_ENV);
    console.log("All env vars:", import.meta.env);
  }, []);

  // Check connection status and load data on mount
  useEffect(() => {
    // Always check connection status on mount to ensure we have the latest state
    checkConnectionStatus().catch(() => {
      console.log(
        "Connection status check failed on mount, assuming not connected"
      );
    });
  }, [checkConnectionStatus]);

  const handleConnect = () => {
    console.log("handleConnect called - initiating OAuth...");
    try {
      initiateOAuth();
      console.log("initiateOAuth called successfully");
    } catch (error) {
      console.error("Error in handleConnect:", error);
    }
  };

  // Show error if any
  if (error) {
    return (
      <DashboardLayout
        title={`${user?.firstName} ${user?.lastName}`}
        subtitle="Appointment Calendar"
        activePath="/calendar"
      >
        <div className="border-2 border-red-200 rounded-lg bg-red-50 p-4 md:p-8">
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-semibold text-red-800 mb-3 md:mb-4">
              Connection Error
            </h3>
            <p className="text-sm md:text-base text-red-600 mb-4 md:mb-6">
              {error.message || "Failed to connect to Calendly"}
            </p>
            {error.message?.includes("not properly configured") && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Configuration Issue:</strong> The Calendly integration
                  requires environment variables to be set up. Please contact
                  your administrator to configure the Calendly OAuth settings.
                </p>
              </div>
            )}
            <RefreshButton
              onRefresh={() => window.location.reload()}
              label="Try Again"
              variant="destructive"
              className="text-sm md:text-base"
            />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`${user?.firstName} ${user?.lastName}`}
      subtitle="Appointment Calendar"
      activePath="/calendar"
    >
      <div className="dashboard-shadow rounded-lg bg-white">
        <div className="p-4 md:p-8">
          <h3 className="text-lg md:text-2xl font-semibold text-[#0077B6] mb-4 md:mb-8">
            Calendar Management
          </h3>

          {(() => {
            console.log("Render decision:", {
              loadingConnection: loading.connection,
              isConnected: connectionStatus?.is_connected,
              connectionStatus: connectionStatus,
            });

            if (loading.connection) {
              return (
                <div className="flex flex-col items-center justify-center py-8 md:py-16 px-4 md:px-8">
                  <RefreshCw className="w-6 h-6 md:w-8 md:h-8 text-blue-600 animate-spin mb-3 md:mb-4" />
                  <p className="text-sm md:text-base text-gray-600 text-center">
                    Checking Calendly connection...
                  </p>
                </div>
              );
            }

            if (connectionStatus?.is_connected) {
              return <CalendlyDashboard />;
            }

            return (
              <CalendlyConnectState
                onConnect={handleConnect}
                isLoading={isPending}
              />
            );
          })()}
        </div>
      </div>
    </DashboardLayout>
  );
}
