import React, { useEffect, useRef, useState, useMemo } from "react"
import { Truck, Package, Bike, UserCheck, X } from "lucide-react"
import KPICard from "@/components/KPICard"
import DataTable from "@/components/DataTable"
import UpcomingDeliveries from "@/components/UpcomingDeliveries"
import { Badge } from "@/components/ui/badge"
import { makeDemoRequest } from "@/utils/demoData"
import { useDemoResource } from "@/hooks/useDemoResource"

export default function OrderDispatchPage() {
  // TODO: Replace demo orders and riders with React Query queries and mutations.
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null)
  const [assignNotification, setAssignNotification] = useState(null)
  const assignTriggerRef = useRef(null)
  const dialogCloseRef = useRef(null)
  const { data: orders = [], loading: ordersLoading, error: ordersError, reload: reloadOrders } = useDemoResource("/user/admin/orders", [])
  const { data: riders = [], loading: ridersLoading, error: ridersError, reload: reloadRiders } = useDemoResource("/user/admin/riders", [])

  useEffect(() => {
    if (!selectedOrderForAssign) return undefined

    const trigger = assignTriggerRef.current
    dialogCloseRef.current?.focus()
    return () => trigger?.focus()
  }, [selectedOrderForAssign])

  const handleDialogKeyDown = (event) => {
    if (event.key === "Escape") {
      setSelectedOrderForAssign(null)
      return
    }

    if (event.key !== "Tab") return

    const focusableElements = event.currentTarget.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (!firstElement || !lastElement) return
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  const handleAssignRider = async (order, rider) => {
    try {
      await makeDemoRequest(`/user/admin/orders/${order.id}/assign`, {
        method: "POST",
        body: JSON.stringify({ rider_id: rider.id }),
      })
      await reloadOrders()
      setSelectedOrderForAssign(null)
      setAssignNotification(`Assigned ${rider.name} to ${order.orderId}`)
      setTimeout(() => setAssignNotification(null), 3500)
    } catch (requestError) {
      setAssignNotification(requestError.message)
    }
  }

  // TanStack table column definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: "orderId",
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
            status === "ready"
              ? "ready"
              : status === "pending"
              ? "preparing"
              : "outline"
          return (
            <Badge variant={variant} className="min-w-20 justify-center">
              {status.replace("_", " ")}
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
              onClick={(event) => {
                assignTriggerRef.current = event.currentTarget
                setSelectedOrderForAssign(order)
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {order.riderId ? (
                <span>Assigned: {order.riderId}</span>
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
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {ordersLoading || ridersLoading
            ? "Loading dispatch orders and riders."
            : ordersError || ridersError
            ? "Unable to load dispatch orders and riders."
            : `${orders.length} orders and ${riders.length} active riders loaded.`}
        </div>
        {/* Toast Notification */}
        {assignNotification && (
          <div className="p-3 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-md flex items-center justify-between">
              <span className="flex items-center gap-2" role="status" aria-live="polite">
              <UserCheck className="size-4" />
              {assignNotification}
            </span>
            <button type="button" onClick={() => setAssignNotification(null)} aria-label="Dismiss notification" className="p-1">
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {ordersError || ridersError ? (
          <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>Unable to load dispatch data.</span>
            <button type="button" onClick={() => { reloadOrders(); reloadRiders(); }} className="font-bold underline">Try again</button>
          </div>
        ) : null}

        {(ordersLoading || ridersLoading) && <p className="text-sm text-slate-500">Loading dispatch data...</p>}

        {/* 3 KPI Cards Row matching Image 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <KPICard
            title="Today's Delivery"
            value={orders.length}
            icon={<Truck className="size-6 text-amber-600" />}
            iconBg="bg-amber-100/80"
            trend="+12%"
            trendUp={true}
            trendLabel="vs yesterday"
          />

          <KPICard
            title="Pending Orders"
            value={orders.filter((order) => order.status === "pending").length}
            icon={<Package className="size-6 text-orange-600" />}
            iconBg="bg-orange-100/80"
            trend="-3"
            trendUp={true}
            trendLabel="3 awaiting kitchen prep"
          />

          <KPICard
            title="Active Riders"
            value={riders.length}
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
                const unassigned = orders.find((o) => !o.riderId)
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
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="assign-rider-dialog-title"
              onKeyDown={handleDialogKeyDown}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4"
            >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                  <h3 id="assign-rider-dialog-title" className="text-base font-extrabold text-slate-900">
                  Assign Rider to {selectedOrderForAssign.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Customer: {selectedOrderForAssign.customerName}
                </p>
              </div>
              <button
                type="button"
                ref={dialogCloseRef}
                onClick={() => setSelectedOrderForAssign(null)}
                aria-label="Close assign rider dialog"
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Available Active Riders:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {riders.map((rider) => (
                  <button
                    key={rider.id}
                    type="button"
                    onClick={() => handleAssignRider(selectedOrderForAssign, rider)}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 flex items-center justify-between text-left cursor-pointer transition-all"
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
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
