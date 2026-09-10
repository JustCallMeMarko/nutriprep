import React, { useState, useMemo } from "react"
import { Truck, Package, Bike, UserCheck, X } from "lucide-react"
import KPICard from "@/components/KPICard"
import DataTable from "@/components/DataTable"
import UpcomingDeliveries from "@/components/UpcomingDeliveries"
import NutriHeader from "@/components/NutriHeader"
import { Badge } from "@/components/ui/badge"

const SAMPLE_ORDERS = [
  {
    id: "#ORD-9021",
    customerName: "Eleanor Vance",
    mealPlan: "High Protein Build",
    address: "1024 Writer's Way, Suite 5",
    status: "Preparing",
    rider: null,
  },
  {
    id: "#ORD-9022",
    customerName: "Theo Crain",
    mealPlan: "Paleo Standard",
    address: "334 Main St, Apt 4A",
    status: "Ready",
    rider: null,
  },
  {
    id: "#ORD-9023",
    customerName: "Luke Crain",
    mealPlan: "Vegan Reset",
    address: "12 Caretaker Lodge",
    status: "Ready",
    rider: null,
  },
  {
    id: "#ORD-9024",
    customerName: "Shirley Crain",
    mealPlan: "Balanced Core (Breakfast/Lunch)",
    address: "12 Caretaker Lodge",
    status: "Preparing",
    rider: null,
  },
  {
    id: "#ORD-9025",
    customerName: "Steven Crain",
    mealPlan: "Classic Comfort",
    address: "892 Massachusetts Ave",
    status: "Preparing",
    rider: null,
  },
  {
    id: "#ORD-9026",
    customerName: "Arthur Pendelton",
    mealPlan: "Balanced Core",
    address: "400 Blueprint Ave",
    status: "Ready",
    rider: null,
  },
  {
    id: "#ORD-9027",
    customerName: "Nellie Vance",
    mealPlan: "High Protein Build",
    address: "42 Hill House St, Floor 1",
    status: "Preparing",
    rider: null,
  },
  {
    id: "#ORD-9028",
    customerName: "Hugh Crain",
    mealPlan: "Vegan Reset",
    address: "55 Oakwood Drive",
    status: "Ready",
    rider: null,
  },
  {
    id: "#ORD-9029",
    customerName: "Horace Dudley",
    mealPlan: "Balanced Core",
    address: "771 Elm Street",
    status: "Ready",
    rider: null,
  },
  {
    id: "#ORD-9030",
    customerName: "Clara Harris",
    mealPlan: "Keto Supreme",
    address: "14 Pine Valley Road",
    status: "Preparing",
    rider: null,
  },
  {
    id: "#ORD-9031",
    customerName: "Marcus Brody",
    mealPlan: "High Protein Build",
    address: "88 University Crescent",
    status: "Ready",
    rider: null,
  },
  {
    id: "#ORD-9032",
    customerName: "Elena Rodriguez",
    mealPlan: "Paleo Standard",
    address: "210 Grand Avenue",
    status: "Preparing",
    rider: null,
  },
]

const AVAILABLE_RIDERS = [
  { id: "r1", name: "Carlos Mendoza", vehicle: "E-Bike #04", rating: "4.9", currentLoads: 2 },
  { id: "r2", name: "Samantha Lee", vehicle: "Scooter #12", rating: "4.8", currentLoads: 1 },
  { id: "r3", name: "David Kim", vehicle: "Motorbike #09", rating: "5.0", currentLoads: 0 },
  { id: "r4", name: "Aria Thorne", vehicle: "E-Bike #02", rating: "4.9", currentLoads: 3 },
]

