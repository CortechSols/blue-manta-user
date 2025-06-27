import type { ReactNode } from "react"

interface DashboardContainerProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function DashboardContainer({ title, subtitle, children, className }: DashboardContainerProps) {
  return (
    <div className={`border-2 rounded-lg p-6 ${className}`} style={{ borderColor: "#0077B6" }}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "#0077B6" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg" style={{ color: "#0077B6" }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
