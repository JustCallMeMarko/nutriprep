import { Truck, MapPin } from "lucide-react"

function DeliveryInfoCard({ estimatedArrival, address }) {
  return (
    <div className="bg-gray-100 rounded-xl divide-y divide-gray-300">
      <div className="flex items-start gap-4 p-5">
        <Truck className="w-8 h-8 text-black shrink-0" />
        <div>
          <p className="text-lg font-medium">Delivery Schedule</p>
          <p className="text-sm font-bold mt-1">{estimatedArrival}</p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-5">
        <MapPin className="w-8 h-8 text-black shrink-0" />
        <div>
          <p className="text-lg font-medium">Delivery Address</p>
          <p className="text-sm mt-1">{address}</p>
        </div>
      </div>
    </div>
  )
}

export default DeliveryInfoCard