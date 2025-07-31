import React from "react";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCalendlyConnection } from "@/stores/calendlyStore";

export const UserSelectionSection: React.FC = () => {
  const connectionStatus = useCalendlyConnection();

  return (
    <Card className="bg-white border border-gray-100 shadow-sm">
      <CardHeader className="pb-3 md:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            Connected User
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 border border-gray-100 rounded-lg bg-gray-50">
            <input
              type="checkbox"
              defaultChecked
              disabled
              className="w-4 h-4 text-blue-600 rounded border-gray-300 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium text-gray-900 text-sm md:text-base truncate">
                  {connectionStatus?.user_name || "Connected User"}
                </span>
                <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1 flex-shrink-0">
                  Connected
                </Badge>
                <Badge
                  variant="outline"
                  className="text-gray-600 text-xs px-2 py-1 flex-shrink-0"
                >
                  user
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-gray-500 truncate">
                {connectionStatus?.scheduling_url || "Calendly User"}
              </p>
            </div>
          </div>

          <p className="text-xs md:text-sm text-gray-500 mt-3">
            1 user connected
          </p>
        </div>
      </CardContent>
    </Card>
  );
}; 