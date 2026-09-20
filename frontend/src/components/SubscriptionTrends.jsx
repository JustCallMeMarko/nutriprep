import React from "react"
import { MoreHorizontal } from "lucide-react"

export default function SubscriptionTrends() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Annual Subscription Trends</h4>
          <p className="text-xs text-slate-400">Year-over-year retention & plan adoption</p>
        </div>
        <button
          type="button"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Trend options"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {/* Modern 3D Isometric Bar Graphic matching Image 3 aesthetic */}
      <div className="relative h-48 sm:h-52 w-full flex items-center justify-center bg-gradient-to-b from-slate-50/60 to-slate-100/40 rounded-xl overflow-hidden p-4">
        <svg
          viewBox="0 0 320 200"
          className="w-full h-full max-w-xs drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Grid floor */}
          <ellipse cx="160" cy="165" rx="140" ry="25" fill="#E2E8F0" fillOpacity="0.4" />

          {/* Bar 1: Purple Isometric Pillar (Q1) */}
          <g transform="translate(60, 45)">
            {/* Top face */}
            <polygon points="25,55 50,42 25,29 0,42" fill="#A855F7" />
            {/* Left face */}
            <polygon points="0,42 25,55 25,115 0,102" fill="#9333EA" />
            {/* Right face */}
            <polygon points="25,55 50,42 50,102 25,115" fill="#7E22CE" />
          </g>

          {/* Bar 2: Yellow / Amber Isometric Pillar (Q2) */}
          <g transform="translate(125, 10)">
            {/* Top face */}
            <polygon points="28,45 56,31 28,17 0,31" fill="#FDE047" />
            {/* Left face */}
            <polygon points="0,31 28,45 28,150 0,136" fill="#EAB308" />
            {/* Right face */}
            <polygon points="28,45 56,31 56,136 28,150" fill="#CA8A04" />
          </g>

          {/* Bar 3: Blue / Cyan Isometric Pillar (Q3 - Peak) */}
          <g transform="translate(195, -30)">
            {/* Top face */}
            <polygon points="30,42 60,27 30,12 0,27" fill="#67E8F9" />
            {/* Left face */}
            <polygon points="0,27 30,42 30,190 0,175" fill="#38BDF8" />
            {/* Right face */}
            <polygon points="30,42 60,27 60,175 30,190" fill="#0284C7" />
          </g>
        </svg>
      </div>

      {/* Legend / KPI Breakdown */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-100">
        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-1.5">
            <span className="size-2 rounded-full bg-purple-600" />
            <span className="text-[11px] font-semibold text-slate-500">Tier 1</span>
          </div>
          <p className="text-xs font-bold text-slate-900">2,410</p>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500" />
            <span className="text-[11px] font-semibold text-slate-500">Tier 2</span>
          </div>
          <p className="text-xs font-bold text-slate-900">4,195</p>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-1.5">
            <span className="size-2 rounded-full bg-sky-500" />
            <span className="text-[11px] font-semibold text-slate-500">Tier 3</span>
          </div>
          <p className="text-xs font-bold text-slate-900">5,880</p>
        </div>
      </div>
    </div>
  )
}
