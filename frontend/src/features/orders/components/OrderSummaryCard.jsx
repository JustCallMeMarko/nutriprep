function OrderSummaryCard({ items }) {
  return (
    <div className="bg-gray-100 rounded-xl p-5">
      <h3 className="text-xl font-bold mb-3">Order Summary</h3>
      <div className="divide-y divide-gray-300">
        {items.map((item, index) => (
          <div key={index} className="py-2">
            <p className="text-base">{item.name}</p>
            <p className="text-sm text-gray-500">{item.details}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderSummaryCard