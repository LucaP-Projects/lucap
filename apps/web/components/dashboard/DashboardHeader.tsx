import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
  className?: string
}

export function DashboardHeader({
  heading,
  text,
  children,
  className
}: DashboardHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{heading}</h2>
          {text && (
            <p className="text-muted-foreground">
              {text}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
