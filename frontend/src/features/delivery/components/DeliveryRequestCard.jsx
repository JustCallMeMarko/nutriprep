import { Utensils, MapPin, Info } from "lucide-react"

function DeliveryRequestCard({
  customerName,
  estimatedTime,
  pickupLocation,
  pickupDetails,
  dropoffLocation,
  onAccept,
}) {
  return (
    <div className="bg-gray-100 border-2 border-blue-600 rounded-2xl p-6 w-full max-w-md relative">
      <div className="absolute top-4 right-4 flex items-center gap-1 text-yellow-500 text-sm font-semibold">
        <Info className="w-4 h-4" />
        Est. {estimatedTime}
      </div>

      <h2 className="text-2xl font-semibold text-center mb-4">{customerName}</h2>

      <div className="bg-blue-600 text-white rounded-xl p-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Utensils className="w-5 h-5" />
          <span className="font-medium">Pick-Up Location</span>
        </div>
        <p className="text-xl font-bold text-center mb-1">{pickupLocation}</p>
        <p className="text-sm text-center">{pickupDetails}</p>
      </div>

      <div className="bg-white border border-blue-600 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-black" />
          <span className="font-medium">Drop-off Location</span>
        </div>
        <p className="text-xl font-bold text-center">{dropoffLocation}</p>
      </div>

      <button
        onClick={onAccept}
        className="w-full bg-blue-600 text-white rounded-xl py-3 font-bold border-4 border-blue-600 hover:bg-blue-700"
      >
        Accept Delivery
      </button>
    </div>
  )
}

export default DeliveryRequestCard