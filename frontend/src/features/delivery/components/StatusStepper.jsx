const steps = [
    { key: "picked_up", label: "Order is Picked Up"},
    { key: "in_transit", label: "In Transit"},
    { key: "delivered", label: "Delivered" },
]

function StatusStepper({ currentStatus }) {
    const currentIndex = steps.findIndex((s) => s.key === currentStatus)

   return (
    <div className="flex items-center justify-between my-4">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                index <= currentIndex ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              {index < currentIndex ? "✓" : index === currentIndex ? "●" : ""}
            </div>
            <span className="mt-1 min-w-0 px-1 text-center text-[10px] text-gray-500 wrap-break-word">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 ${index < currentIndex ? "bg-blue-600" : "bg-gray-300"}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default StatusStepper