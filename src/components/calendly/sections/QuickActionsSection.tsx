import React, { useState } from "react";
import { Settings, ExternalLink, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useCalendlyActions, useCalendlyConnection } from "@/stores/calendlyStore";

export const QuickActionsSection: React.FC = () => {
  const actions = useCalendlyActions();
  const connectionStatus = useCalendlyConnection();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disconnect your Calendly account? You can connect it again later."
      )
    ) {
      return;
    }

    setIsDisconnecting(true);
    try {
      await actions.disconnectCalendly();
    } catch (error) {
      console.error("Failed to disconnect Calendly:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Card className="bg-white border border-gray-100 shadow-sm">
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Settings className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-3">
        <RefreshButton
          onRefresh={() => actions?.refreshAll?.()}
          label="Refresh All Data"
          variant="default"
          className="w-full !bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 font-medium shadow-sm text-sm md:text-base"
        />

        <Button
          variant="outline"
          className="w-full border-gray-200 hover:bg-gray-50 text-gray-700 text-sm md:text-base"
          onClick={() =>
            window.open("https://calendly.com/event_types", "_blank")
          }
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Manage Event Types
        </Button>

        {connectionStatus?.is_connected && (
          <Button
            variant="outline"
            className="w-full border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 text-sm md:text-base"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
          >
            {isDisconnecting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Disconnecting...
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 mr-2" />
                Disconnect Calendly
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}; 