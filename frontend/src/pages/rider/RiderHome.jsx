import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import DeliveryRequestCard from "../../features/delivery/components/DeliveryRequestCard"
import MapPanel from "../../features/delivery/components/MapPanel"
import FloatingInfoCard from "../../features/delivery/components/FloatingInfoCard"
import { useApi } from "@/utils/api"
import { useApiResource } from "@/hooks/useApiResource"
import { ROUTES } from "@/lib/routes"

function RiderHome() {
  const navigate = useNavigate()
  const { makeRequest } = useApi()
  const { data: deliveries = [], loading, error, reload } = useApiResource("/user/rider/deliveries", [])
  const [actionState, setActionState] = useState({ status: "idle", message: "" })
  const delivery = deliveries.find((item) => item.status === "pending" || item.status === "ready")

  const handleAccept = async () => {
    if (!delivery) return
    setActionState({ status: "loading", message: "Accepting delivery..." })
    try {
      await makeRequest(`/user/rider/deliveries/${delivery.id}/accept`, { method: "POST" })
      setActionState({ status: "success", message: "Delivery accepted." })
      navigate(ROUTES.RIDER_ACTIVE)
    } catch (requestError) {
      setActionState({ status: "error", message: requestError.message })
      await reload()
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {actionState.status === "error" && <p className="wrap-break-word bg-red-50 px-4 py-3 text-sm text-red-700 sm:px-6">{actionState.message}</p>}
      <div className="grid min-h-[calc(100vh-4rem)] min-w-0 grid-cols-1 md:grid-cols-[minmax(18rem,28rem)_minmax(0,1fr)]">
        <div className="min-w-0 p-(--layout-gutter)">
          {loading ? (
            <p className="text-sm text-slate-500">Loading delivery requests...</p>
          ) : error ? (
            <div className="space-y-3 text-sm text-red-600">
              <p>Unable to load delivery requests.</p>
              <button type="button" onClick={() => reload()} className="font-bold underline">Try again</button>
            </div>
          ) : delivery ? (
            <DeliveryRequestCard
              customerName={delivery.customerName}
              estimatedTime="1 hr"
              pickupLocation={delivery.pickupLocation}
              pickupDetails={delivery.pickupDetails}
              dropoffLocation={delivery.dropoffLocation}
              onAccept={handleAccept}
            />
          ) : (
            <div className="space-y-3 text-sm text-slate-500">
              <p>No delivery requests are available.</p>
              <Link to={ROUTES.RIDER} className="font-bold text-blue-600 underline">Refresh requests</Link>
            </div>
          )}
        </div>

        <div className="relative min-h-80 min-w-0 bg-gray-200 md:min-h-0">
          <MapPanel />
          {delivery && <FloatingInfoCard customerName={delivery.customerName} distance="5.8 km" eta="1 hr" />}
        </div>
      </div>
    </div>
  )
}

export default RiderHome