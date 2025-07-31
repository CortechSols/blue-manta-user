import React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useCalendlyActions, useCalendlyConnection } from "@/stores/calendlyStore";
import { format } from "date-fns";

export const ConnectionStatusSection: React.FC = () => {
  const connectionStatus = useCalendlyConnection();
  const actions = useCalendlyActions();

  return (
    <Card className="bg-white border border-gray-100 shadow-sm">
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="text-base md:text-lg font-semibold text-gray-800">
          Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <RefreshButton
            onRefresh={() => actions?.refreshAll?.()}
            label="Check Connections"
            size="sm"
            className="border-gray-200 hover:bg-gray-50 text-gray-700 text-xs md:text-sm"
          />
        </div>

        <div className="space-y-3 text-xs md:text-sm">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Organization Connected:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {connectionStatus?.is_connected ? "Yes" : "No"}
              </span>
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus?.is_connected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Connected Users:</span>
            <span className="font-medium text-gray-900">1 / 1</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Last Sync:</span>
            <span className="font-medium text-gray-900">
              {format(new Date(), "dd/MM/yyyy")}
            </span>
          </div>
        </div>

        {connectionStatus?.is_connected && (
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-blue-600 border-blue-300 hover:bg-blue-50 text-xs md:text-sm"
              onClick={() =>
                window.open("https://calendly.com/integrations", "_blank")
              }
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage in Calendly
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 