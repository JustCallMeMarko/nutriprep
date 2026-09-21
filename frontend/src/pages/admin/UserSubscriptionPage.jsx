import React, { useState, useMemo } from "react"
import { TrendingUp, Users, BarChart3 } from "lucide-react"
import KPICard from "@/components/KPICard"
import DataTable from "@/components/DataTable"
import SubscriptionTrends from "@/components/SubscriptionTrends"
import RecentStatusUpdates from "@/components/RecentStatusUpdates"

const INITIAL_SUBSCRIBERS = [
  {
    id: "sub-1",
    user: "Sarah Jenkins",
    email: "s.jenkins@example.com",
    mealPlan: "Balanced Core",
    status: "Active",
    joinedDate: "Jan 14, 2025",
  },
  {
    id: "sub-2",
    user: "Michael Scott",
    email: "m.scott@dunder.com",
    mealPlan: "High Protein Build",
    status: "Active",
    joinedDate: "Feb 02, 2025",
  },
  {
    id: "sub-3",
    user: "Pam Beesly",
    email: "p.beesly@design.org",
    mealPlan: "Vegan Reset",
    status: "Pause",
    joinedDate: "Mar 11, 2025",
  },
  {
    id: "sub-4",
    user: "Jim Halpert",
    email: "j.halpert@athlead.io",
    mealPlan: "Balanced Core",
    status: "Active",
    joinedDate: "Mar 20, 2025",
  },
  {
    id: "sub-5",
    user: "Dwight Schrute",
    email: "dwight@schrute-farms.net",
    mealPlan: "Keto Premium",
    status: "Active",
    joinedDate: "Apr 04, 2025",
  },
  {
    id: "sub-6",
    user: "Angela Martin",
    email: "a.martin@accounting.org",
    mealPlan: "Balanced Core",
    status: "Active",
    joinedDate: "Apr 18, 2025",
  },
  {
    id: "sub-7",
    user: "Stanley Hudson",
    email: "s.hudson@pretzels.com",
    mealPlan: "Classic Comfort",
    status: "Pause",
    joinedDate: "May 01, 2025",
  },
  {
    id: "sub-8",
    user: "Oscar Martinez",
    email: "o.martinez@finance.net",
    mealPlan: "Paleo Standard",
    status: "Active",
    joinedDate: "May 15, 2025",
  },
  {
    id: "sub-9",
    user: "Kelly Kapoor",
    email: "k.kapoor@trendhub.com",
    mealPlan: "Vegan Reset",
    status: "Active",
    joinedDate: "Jun 02, 2025",
  },
  {
    id: "sub-10",
    user: "Toby Flenderson",
    email: "t.flenderson@corporate.com",
    mealPlan: "Low Carb Lite",
    status: "Pause",
    joinedDate: "Jun 19, 2025",
  },
]

export default function UserSubscriptionPage() {
  const [subscribers, setSubscribers] = useState(INITIAL_SUBSCRIBERS)

  const toggleStatus = (id) => {
    setSubscribers((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? { ...sub, status: sub.status === "Active" ? "Pause" : "Active" }
          : sub
      )
    )
  }

  // TanStack table column definitions matching Image 3
  const columns = useMemo(
    () => [
      {
        accessorKey: "user",
        header: "User",
        cell: (info) => (
          <span className="font-semibold text-slate-800 tracking-tight">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => (
          <span className="text-slate-500 font-normal">{info.getValue()}</span>
        ),
      },
      {
        accessorKey: "mealPlan",
        header: "Meal Plan",
        cell: (info) => (
          <span className="text-slate-700 font-medium">{info.getValue()}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const sub = row.original
          const isActive = sub.status === "Active"
          return (
            <button
              type="button"
              onClick={() => toggleStatus(sub.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300/80 hover:bg-emerald-200/80"
                  : "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200/80"
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              {sub.status}
            </button>
          )
        },
      },
    ],
    []
  )

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* 3 KPI Cards Row matching Image 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <KPICard
            title="Total Active Subscribers:"
            value="12,485"
            icon={<TrendingUp className="size-6 text-slate-900" />}
            iconBg="bg-slate-100"
            trend="+4.2%"
            trendUp={true}
            trendLabel="vs last month"
          />

          <KPICard
            title="New Subscribers:"
            value="842"
            icon={<Users className="size-6 text-slate-900" />}
            iconBg="bg-slate-100"
            trend="+18%"
            trendUp={true}
            trendLabel="This billing cycle"
          />

          <KPICard
            title="Subscription Growth:"
            value="+15%"
            icon={<BarChart3 className="size-6 text-slate-900" />}
            iconBg="bg-slate-100"
            trend="Strong"
            trendUp={true}
            trendLabel="Consistent upward trajectory"
          />
        </div>

        {/* Scalable Layout: Main Shadcn Data Table + Right Cards Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Table (approx 7 cols on large screens) */}
          <div className="lg:col-span-7 space-y-4">
            <DataTable
              columns={columns}
              data={subscribers}
              searchPlaceholder="Search users, emails, meal plans..."
              initialPageSize={6}
              darkHeader={true}
            />
          </div>

          {/* Right Column: Trends + Recent Updates (approx 5 cols on large screens) */}
          <div className="lg:col-span-5 space-y-6">
            <SubscriptionTrends />
            <RecentStatusUpdates
              onViewAll={() => alert("Opening all recent subscriber status updates...")}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
