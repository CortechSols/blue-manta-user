import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "./button";

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading?: boolean;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "destructive"
    | "secondary"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
  animationDuration?: number;
  disabled?: boolean;
}

export function RefreshButton({
  onRefresh,
  isLoading = false,
  variant = "outline",
  size = "default",
  className = "",
  label = "Refresh",
  animationDuration = 1500,
  disabled = false,
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();

    // Stop the animation after the specified duration
    setTimeout(() => {
      setIsRefreshing(false);
    }, animationDuration);
  };

  return (
    <Button
      onClick={handleRefresh}
      variant={variant}
      size={size}
      disabled={isLoading || disabled}
      className={className}
    >
      <RefreshCw
        className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
      />
      {label}
    </Button>
  );
}
