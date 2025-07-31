import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface CalendlyMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

export const CalendlyMetricCard: React.FC<CalendlyMetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color 
}) => {
  return (
    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs md:text-sm font-medium text-gray-500">
              {title}
            </p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-xl md:text-3xl font-bold text-gray-900">
                {value}
              </h3>
              {subtitle && (
                <p className="text-xs md:text-sm text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>
          <div className={`p-2 md:p-3 rounded-full ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}; 