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

// Weekly performance chart data
const WEEKLY_DATA = [
  { day: "Mon", earnings: 1850, orders: 11, tips: 150 },
  { day: "Tue", earnings: 2400, orders: 14, tips: 220 },
  { day: "Wed", earnings: 2100, orders: 12, tips: 180 },
  { day: "Thu", earnings: 2750, orders: 16, tips: 260 },
  { day: "Fri", earnings: 3400, orders: 19, tips: 340 },
  { day: "Sat", earnings: 3100, orders: 18, tips: 300 },
  { day: "Sun", earnings: 2850, orders: 16, tips: 250 },
]

// Monthly performance chart data
const MONTHLY_DATA = [
  { day: "Week 1", earnings: 14200, orders: 82, tips: 1200 },
  { day: "Week 2", earnings: 16800, orders: 98, tips: 1550 },
  { day: "Week 3", earnings: 15900, orders: 91, tips: 1400 },
  { day: "Week 4", earnings: 18450, orders: 118, tips: 1700 },
]

// Order History
interface CompletedOrder {
  id: string
  customerName: string
  completedAt: string
  mealsCount: number
  mealSummary: string
  distanceKm: number
  basePay: number
  tip: number
  totalPayout: number
  status: "Paid" | "Pending Transfer"
}

const COMPLETED_ORDERS: CompletedOrder[] = [
  {
    id: "ORD-9400",
    customerName: "Claire Bennett",
    completedAt: "Today, 11:45 AM",
    mealsCount: 2,
    mealSummary: "2x Grilled Chicken Quinoa Bowl",
    distanceKm: 2.1,
    basePay: 150,
    tip: 30,
    totalPayout: 180,
    status: "Paid",
  },
  {
    id: "ORD-9398",
    customerName: "David Kim",
    completedAt: "Today, 11:15 AM",
    mealsCount: 1,
    mealSummary: "1x Avocado & Salmon Keto Bowl",
    distanceKm: 3.4,
    basePay: 140,
    tip: 20,
    totalPayout: 160,
    status: "Paid",
  },
  {
    id: "ORD-9395",
    customerName: "Sarah Jenkins",
    completedAt: "Yesterday, 1:20 PM",
    mealsCount: 3,
    mealSummary: "2x Steak Power Skillet, 1x Greek Yogurt",
    distanceKm: 4.2,
    basePay: 190,
    tip: 50,
    totalPayout: 240,
    status: "Paid",
  },
  {
    id: "ORD-9392",
    customerName: "Patrick Bateman",
    completedAt: "Yesterday, 12:40 PM",
    mealsCount: 2,
    mealSummary: "2x Diabetic-Friendly Beef Tapa",
    distanceKm: 3.0,
    basePay: 160,
    tip: 40,
    totalPayout: 200,
    status: "Paid",
  },
  {
    id: "ORD-9389",
    customerName: "Hannah Abbott",
    completedAt: "Sep 26, 12:10 PM",
    mealsCount: 1,
    mealSummary: "1x Salmon Teriyaki & Broccoli",
    distanceKm: 1.8,
    basePay: 130,
    tip: 20,
    totalPayout: 150,
    status: "Paid",
  },
  {
    id: "ORD-9384",
    customerName: "Michael Chang",
    completedAt: "Sep 25, 1:05 PM",
    mealsCount: 2,
    mealSummary: "2x High-Protein Chicken Bowls",
    distanceKm: 5.6,
    basePay: 210,
    tip: 40,
    totalPayout: 250,
    status: "Paid",
  },
]

export default function RiderAnalytics() {
  const [timeframe, setTimeframe] = React.useState<"weekly" | "monthly">("weekly")
  const [searchQuery, setSearchQuery] = React.useState("")

  const chartData = timeframe === "weekly" ? WEEKLY_DATA : MONTHLY_DATA
  const totalPeriodEarnings = chartData.reduce((acc, curr) => acc + curr.earnings, 0)
  const totalPeriodOrders = chartData.reduce((acc, curr) => acc + curr.orders, 0)
  const totalPeriodTips = chartData.reduce((acc, curr) => acc + curr.tips, 0)

  const filteredOrders = COMPLETED_ORDERS.filter((order) => {
    return (
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.mealSummary.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

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
            onClick={() => alert("Earnings report exported as CSV")}
          >
            <Download size={15} />
            Export CSV
          </Button>

          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl py-2 px-4 flex items-center gap-1.5 cursor-pointer shadow-xs">
            <Wallet size={15} />
            Cash Out ₱3,200
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
              <span>+16.4% vs last period</span>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Includes ₱{totalPeriodTips.toLocaleString()} in tips</span>
            <span className="font-semibold text-blue-600">Available: ₱3,200</span>
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
              ₱{Math.round(totalPeriodEarnings / totalPeriodOrders)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-600">
              <Clock size={14} />
              <span>~21 mins avg drop time</span>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Avg distance: 3.2 km</span>
            <span className="font-semibold text-amber-600">+₱25 Lunch Surge</span>
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
                dataKey="day"
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
                        <p className="font-extrabold text-amber-400">{data.day}</p>
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
            Highest Day: Friday (₱3,400)
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
                      {order.distanceKm} km
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
