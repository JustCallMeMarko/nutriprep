import { Check } from "lucide-react"
import DeliveryInfoCard from "./DeliveryInfoCard"
import OrderSummaryCard from "./OrderSummaryCard"

function OrderConfirmationCard({
  orderId,
  estimatedArrival,
  deliveryAddress,
  orderItems,
  onMakeAnotherPurchase,
  onBackToHome,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg max-w-xl w-full mx-auto p-10">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-4">
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </div>
        <h1 className="text-2xl font-bold">Order Confirmed!</h1>
        <p className="text-blue-600 font-bold text-lg">#{orderId}</p>
        <p className="text-gray-400 text-sm mt-1">Thank you for trusting NutriPrep Meals!</p>
      </div>

      <div className="space-y-4">
        <DeliveryInfoCard estimatedArrival={estimatedArrival} address={deliveryAddress} />
        <OrderSummaryCard items={orderItems} />
      </div>

      <div className="flex flex-col items-center gap-4 mt-6">
        <button onClick={onMakeAnotherPurchase} className="text-blue-600 font-bold hover:underline">
          Make Another Purchase
        </button>
        <button
          onClick={onBackToHome}
          className="w-full bg-blue-600 text-white rounded-xl py-4 font-bold hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}

export default OrderConfirmationCard