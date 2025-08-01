import React from "react";
import { Users, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCalendarHeaderTitle } from "@/lib/calendar-utils";
import type { CalendarViewType } from "@/types/calendly";

interface CalendarHeaderProps {
  calendarView: CalendarViewType;
  onViewChange: (view: string) => void;
  onNavigate: (direction: "prev" | "next" | "today") => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  calendarView,
  onViewChange,
  onNavigate,
}) => {
  const views = ["Month", "Week", "Day", "Agenda"];

  const getCurrentViewName = () => {
    return (
      calendarView.view.charAt(0).toUpperCase() + calendarView.view.slice(1)
    );
  };

  return (
    <div className="pb-3 md:pb-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-base md:text-lg font-semibold text-gray-800">
          Calendar Overview
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
            <span>Users:</span>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 md:w-4 md:h-4" />
              <span className="font-medium">1 selected</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {views.map((view) => (
              <Button
                key={view}
                variant={getCurrentViewName() === view ? "default" : "outline"}
                size="sm"
                onClick={() => onViewChange(view)}
                className={`text-xs px-2 md:px-3 py-1 ${
                  getCurrentViewName() === view
                    ? "!bg-blue-600 !text-white hover:!bg-blue-700 !border-blue-600"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {view}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Calendar Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 md:mt-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900">
          {formatCalendarHeaderTitle(new Date(calendarView.date), calendarView.view)}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="p-2 border-gray-200 hover:bg-gray-50"
            onClick={() => onNavigate("prev")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3 md:px-4 border-gray-200 hover:bg-gray-50 text-xs md:text-sm"
            onClick={() => onNavigate("today")}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="p-2 border-gray-200 hover:bg-gray-50"
            onClick={() => onNavigate("next")}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};