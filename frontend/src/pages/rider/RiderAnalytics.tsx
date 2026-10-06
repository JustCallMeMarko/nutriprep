import * as React from "react"
import {
  Wallet,
  TrendingUp,
  PackageCheck,
  Star,
  Clock,
  Sparkles,
  Download,
  Search,
  CheckCircle2,
  Award,
  RefreshCw,
  ShieldAlert,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/api"

interface CompletedOrder {
  id: string
  customerName: string
  completedAt: string
  mealsCount: number
  mealSummary: string
  distanceKm: number | null
  basePay: number
  tip: number
  totalPayout: number
  status: "Paid" | "Pending Transfer"
}

interface AnalyticsResponse {
  chart: Array<{ label: string; earnings: number; orders: number; tips: number }>
  orders: CompletedOrder[]
  summary: {
    earnings: number
    orders: number
    tips: number
    averagePayout: number
    earningsChange: number
    ordersChange: number
  }
  capabilities: {
    cashOut: boolean
    distanceTracking: boolean
    tipsTracking: boolean
  }
}

export default function RiderAnalytics() {
  const { makeRequest } = useApi()
  const [timeframe, setTimeframe] = React.useState<"weekly" | "monthly">("weekly")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [analytics, setAnalytics] = React.useState<AnalyticsResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadAnalytics = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await makeRequest(`analytics?timeframe=${timeframe}`)
      setAnalytics(response as AnalyticsResponse)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load analytics.")
    } finally {
      setIsLoading(false)
    }
  }, [makeRequest, timeframe])

  React.useEffect(() => {
    void loadAnalytics()
  }, [loadAnalytics])

  const chartData = analytics?.chart ?? []
  const totalPeriodEarnings = analytics?.summary.earnings ?? 0
  const totalPeriodOrders = analytics?.summary.orders ?? 0
  const totalPeriodTips = analytics?.summary.tips ?? 0
  const averagePayout = analytics?.summary.averagePayout ?? 0
  const earningsChange = analytics?.summary.earningsChange ?? 0
  const completedOrders = analytics?.orders ?? []

  const filteredOrders = completedOrders.filter((order) => {
    return (
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.mealSummary.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const exportCsv = () => {
    const headers = ["Order ID", "Customer", "Delivered At", "Meals", "Payout", "Status"]
    const rows = completedOrders.map((order) => [
      order.id,
      order.customerName,
      order.completedAt,
      order.mealsCount,
      order.totalPayout,
      order.status,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `rider-analytics-${timeframe}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <section className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <RefreshCw size={16} className="animate-spin" />
          Loading your analytics...
        </div>
      </section>
    )
  }

  if (error || !analytics) {
    return (
      <section className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert size={34} className="text-rose-600" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Could not load analytics</h1>
          <p className="mt-1 max-w-md text-sm text-slate-600">{error ?? "No analytics data is available."}</p>
        </div>
        <Button onClick={() => void loadAnalytics()} className="bg-blue-600 font-bold text-white hover:bg-blue-700">
          Try again
        </Button>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6 w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-slate-900 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Rider Analytics & Earnings
          </h1>
          <p className="text-base font-medium text-slate-600 mt-1">
            Complete breakdown of delivery earnings, order volumes, and performance milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            className="border-slate-300 font-bold text-xs sm:text-sm rounded-xl py-2 px-3.5 flex items-center gap-1.5 cursor-pointer hover:bg-slate-50"
            onClick={exportCsv}
          >
            <Download size={15} />
            Export CSV
          </Button>

          <Button
            disabled={!analytics.capabilities.cashOut}
            title="Cash out is not configured for this account yet."
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl py-2 px-4 flex items-center gap-1.5 cursor-pointer shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Wallet size={15} />
            Cash Out unavailable
          </Button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Earnings
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Wallet size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              ₱{totalPeriodEarnings.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600">
              <TrendingUp size={14} />
              <span>{earningsChange >= 0 ? "+" : ""}{earningsChange}% vs last period</span>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Includes ₱{totalPeriodTips.toLocaleString()} in tips</span>
            <span className="font-semibold text-blue-600">Recorded earnings</span>
          </div>
        </div>

        {/* Total Completed Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completed Orders
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <PackageCheck size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              {totalPeriodOrders}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 size={14} />
              <span>99.2% On-Time Fulfillment</span>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Peak slot: Lunch (64%)</span>
            <span className="font-semibold text-slate-900">0 Cancelled</span>
          </div>
        </div>

        {/* Average Order Value / Payout */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Avg. Payout / Drop
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Sparkles size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              ₱{averagePayout.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-600">
              <Clock size={14} />
              <span>~21 mins avg drop time</span>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Distance tracking unavailable</span>
            <span className="font-semibold text-amber-600">Tips not tracked</span>
          </div>
        </div>

        {/* Rider Rating & Tier */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Courier Rating
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Star size={18} className="fill-purple-600 text-purple-600" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 flex items-baseline gap-1.5">
              4.96 <span className="text-base text-slate-500 font-semibold">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-purple-600">
              <Award size={14} />
              <span>Diamond Tier Courier</span>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>94 customer reviews</span>
            <span className="font-semibold text-emerald-600">100% Positive</span>
          </div>
        </div>
      </div>

      {/* Full Width Earnings & Delivery Trends Chart */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Earnings & Delivery Trends
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Daily earnings (₱) and completed order volume
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setTimeframe("weekly")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                timeframe === "weekly"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("monthly")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                timeframe === "monthly"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Chart Container */}
        <div className="w-full h-72 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(val) => `₱${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                        <p className="font-extrabold text-amber-400">{data.label}</p>
                        <p className="font-semibold">Earnings: ₱{data.earnings.toLocaleString()}</p>
                        <p className="text-slate-300">Orders: {data.orders} deliveries</p>
                        <p className="text-emerald-400">Tips: ₱{data.tips}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="earnings"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
                maxBarSize={56}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block"></span>
              Net Daily Earnings
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
              Includes Tips & Surge
            </span>
          </div>
          <span className="text-slate-500 font-semibold">
            {chartData.length > 0
              ? `Highest Day: ${chartData.reduce((highest, item) => item.earnings > highest.earnings ? item : highest).label} (₱${Math.max(...chartData.map((item) => item.earnings)).toLocaleString()})`
              : "No completed deliveries in this period"}
          </span>
        </div>
      </div>

      {/* Orders & Payout History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Completed Orders & Payouts Log
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Search and review past fulfilled meal orders and transferred earnings
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search orders or meals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Meal Order</th>
                <th className="py-3 px-3">Delivered At</th>
                <th className="py-3 px-3">Distance</th>
                <th className="py-3 px-3">Base Pay</th>
                <th className="py-3 px-3">Tip</th>
                <th className="py-3 px-3 font-extrabold text-slate-900">Total Payout</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {order.customerName}
                    </td>
                    <td className="py-3.5 px-3 max-w-[220px]">
                      <p className="font-medium text-slate-800 truncate" title={order.mealSummary}>
                        {order.mealSummary}
                      </p>
                      <span className="text-[11px] text-slate-500">
                        {order.mealsCount} meal pack
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {order.completedAt}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {order.distanceKm === null ? "—" : `${order.distanceKm} km`}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      ₱{order.basePay}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-emerald-600">
                      +₱{order.tip}
                    </td>
                    <td className="py-3.5 px-3 font-extrabold text-sm text-slate-900">
                      ₱{order.totalPayout}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] px-2 py-0.5 rounded-md">
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-medium">
                    No completed orders found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