export default function OrderDispatchPage() {
  const [orders, setOrders] = useState(SAMPLE_ORDERS)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null)
  const [assignNotification, setAssignNotification] = useState(null)

  const handleAssignRider = (order, rider) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? { ...o, rider: rider.name, status: "Ready" }
          : o
      )
    )
    setSelectedOrderForAssign(null)
    setAssignNotification(`Assigned ${rider.name} to ${order.id}`)
    setTimeout(() => setAssignNotification(null), 3500)
  }

  // TanStack table column definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order ID",
        cell: (info) => (
          <span className="font-semibold text-slate-900 tracking-tight">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer Name",
        cell: (info) => (
          <span className="font-medium text-slate-800">{info.getValue()}</span>
        ),
      },
      {
        accessorKey: "mealPlan",
        header: "Meal Plan",
        cell: (info) => (
          <span className="text-slate-600 font-medium">{info.getValue()}</span>
        ),
      },
      {
        accessorKey: "address",
        header: "Delivery Address",
        cell: (info) => (
          <span className="text-slate-500 max-w-xs truncate block">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue()
          const variant =
            status === "Ready"
              ? "ready"
              : status === "Preparing"
              ? "preparing"
              : "outline"
          return (
            <Badge variant={variant} className="min-w-20 justify-center">
              {status}
            </Badge>
          )
        },
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => {
          const order = row.original
          return (
            <button
              type="button"
              onClick={() => setSelectedOrderForAssign(order)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {order.rider ? (
                <span>Assigned: {order.rider}</span>
              ) : (
                <span>Assign Rider</span>
              )}
            </button>
          )
        },
      },
    ],
    []
  )

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col">
      {/* Header */}
      <NutriHeader
        type="admin"
        title="Order Dispatch"
        searchPlaceholder="Search Orders..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Toast Notification */}
        {assignNotification && (
          <div className="p-3 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-md flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserCheck className="size-4" />
              {assignNotification}
            </span>
            <button onClick={() => setAssignNotification(null)} className="p-1">
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* 3 KPI Cards Row matching Image 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <KPICard
            title="Today's Delivery"
            value="178"
            icon={<Truck className="size-6 text-amber-600" />}
            iconBg="bg-amber-100/80"
            trend="+12%"
            trendUp={true}
            trendLabel="vs yesterday"
          />

          <KPICard
            title="Pending Orders"
            value="12"
            icon={<Package className="size-6 text-orange-600" />}
            iconBg="bg-orange-100/80"
            trend="-3"
            trendUp={true}
            trendLabel="3 awaiting kitchen prep"
          />

          <KPICard
            title="Active Riders"
            value="15"
            icon={<Bike className="size-6 text-blue-600" />}
            iconBg="bg-blue-100/80"
            trend="100%"
            trendUp={true}
            trendLabel="All routes covered"
          />
        </div>

        {/* Grid Layout: Main Shadcn Data Table + Requested Side Part Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Table Column (8 cols on large screens) */}
          <div className="lg:col-span-8 space-y-4">
            <DataTable
              columns={columns}
              data={orders}
              searchPlaceholder="Filter orders by ID, customer, address..."
              initialPageSize={6}
              darkHeader={true}
            />
          </div>

          {/* Requested Side Part Section for upcoming delivery/order (4 cols on large screens) */}
          <div className="lg:col-span-4">
            <UpcomingDeliveries
              onSelectWave={(wave) =>
                alert(`Selected wave: ${wave.batchName} (${wave.slot})`)
              }
              onQuickDispatch={() => {
                const unassigned = orders.find((o) => !o.rider)
                if (unassigned) {
                  setSelectedOrderForAssign(unassigned)
                } else {
                  alert("All current orders have riders assigned!")
                }
              }}
            />
          </div>
        </div>
      </main>

      {/* Assign Rider Modal */}
      {selectedOrderForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Assign Rider to {selectedOrderForAssign.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Customer: {selectedOrderForAssign.customerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForAssign(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Available Active Riders:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {AVAILABLE_RIDERS.map((rider) => (
                  <div
                    key={rider.id}
                    onClick={() => handleAssignRider(selectedOrderForAssign, rider)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {rider.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{rider.name}</p>
                        <p className="text-[11px] text-slate-400">{rider.vehicle} • ★ {rider.rating}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {rider.currentLoads} active orders
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
