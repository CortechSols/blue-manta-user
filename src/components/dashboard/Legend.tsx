interface LegendItem {
  color: string
  label: string
}

interface LegendProps {
  items: LegendItem[]
  className?: string
}

export function Legend({ items, className }: LegendProps) {
  return (
    <div className={`flex gap-4 text-xs ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
