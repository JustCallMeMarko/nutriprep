import StatusStepper from "./StatusStepper";

function DeliveryCard({ customerName, orderID, address, notes, status, onMarkDelivered}) {
    return (
        <>
        <div className="bg-white rounded-x1 shadow-md p-6 w-full max-w-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm text-gray-400">Customer</p>
                    <h2 className="text-x1 font-semibold">{customerName}</h2>
                </div>
                <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">#{orderID}</span>
            </div>

            <p className="text-sm text-gray-600 mb-4">📍 {address}</p>

        {notes && (
            <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-gray-500 mb-1">🟡 Customer Notes:</p>
                <p className="text-sm text-gray-700">{notes}</p>
            </div>
        )}

        <StatusStepper currentStatus={status} />

        <button onClick={onMarkDelivered} className="mt-4 w-full border border-blue-600 text-blue-600 rounded-lg py-2 font-medium hover:bg-blue-50">
            Mark as Delivered
        </button>
        </div>
        </>
    )
}

export default DeliveryCard;