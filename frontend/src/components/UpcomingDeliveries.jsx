import React from "react"
import { Clock, Truck, MapPin, CheckCircle2, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const UPCOMING_WAVES = [
  {
    id: "wave-1",
    slot: "11:30 AM - 12:30 PM",
    batchName: "Lunch Wave 1",
    orderCount: 18,
    assignedRiders: 4,
    status: "Departing Soon",
    statusVariant: "preparing",
    etaMinutes: 18,
    progress: 85,
    destinationZone: "Downtown & Financial District",
  },
  {
    id: "wave-2",
    slot: "01:00 PM - 02:00 PM",
    batchName: "Midday Wave",
    orderCount: 9,
    assignedRiders: 2,
    status: "Kitchen Prep",
    statusVariant: "ready",
    etaMinutes: 75,
    progress: 40,
    destinationZone: "Suburbs & Uptown Tech Park",
  },
  {
    id: "wave-3",
    slot: "05:30 PM - 06:30 PM",
    batchName: "Dinner Wave",
    orderCount: 34,
    assignedRiders: 6,
    status: "Scheduled",
    statusVariant: "outline",
    etaMinutes: 240,
    progress: 10,
    destinationZone: "All Metro Zones",
  },
]

export default function UpcomingDeliveries({ onSelectWave, onQuickDispatch }) {
  return (
    <div className="space-y-4">
      {/* Next Wave Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-md">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 size-24 rounded-full bg-blue-500/10 blur-xl" />
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/20">
            <Clock className="size-3 animate-pulse" />
            Next Wave in 18 mins
          </span>
          <span className="text-xs font-medium text-slate-300">Wave #ORD-W14</span>
        </div>

        <h4 className="text-lg font-bold tracking-tight">Lunch Wave 1 (Downtown)</h4>
        <p className="text-xs text-slate-300 mt-1">18 orders packed & ready for dispatch</p>

        {/* Dispatch Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-[11px] font-medium text-slate-300">
            <span>Rider Readiness</span>
            <span>4 of 5 Assigned</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-700/80 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all duration-500 w-[80%]" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onQuickDispatch?.()}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Truck className="size-3.5" />
          Assign Final Rider
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>

      {/* Upcoming Delivery Schedule List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Upcoming Dispatch Waves</h4>
            <p className="text-xs text-slate-500">Scheduled batches for today</p>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
            3 Waves
          </span>
        </div>

        <div className="space-y-3">
          {UPCOMING_WAVES.map((wave) => (
            <div
              key={wave.id}
              className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/20 transition-all duration-200 cursor-pointer"
              onClick={() => onSelectWave?.(wave)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-blue-600" />
                  <span className="text-xs font-bold text-slate-900">{wave.slot}</span>
                </div>
                <Badge variant={wave.statusVariant}>{wave.status}</Badge>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-800">{wave.batchName}</span>
                <span className="font-medium text-slate-500">{wave.orderCount} Orders</span>
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {wave.destinationZone}
                </span>
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <Truck className="size-3" />
                  {wave.assignedRiders} Riders
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Metrics Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <CheckCircle2 className="size-3.5" />
            99.2% On-Time Target
          </span>
          <span className="text-slate-400">Avg prep: 12m</span>
        </div>
      </div>
    </div>
  )
}
