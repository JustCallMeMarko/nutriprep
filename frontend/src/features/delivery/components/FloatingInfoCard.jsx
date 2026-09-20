function FloatingInfoCard({ customerName, distance, eta }) {
    return (
        <>
        <div className="absolute left-3 right-3 top-3 grid grid-cols-[minmax(0,1.5fr)_minmax(0,0.75fr)_minmax(0,0.75fr)] gap-3 rounded-xl bg-white px-3 py-2 shadow-md sm:left-4 sm:right-4 sm:top-4 sm:px-6 sm:py-3">
            <div className="min-w-0">
                <p className="text-xs text-gray-400">Customer</p>
                <p className="wrap-break-word font-semibold">{customerName}</p>
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-400">Distance</p>
                <p className="wrap-break-word font-semibold">{distance}</p>
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-400">ETA</p>
                <p className="wrap-break-word font-semibold">{eta}</p>
            </div>
        </div>
        </>
    )
}

export default FloatingInfoCard