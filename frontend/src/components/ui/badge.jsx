import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border border-border",
        // Custom domain status variants matching designs
        preparing:
          "border border-amber-200 bg-amber-50/90 text-amber-700 font-medium",
        ready:
          "border border-blue-200 bg-blue-50 text-blue-700 font-medium",
        active:
          "border border-emerald-200 bg-emerald-100/90 text-emerald-800 font-semibold shadow-xs",
        paused:
          "border border-slate-300 bg-slate-50 text-slate-600 font-medium",
        delivered:
          "border border-teal-200 bg-teal-50 text-teal-700 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
