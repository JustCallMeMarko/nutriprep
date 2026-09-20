import DeliveryCard from "../../features/delivery/components/DeliveryCard"
import MapPanel from "../../features/delivery/components/MapPanel"
import FloatingInfoCard from "../../features/delivery/components/FloatingInfoCard"

function ActiveDelivery() {
  const handleMarkDelivered = () => {
    console.log("Marked as delivered")
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="w-full max-w-sm p-6 border-r">
        <DeliveryCard
          customerName="Naruto U."
          orderId="87000"
          address="1269 Uzumaki Residence, Konoha City, Baclaran"
          notes="Walang kanin buseng"
          status="in_transit"
          onMarkDelivered={handleMarkDelivered}
        />
      </div>

      <div className="relative flex-1">
        <MapPanel />
        <FloatingInfoCard customerName="Naruto Uzumaki" distance="5.8 km" eta="1 hr" />
      </div>
    </div>
  )
}

export default ActiveDelivery