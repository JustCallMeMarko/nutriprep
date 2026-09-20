import React from "react"
import { cn } from "@/lib/utils"

/**
 * Reusable KPICard component matching the NutriPrep dashboard design.
 * 
 * @param {Object} props
 * @param {string} props.title - The label/title of the metric
 * @param {string|number} props.value - The main metric value (e.g. 178, 12,485, +15%)
 * @param {React.ReactNode} [props.icon] - Icon component or element to display
 * @param {string} [props.iconBg] - Custom background class for the icon container
 * @param {string} [props.iconColor] - Custom text/icon color class
 * @param {string} [props.trend] - e.g. "+12%", "-3%"
 * @param {boolean} [props.trendUp] - Whether the trend is positive
 * @param {string} [props.trendLabel] - e.g. "vs last week"
 * @param {string} [props.className] - Additional classes
 */
export default function KPICard({
  title,
  value,
  icon,
  iconBg = "bg-amber-100",
  iconColor = "text-amber-700",
  trend,
  trendUp = true,
  trendLabel,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-between p-5 md:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <p className="text-xs md:text-sm font-medium text-slate-500 tracking-tight">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full",
                trendUp
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              )}
            >
              {trendUp ? "↑ " : "↓ "}
              {trend}
            </span>
          )}
        </div>
        {trendLabel && (
          <p className="text-[11px] text-slate-400">{trendLabel}</p>
        )}
      </div>

      {icon && (
        <div
          className={cn(
            "flex items-center justify-center size-12 md:size-14 rounded-full shrink-0 transition-transform duration-200 hover:scale-105",
            iconBg,
            iconColor
          )}
        >
          {icon}
        </div>
      )}
    </div>
  )
}
