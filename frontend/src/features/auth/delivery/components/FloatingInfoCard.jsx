function FloatingInfoCard({ customerName, distance, eta }) {
    return (
        <>
        <div className="absolute top-4 left-4 right-4 bg-white rounded-xl shadow-md flex justify-between px-6 py-3">
            <div>
                <p className="text-xs text-gray-400">Customer</p>
                <p className="font-semibold">{customerName}</p>
            </div>
            <div>
                <p className="text-xs text-gray-400">Distance</p>
                <p className="font-semibold">{distance}</p>
            </div>
            <div>
                <p className="text-xs text-gray-400">ETA</p>
                <p className="font-semibold">{eta}</p>
            </div>
        </div>
        </>
    )
}

export default FloatingInfoCard