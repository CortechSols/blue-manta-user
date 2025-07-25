import type { ReactNode } from "react";

interface DashboardContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function DashboardContainer({
  title,
  subtitle,
  children,
  className,
}: DashboardContainerProps) {
  return (
    <div
      className={`bg-white dashboard-shadow !min-h-screen rounded-lg p-4 md:p-6 flex flex-col ${className}`}
      style={{ borderColor: "#0077B6" }}
    >
      {/* Page Header */}
      <div className="mb-4 md:mb-6">
        <h1
          className="!text-[20px] md:!text-[24px] font-bold"
          style={{ color: "#0077B6" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm md:text-lg mt-1" style={{ color: "#0077B6" }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
