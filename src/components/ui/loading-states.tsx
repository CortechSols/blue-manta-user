import React from "react";
import { Alert, AlertDescription } from "./alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading...", 
  className = "" 
}) => {
  return (
    <div className={`flex items-center justify-center h-64 ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry, 
  className = "" 
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div className={`flex items-center justify-center h-64 ${className}`}>
      <div className="text-center">
        <div className="text-red-500 text-xl mb-4">⚠️</div>
        <p className="text-red-600 mb-2">Failed to load data</p>
        <p className="text-gray-600 text-sm mb-4">{errorMessage}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = "No data available",
  message = "There are no items to display at the moment.",
  icon,
  className = "" 
}) => {
  return (
    <div className={`flex items-center justify-center h-64 ${className}`}>
      <div className="text-center">
        {icon && <div className="mb-4">{icon}</div>}
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

interface AlertErrorProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}

export const AlertError: React.FC<AlertErrorProps> = ({ 
  error, 
  onRetry, 
  className = "" 
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <Alert className={`border-red-200 bg-red-50 ${className}`}>
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-sm md:text-base">Error: {errorMessage}</span>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="text-xs md:text-sm"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Try Again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}; 