interface LogoProps {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "icon-only"
}

export function Logo({ size = "md", variant = "default" }: LogoProps) {
  const sizes = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 48, height: 48 },
  }

  if (variant === "icon-only") {
    return (
      <div className="relative flex items-center justify-center">
        <img
          src="/bml-side-logo.png"
          alt="Blue Manta Labs Logo"
          width={sizes[size].width}
          height={sizes[size].height}
          className="object-contain"
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <img
        src="/bml-side-logo.png"
        alt="Blue Manta Labs Logo"
        width={sizes[size].width}
        height={sizes[size].height}
        className="object-contain"
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium" style={{ color: "#0077B6" }}>
          Manta Engage
        </span>
      </div>
    </div>
  )
}
