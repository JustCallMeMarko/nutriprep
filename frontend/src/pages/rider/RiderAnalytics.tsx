import * as React from "react"
import {
  Wallet,
  TrendingUp,
  PackageCheck,
  Sparkles,
  Download,
  Search,
  CheckCircle2,
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
import { Skeleton } from "@/components/ui/skeleton"
import { useApi } from "@/lib/api"

interface CompletedOrder {
  deliveryId: number
  orderId: number
  riderId: string | null
  userId: string
  totalCredits: number
  orderStatus: string
  orderCreatedAt: string | null
  deliveredAt: string | null
}

interface AnalyticsResponse {
  chart: Array<{ label: string; earnings: number; orders: number; tips: number }>
  orders: CompletedOrder[]
  summary: {
    earnings: number
    orders: number
    deliveredCredits: number
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
  const totalDeliveredCredits = analytics?.summary.deliveredCredits ?? 0
  const earningsChange = analytics?.summary.earningsChange ?? 0
  const completedOrders = analytics?.orders ?? []

  const filteredOrders = completedOrders.filter((order) => {
    const query = searchQuery.toLowerCase()
    return (
      String(order.deliveryId).includes(query) ||
      String(order.orderId).includes(query) ||
      order.riderId?.toLowerCase().includes(query) ||
      order.userId.toLowerCase().includes(query)
    )
  })

  const exportCsv = () => {
    const headers = [
      "Delivery ID", "Order ID", "Rider ID", "User ID", "Total Credits",
      "Order Status", "Order Created At", "Delivered At",
    ]
    const rows = completedOrders.map((order) => [
      order.deliveryId,
      order.orderId,
      order.riderId,
      order.userId,
      order.totalCredits,
      order.orderStatus,
      order.orderCreatedAt,
      order.deliveredAt,
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
      <section className="flex flex-col gap-6 w-full pb-16" aria-label="Loading your analytics" aria-busy="true">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Earnings */}
        <div className="flex min-h-48 flex-col justify-between rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-xs">
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
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
            <span>₱30 per order credit</span>
            <span className="font-semibold text-blue-600">Database total</span>
          </div>
        </div>

        {/* Total Completed Orders */}
        <div className="flex min-h-48 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
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
            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <CheckCircle2 size={14} />
              <span>Delivered records</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
            <span>From deliveries table</span>
            <span className="font-semibold text-emerald-600">Completed</span>
          </div>
        </div>

        {/* Delivered Credits */}
        <div className="flex min-h-48 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Delivered Credits
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <Sparkles size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              {totalDeliveredCredits.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-blue-600">
              <PackageCheck size={14} />
              <span>Credits delivered</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
            <span>From orders table</span>
            <span className="font-semibold text-amber-600">Total credits</span>
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
                        <p className="text-slate-300">Tips: Not tracked</p>
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
              Tips and surge are not tracked
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
              Completed Delivery and Order Records
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Search records from the deliveries and orders tables
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
                placeholder="Search delivery, order, rider, or user ID..."
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
                <th className="py-3 px-3">Delivery ID</th>
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Rider ID</th>
                <th className="py-3 px-3">User ID</th>
                <th className="py-3 px-3">Total Credits</th>
                <th className="py-3 px-3">Order Status</th>
                <th className="py-3 px-3">Order Created At</th>
                <th className="py-3 px-3">Delivered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.deliveryId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{order.deliveryId}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{order.orderId}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-600">{order.riderId ?? "—"}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-600">{order.userId}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">{order.totalCredits}</td>
                    <td className="py-3.5 px-3">
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] px-2 py-0.5 rounded-md">
                        {order.orderStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">{order.orderCreatedAt ?? "—"}</td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">{order.deliveredAt ?? "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
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
