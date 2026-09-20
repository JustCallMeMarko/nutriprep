import { useNavigate } from "react-router-dom"
import OrderConfirmationCard from "../../features/orders/components/OrderConfirmationCard"

function OrderConfirmation() {
  const navigate = useNavigate()

  return (
    <div className="bg-gray-200 min-h-[calc(100vh-88px)] flex items-center justify-center py-10">
      <OrderConfirmationCard
        orderId="87000"
        estimatedArrival="Your order will arrive within 1-2 hours."
        deliveryAddress="1269 Uzumaki Residence, Konoha City, Baclaran"
        orderItems={[
          { name: "High Protein Meal", details: "2 pax | Chicken Breast Meal" },
        ]}
        onMakeAnotherPurchase={() => navigate("/client/meals")}
        onBackToHome={() => navigate("/client")}
      />
    </div>
  )
}

export default OrderConfirmation