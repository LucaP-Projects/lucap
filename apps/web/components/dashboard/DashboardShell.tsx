import { cn } from "@silknexus/ui"

interface DashboardShellProps {
  children: React.ReactNode
  className?: string
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {children}
    </div>
  )
}
