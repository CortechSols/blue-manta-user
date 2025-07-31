/**
 * Common formatting utilities used across the application
 */

/**
 * Format timestamp to relative time (e.g., "5m", "2h", "3d")
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 60) {
    return `${diffMins}m`;
  } else if (diffMins < 1440) {
    return `${Math.floor(diffMins / 60)}h`;
  } else {
    return `${Math.floor(diffMins / 1440)}d`;
  }
};

/**
 * Get initials from a name string
 */
export const getInitials = (name: string | null): string => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}; 