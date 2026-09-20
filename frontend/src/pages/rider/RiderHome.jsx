import DeliveryRequestCard from "../../features/delivery/components/DeliveryRequestCard"
import MapPanel from "../../features/delivery/components/MapPanel"
import FloatingInfoCard from "../../features/delivery/components/FloatingInfoCard"

function RiderHome() {
  const handleAccept = () => {
    console.log("Delivery accepted")
  }

  return (
    <div>
      <div className="border-b bg-gray-200 px-6 py-4">
        <h1 className="text-3xl font-bold">Deliveries</h1>
      </div>

      <div className="flex h-[calc(100vh-140px)]">
        <div className="w-full max-w-md p-6">
          <DeliveryRequestCard
            customerName="Zilong Martinez"
            estimatedTime="1hr"
            pickupLocation="Bldg. 147, Quezon City"
            pickupDetails="2 Meals | High Protein"
            dropoffLocation="SM North, Quezon City"
            onAccept={handleAccept}
          />
        </div>

        <div className="relative flex-1 bg-gray-200">
          <MapPanel />
          <FloatingInfoCard customerName="Zilong Martinez" distance="5.8 km" eta="1 hr" />
        </div>
      </div>
    </div>
  )
}

export default RiderHome