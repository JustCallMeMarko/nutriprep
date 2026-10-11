import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  ShieldAlert,
  Utensils,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/api"

export interface DeliveryOrder {
  id: string
  orderId: string
  customerName: string
  customerPhone: string
  address: string
  district: string
  mealsCount: number
  credits: number
  mealSummary: string
  slot: string
  payout: number
  notes?: string | null
  status: "in_transit" | "delivered" | "pending"
}

function statusLabel(status: DeliveryOrder["status"]) {
  return status === "delivered"
    ? "Delivered"
    : status === "in_transit"
      ? "In transit"
      : "Assigned"
}

export default function RiderDashboard() {
  const { makeRequest } = useApi()
  const navigate = useNavigate()
  const [deliveries, setDeliveries] = React.useState<DeliveryOrder[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadDeliveries = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await makeRequest("deliveries")
      setDeliveries(response as DeliveryOrder[])
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load your assigned deliveries."
      )
    } finally {
      setIsLoading(false)
    }
  }, [makeRequest])

  React.useEffect(() => {
    void loadDeliveries()
  }, [loadDeliveries])

  const activeDeliveries = deliveries.filter((delivery) => delivery.status !== "delivered")
  const activeCount = activeDeliveries.length

  if (isLoading) {
    return (
      <section className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <RefreshCw size={16} className="animate-spin" />
          Loading your deliveries...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert size={34} className="text-rose-600" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Could not load deliveries</h1>
          <p className="mt-1 max-w-md text-sm text-slate-600">{error}</p>
        </div>
        <Button onClick={() => void loadDeliveries()} className="bg-blue-600 font-bold text-white hover:bg-blue-700">
          Try again
        </Button>
      </section>
    )
  }

  return (
    <section className="flex w-full flex-col gap-6 pb-16">
      <div className="flex flex-col items-start justify-between gap-4 border-b-2 border-slate-900 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Assigned Deliveries
          </h1>
          <p className="mt-1 text-base font-medium text-slate-600">
            Review your dispatches and manage every stop from the active route.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => void loadDeliveries()}
            className="gap-2 rounded-xl border-slate-300 font-bold"
          >
            <RefreshCw size={15} />
            Refresh
          </Button>
          <Badge className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-bold text-white">
            {activeCount} Active
          </Badge>
        </div>
      </div>

      {activeDeliveries.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
          <CheckCircle2 size={38} className="text-emerald-600" />
          <h2 className="mt-3 text-xl font-extrabold text-slate-900">You’re all caught up</h2>
          <p className="mt-1 text-sm text-slate-600">
            New deliveries assigned by dispatch will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {activeDeliveries.map((delivery) => {
            const isDelivered = delivery.status === "delivered"
            return (
              <div
                key={delivery.id}
                className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-colors hover:border-slate-300 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge variant="outline" className="border-slate-300 bg-slate-50 px-2.5 py-1 font-mono text-sm font-bold">
                      {delivery.orderId}
                    </Badge>
                    <span className="text-lg font-bold text-slate-900">{delivery.customerName}</span>
                    <Badge
                      className={
                        isDelivered
                          ? "bg-emerald-600 font-bold text-white"
                          : "bg-blue-100 font-bold text-blue-700"
                      }
                    >
                      {statusLabel(delivery.status)}
                    </Badge>
                    <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-base font-extrabold text-emerald-600">
                      +₱{delivery.payout.toLocaleString()}
                    </span>
                  </div>

                  <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-blue-600" />
                    <span className="font-medium">{delivery.address}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Clock size={15} className="text-slate-500" />
                      {delivery.slot}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Utensils size={15} className="text-blue-600" />
                      {delivery.mealSummary} ({delivery.mealsCount} meals)
                    </span>
                    <span className="font-semibold text-slate-800">
                      {delivery.credits.toLocaleString()} credits
                    </span>
                  </div>

                  {delivery.notes && (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs italic text-amber-900">
                      “{delivery.notes}”
                    </p>
                  )}
                </div>

                <div className="flex w-full shrink-0 flex-col gap-2 border-t border-slate-100 pt-3 sm:w-auto sm:border-t-0 sm:pt-0">
                  {delivery.customerPhone && (
                    <a
                      href={`tel:${delivery.customerPhone}`}
                      className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-background px-4 text-sm font-bold shadow-xs transition-colors hover:bg-slate-50 sm:w-auto"
                    >
                      <Phone size={15} />
                      Call customer
                    </a>
                  )}
                  <Button
                    onClick={() => navigate(`/rider/active?stop=${encodeURIComponent(delivery.id)}`)}
                    className="w-full gap-2 rounded-xl bg-blue-600 font-bold text-white shadow-sm hover:bg-blue-700 sm:w-auto"
                  >
                    <Navigation size={15} />
                    {isDelivered ? "View delivery" : "Open route"}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
