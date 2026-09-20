import { useState } from "react"
import { Link } from "react-router-dom"
import DeliveryCard from "../../features/delivery/components/DeliveryCard"
import MapPanel from "../../features/delivery/components/MapPanel"
import FloatingInfoCard from "../../features/delivery/components/FloatingInfoCard"
import { useApi } from "@/utils/api"
import { useApiResource } from "@/hooks/useApiResource"
import { ROUTES } from "@/lib/routes"

function ActiveDelivery() {
  const { makeRequest } = useApi()
  const { data: deliveries = [], loading, error, reload } = useApiResource("/user/rider/deliveries", [])
  const [actionState, setActionState] = useState({ status: "idle", message: "" })
  const delivery = deliveries.find((item) => item.status === "in_transit")

  const handleMarkDelivered = async () => {
    if (!delivery) return
    setActionState({ status: "loading", message: "Updating delivery..." })
    try {
      await makeRequest(`/user/rider/deliveries/${delivery.id}/complete`, { method: "POST" })
      setActionState({ status: "success", message: "Delivery marked as delivered." })
      await reload()
    } catch (requestError) {
      setActionState({ status: "error", message: requestError.message })
    }
  }

  if (loading) return <div className="p-6 text-sm text-slate-500">Loading active delivery...</div>
  if (error) return <div className="space-y-3 p-6 text-sm text-red-600"><p>Unable to load the active delivery.</p><button type="button" onClick={() => reload()} className="font-bold underline">Try again</button></div>
  if (!delivery) return <div className="space-y-3 p-6 text-sm text-slate-500"><p>No active delivery.</p><Link to={ROUTES.RIDER} className="font-bold text-blue-600 underline">Back to requests</Link></div>

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
      <div className="w-full max-w-sm border-b p-6 md:border-b-0 md:border-r">
        <DeliveryCard
          customerName={delivery.customerName}
          orderID={delivery.orderId}
          address={delivery.address}
          notes={delivery.notes}
          status={delivery.status}
          onMarkDelivered={handleMarkDelivered}
        />
        {actionState.status !== "idle" && <p className={actionState.status === "error" ? "mt-3 text-sm text-red-600" : "mt-3 text-sm text-emerald-600"}>{actionState.status === "loading" ? "Updating..." : actionState.message}</p>}
      </div>

      <div className="relative min-h-80 flex-1">
        <MapPanel />
        <FloatingInfoCard customerName={delivery.customerName} distance="5.8 km" eta="1 hr" />
      </div>
    </div>
  )
}

export default ActiveDelivery