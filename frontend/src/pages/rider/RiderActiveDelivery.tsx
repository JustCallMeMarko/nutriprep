import * as React from "react"
import { useSearchParams } from "react-router-dom"
import {
  MapContainer,
  TileLayer,
  Marker,
  CircleMarker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  Utensils,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "cn"
import { useApi } from "@/lib/api"

// Types
interface DeliveryStop {
  id: string
  orderId: string
  customerName: string
  customerPhone: string
  address: string
  district: string
  mealsCount: number
  credits: number
  mealSummary: string
  slot: string
  payout: number
  notes?: string
  lat: number | null
  lng: number | null
  orderDatabaseId?: number
  status: "in_transit" | "delivered" | "pending"
}

// Custom HTML Pin Icons
const createStopIcon = (
  stopNumber: number,
  status: "in_transit" | "delivered" | "pending"
) => {
  let bgClass = "bg-blue-600"
  let ringClass = "ring-blue-500/30"
  if (status === "delivered") {
    bgClass = "bg-emerald-600"
    ringClass = "ring-emerald-500/30"
  } else if (status === "in_transit") {
    bgClass = "bg-blue-600 animate-bounce"
    ringClass = "ring-blue-600/50"
  } else {
    bgClass = "bg-slate-700"
    ringClass = "ring-slate-700/20"
  }

  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `
      <div class="relative flex items-center justify-center w-9 h-9 ${bgClass} text-white rounded-full shadow-lg border-2 border-white ring-2 ${ringClass} font-extrabold text-sm">
        ${status === "delivered" ? "✓" : stopNumber}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

// Map center adjuster component
function MapFocusHandler({ center }: { center: [number, number] }) {
  const map = useMap()
  React.useEffect(() => {
    map.flyTo(center, 15, { duration: 1.2 })
  }, [center, map])
  return null
}

export default function RiderActiveDelivery() {
  const { makeRequest } = useApi()
  const [searchParams] = useSearchParams()
  const [stops, setStops] = React.useState<DeliveryStop[]>([])
  const [selectedStopId, setSelectedStopId] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isAvailable, setIsAvailable] = React.useState(false)
  const [riderLocation, setRiderLocation] = React.useState<[number, number] | null>(null)
  const [locationMessage, setLocationMessage] = React.useState<string | null>(null)

  const loadDeliveries = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const deliveries = await makeRequest("deliveries") as DeliveryStop[]
      setStops(deliveries)
      const requestedStopId = searchParams.get("stop")
      setSelectedStopId((current) =>
        requestedStopId && deliveries.some((stop) => stop.id === requestedStopId)
          ? requestedStopId
          : current && deliveries.some((stop) => stop.id === current)
          ? current
          : deliveries.find((stop) => stop.status !== "delivered")?.id ?? deliveries[0]?.id ?? null
      )
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load deliveries.")
    } finally {
      setIsLoading(false)
    }
  }, [makeRequest, searchParams])

  React.useEffect(() => {
    void loadDeliveries()
  }, [loadDeliveries])

  React.useEffect(() => {
    void makeRequest("status").then((status: { available: boolean; location?: { lat: number; lng: number } | null }) => {
      setIsAvailable(status.available)
      if (status.location) setRiderLocation([status.location.lat, status.location.lng])
    }).catch(() => undefined)
  }, [makeRequest])

  React.useEffect(() => {
    if (!navigator.geolocation) {
      setLocationMessage("This browser does not support location tracking.")
      return
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: [number, number] = [position.coords.latitude, position.coords.longitude]
        setRiderLocation(location)
        setLocationMessage(null)
        void makeRequest("location", {
          method: "PATCH",
          body: JSON.stringify({ lat: location[0], lng: location[1] }),
        }).catch(() => setLocationMessage("Location could not be synced with dispatch."))
      },
      () => setLocationMessage("Allow location access to share your live position with dispatch."),
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 },
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [makeRequest])

  const toggleAvailability = async () => {
    const nextValue = !isAvailable
    await makeRequest("status", {
      method: "PATCH",
      body: JSON.stringify({ available: nextValue }),
    })
    setIsAvailable(nextValue)
  }

  const activeStop = stops.find((s) => s.id === selectedStopId) ?? stops[0]
  const completedCount = stops.filter((s) => s.status === "delivered").length
  const totalCount = stops.length

  const handleMarkDelivered = async (id: string) => {
    setIsUpdating(true)
    setError(null)
    try {
      await makeRequest(`deliveries/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "delivered" }),
      })
      await loadDeliveries()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update delivery.")
    } finally {
      setIsUpdating(false)
    }
  }

  // Generate route coordinates for the polyline
  const mappedStops = stops.filter(
    (stop): stop is DeliveryStop & { lat: number; lng: number } =>
      stop.lat !== null && stop.lng !== null
  )
  const routePoints: [number, number][] = mappedStops.map((stop) => [stop.lat, stop.lng])
  const hasMapLocation = mappedStops.length > 0 || riderLocation !== null

  const activeCenter: [number, number] = activeStop?.lat !== null && activeStop?.lat !== undefined &&
    activeStop?.lng !== null && activeStop?.lng !== undefined
    ? [activeStop.lat, activeStop.lng]
    : mappedStops.length > 0
    ? [mappedStops[0].lat, mappedStops[0].lng]
    : riderLocation ?? [14.5995, 120.9842]

  if (isLoading) {
    return (
      <section className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <RefreshCw size={16} className="animate-spin" />
          Loading your active deliveries...
        </div>
      </section>
    )
  }

  if (error && stops.length === 0) {
    return (
      <section className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert size={32} className="text-rose-600" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Could not load deliveries</h1>
          <p className="mt-1 max-w-md text-sm text-slate-600">{error}</p>
        </div>
        <Button onClick={() => void loadDeliveries()} className="bg-blue-600 font-bold text-white hover:bg-blue-700">
          Try again
        </Button>
      </section>
    )
  }

  if (!activeStop) {
    return (
      <section className="flex min-h-[420px] flex-col items-center justify-center gap-2 text-center">
        <CheckCircle2 size={36} className="text-emerald-600" />
        <h1 className="text-2xl font-extrabold text-slate-900">No active deliveries</h1>
        <p className="text-sm text-slate-600">Newly assigned deliveries will appear here.</p>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6 w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-slate-900 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Active Delivery Route
          </h1>
          <p className="text-base font-medium text-slate-600 mt-1">
            Live interactive GPS map, route stops, and fulfillment controls.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Badge className="bg-blue-600 text-white font-bold text-sm py-1.5 px-4 rounded-full shadow-xs">
            {completedCount}/{totalCount} Completed
          </Badge>
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 font-semibold text-sm py-1.5 px-3 rounded-full flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-600" />
            {stops.reduce((total, stop) => total + stop.credits, 0).toLocaleString()} credits
          </Badge>
          <Button onClick={() => void toggleAvailability()} variant="outline" className="font-bold">
            {isAvailable ? "Available" : "Offline"}
          </Button>
        </div>
      </div>

      {/* Main Grid: Map on Left / Top, Action Cards on Right / Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Container */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation size={18} className="text-blue-400" />
              <span className="text-sm font-bold uppercase tracking-wider">
                Live Route Overview
              </span>
            </div>
            <span className="text-xs text-slate-300 font-medium bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
              OpenStreetMap Engine
            </span>
          </div>

          {/* Leaflet Map Frame */}
          <div className="relative w-full h-[400px] sm:h-[500px] z-0">
            <MapContainer
              center={activeCenter}
              zoom={14}
              scrollWheelZoom={true}
              className="w-full h-full"
              style={{ minHeight: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapFocusHandler center={activeCenter} />
              {riderLocation && (
                <CircleMarker center={riderLocation} radius={9} pathOptions={{ color: "#0f766e", fillColor: "#14b8a6", fillOpacity: 1 }}>
                  <Popup>Your live rider location</Popup>
                </CircleMarker>
              )}

              {/* Delivery Stop Markers */}
              {mappedStops.map((stop) => {
                const idx = stops.findIndex((item) => item.id === stop.id)
                return (
                <Marker
                  key={stop.id}
                  position={[stop.lat, stop.lng]}
                  icon={createStopIcon(idx + 1, stop.status)}
                  eventHandlers={{
                    click: () => setSelectedStopId(stop.id),
                  }}
                >
                  <Popup>
                    <div className="p-1 text-slate-900 min-w-[180px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-sm text-blue-600">
                          Stop #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-emerald-600">
                          +₱{stop.payout}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-sm mt-1">{stop.customerName}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{stop.address}</p>
                      <p className="text-xs text-slate-700 font-semibold mt-1 flex items-center gap-1">
                        <Clock size={12} /> {stop.slot}
                      </p>
                    </div>
                  </Popup>
                </Marker>
                )
              })}

              {/* Route Path Line */}
              {routePoints.length > 1 && (
                <Polyline
                  positions={routePoints}
                  pathOptions={{
                    color: "#2563eb",
                    weight: 4,
                    dashArray: "8, 8",
                    opacity: 0.8,
                  }}
                />
              )}
            </MapContainer>
            {locationMessage && (
              <div className="absolute top-3 left-3 right-3 z-[400] rounded-lg border border-amber-200 bg-amber-50/95 px-3 py-2 text-xs font-semibold text-amber-900">
                {locationMessage}
              </div>
            )}
            {!hasMapLocation && (
              <div className="absolute inset-0 z-[350] flex items-center justify-center bg-slate-900/70 p-6 text-center text-sm font-semibold text-white">
                Delivery coordinates are not available yet. The address and GPS controls remain available below.
              </div>
            )}

            {/* Map Floating Legend */}
            <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3 shadow-md text-xs space-y-1.5 font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block"></span>
                <span>Active Delivery Destination</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 inline-block"></span>
                <span>Delivered Order</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel & Stops List */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          {/* Active Stop Detail Card */}
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-md">
                  {activeStop.orderId}
                </Badge>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Stop
                </span>
              </div>

              {activeStop.status === "delivered" ? (
                <Badge className="bg-emerald-600 text-white font-bold text-xs py-1 px-2.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  Delivered
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs py-1 px-2.5 rounded-md">
                  {activeStop.status === "in_transit" ? "In Progress" : "Pending"}
                </Badge>
              )}
            </div>

            {/* Customer Details */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {activeStop.customerName}
                </h2>
                <span className="text-lg font-extrabold text-emerald-600">
                  +₱{activeStop.payout}
                </span>
              </div>

              <div className="flex items-start gap-2 text-sm text-slate-700">
                <MapPin size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{activeStop.address}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 pt-1">
                <Clock size={15} className="text-slate-500" />
                <span className="font-semibold text-slate-700">{activeStop.slot}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-2">
                <Utensils size={16} className="text-blue-600 shrink-0" />
                <span className="font-medium text-xs sm:text-sm">{activeStop.mealSummary}</span>
              </div>
              <div className="text-xs font-semibold text-slate-600">
                {activeStop.credits.toLocaleString()} order credits · ₱30 per credit
              </div>

              {activeStop.notes && (
                <div className="text-xs text-amber-900 bg-amber-50/80 border border-amber-200 p-2.5 rounded-xl flex items-start gap-1.5 mt-2">
                  <ShieldAlert size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Drop Note:</strong> {activeStop.notes}</span>
                </div>
              )}
            </div>

            {/* Rider Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${activeStop.customerPhone.replace(/\s+/g, "")}`}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full font-bold text-xs sm:text-sm border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1.5 py-2.5 cursor-pointer rounded-xl h-auto"
                  )}
                >
                  <Phone size={15} className="text-emerald-600" />
                  Call Customer
                </a>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeCenter[0]},${activeCenter[1]}`}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full font-bold text-xs sm:text-sm border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1.5 py-2.5 cursor-pointer rounded-xl h-auto"
                  )}
                >
                  <ExternalLink size={15} className="text-blue-600" />
                  Open GPS
                </a>
              </div>

              {activeStop.status !== "delivered" ? (
                <Button
                  onClick={() => handleMarkDelivered(activeStop.id)}
                  disabled={isUpdating}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 flex items-center justify-center gap-2 cursor-pointer rounded-xl shadow-xs transition-all"
                >
                  {isUpdating ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {isUpdating ? "Updating..." : "Mark as Delivered"}
                </Button>
              ) : (
                <div className="w-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={16} /> Order Completed Successfully
                </div>
              )}
            </div>
          </div>

          {/* Stops Queue / Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-3 flex items-center justify-between">
              <span>Route Sequence</span>
              <span className="text-xs font-semibold text-slate-500 lowercase">
                {stops.length} stops
              </span>
            </h3>

            <div className="space-y-2">
              {/* Drops */}
              {stops.map((stop, idx) => {
                const isSelected = stop.id === activeStop.id
                return (
                  <button
                    key={stop.id}
                    type="button"
                    onClick={() => setSelectedStopId(stop.id)}
                    className={`w-full text-left flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0 ${
                          stop.status === "delivered"
                            ? "bg-emerald-600"
                            : isSelected
                            ? "bg-blue-600"
                            : "bg-slate-700"
                        }`}
                      >
                        {stop.status === "delivered" ? "✓" : idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">
                          {stop.customerName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{stop.district}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-emerald-600">
                        ₱{stop.payout}
                      </span>
                      <ChevronRight size={16} className={isSelected ? "text-blue-600" : "text-slate-400"} />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
