import React from "react"
import { RefreshCw, Pause, UserPlus, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const UPDATES = [
  {
    id: 1,
    name: "Elena R.",
    action: "renewed subscription",
    time: "2 mins ago",
    plan: "Balanced Core",
    icon: RefreshCw,
    iconBg: "bg-teal-50 text-teal-600 border-teal-200/60",
  },
  {
    id: 2,
    name: "Marcus S.",
    action: "paused subscription",
    time: "1 hour ago",
    plan: "Paleo Build",
    icon: Pause,
    iconBg: "bg-amber-50 text-amber-600 border-amber-200/60",
  },
  {
    id: 3,
    name: "David T.",
    action: "joined",
    time: "3 hours ago",
    plan: "Keto Premium",
    icon: UserPlus,
    iconBg: "bg-blue-50 text-blue-600 border-blue-200/60",
  },
  {
    id: 4,
    name: "Sarah J.",
    action: "renewed subscription",
    time: "5 hours ago",
    plan: "Keto Premium",
    icon: RefreshCw,
    iconBg: "bg-teal-50 text-teal-600 border-teal-200/60",
  },
]

export default function RecentStatusUpdates({ onViewAll }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Recent Status Updates</h4>
          <p className="text-xs text-slate-400">Live member stream</p>
        </div>
        <button
          type="button"
          onClick={() => onViewAll?.()}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
        >
          View All
          <ArrowRight className="size-3" />
        </button>
      </div>

      <div className="space-y-3.5">
        {UPDATES.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center shrink-0 border mt-0.5",
                  item.iconBg
                )}
              >
                <Icon className="size-3.5" />
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-xs text-slate-800 leading-snug">
                  <span className="font-bold text-slate-900">{item.name}</span>{" "}
                  {item.action}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{item.time}</span>
                  <span>•</span>
                  <span className="font-medium text-slate-500">{item.plan}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
