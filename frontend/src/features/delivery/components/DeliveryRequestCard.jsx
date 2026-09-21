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
    <div className="w-full max-w-md rounded-2xl border-2 border-blue-600 bg-gray-100 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3 text-sm font-semibold text-yellow-500">
        <Info className="w-4 h-4" />
        Est. {estimatedTime}
      </div>

      <h2 className="mb-4 wrap-break-word text-center text-2xl font-semibold">{customerName}</h2>

      <div className="bg-blue-600 text-white rounded-xl p-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Utensils className="w-5 h-5" />
          <span className="font-medium">Pick-Up Location</span>
        </div>
        <p className="mb-1 wrap-break-word text-center text-xl font-bold">{pickupLocation}</p>
        <p className="wrap-break-word text-center text-sm">{pickupDetails}</p>
      </div>

      <div className="bg-white border border-blue-600 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-black" />
          <span className="font-medium">Drop-off Location</span>
        </div>
        <p className="wrap-break-word text-center text-xl font-bold">{dropoffLocation}</p>
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