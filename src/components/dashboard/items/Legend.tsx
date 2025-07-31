interface LegendItem {
  color: string;
  label: string;
}

interface LegendProps {
  items: LegendItem[];
  className?: string;
}

export function Legend({ items, className }: LegendProps) {
  return (
    <div className={`flex flex-wrap gap-2 md:gap-4 text-xs ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1 md:gap-2">
          <div
            className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs md:text-sm">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
