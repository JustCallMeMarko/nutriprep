import * as React from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
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
  Store,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

// Types
interface DeliveryStop {
  id: string
  orderId: string
  customerName: string
  customerPhone: string
  address: string
  district: string
  mealsCount: number
  mealSummary: string
  slot: string
  payout: number
  notes?: string
  lat: number
  lng: number
  status: "in_transit" | "delivered" | "pending"
}

// Hub Location: NutriPrep Kitchen
const KITCHEN_HUB = {
  name: "NutriPrep Central Kitchen",
  address: "32nd St & 5th Ave, Bonifacio Global City, Taguig",
  lat: 14.5518,
  lng: 121.0485,
}

// Mock Active Stops in BGC / Makati area
const INITIAL_STOPS: DeliveryStop[] = [
  {
    id: "stop-1",
    orderId: "ORD-9401",
    customerName: "Theo Crain",
    customerPhone: "+63 917 555 0192",
    address: "Unit 14B, One Serendra, 32nd St, BGC, Taguig",
    district: "BGC / Taguig",
    mealsCount: 2,
    mealSummary: "2x Grilled Chicken Quinoa Bowl",
    slot: "11:30 AM – 12:30 PM",
    payout: 160,
    notes: "Call on arrival at the lobby entrance.",
    lat: 14.5502,
    lng: 121.0545,
    status: "in_transit",
  },
  {
    id: "stop-2",
    orderId: "ORD-9402",
    customerName: "Elena Rodriguez",
    customerPhone: "+63 920 555 0831",
    address: "8th Floor, Net Park Building, 5th Ave, BGC",
    district: "BGC / Taguig",
    mealsCount: 2,
    mealSummary: "1x Avocado & Salmon Keto Bowl, 1x Chia Greek Yogurt",
    slot: "12:00 PM – 1:00 PM",
    payout: 180,
    notes: "Leave at front desk with building security.",
    lat: 14.5475,
    lng: 121.0482,
    status: "pending",
  },
  {
    id: "stop-3",
    orderId: "ORD-9407",
    customerName: "Arthur Parris",
    customerPhone: "+63 917 555 0712",
    address: "Unit 1904, Arthaland Century Pacific Tower, 5th Ave, BGC",
    district: "BGC / Taguig",
    mealsCount: 1,
    mealSummary: "1x Beef & Greens Stir-Fry",
    slot: "12:15 PM – 1:15 PM",
    payout: 175,
    notes: "Deliver to receptionist at level 19.",
    lat: 14.5539,
    lng: 121.0498,
    status: "pending",
  },
]

// Custom HTML Pin Icons
const createKitchenIcon = () => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `
      <div class="flex items-center justify-center w-10 h-10 bg-amber-600 text-white rounded-full shadow-lg border-2 border-white ring-2 ring-amber-600/30 font-bold">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  })
}

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
  const [stops, setStops] = React.useState<DeliveryStop[]>(INITIAL_STOPS)
  const [selectedStopId, setSelectedStopId] = React.useState<string>(INITIAL_STOPS[0].id)

  const activeStop = stops.find((s) => s.id === selectedStopId) || stops[0]
  const completedCount = stops.filter((s) => s.status === "delivered").length
  const totalCount = stops.length

  const handleMarkDelivered = (id: string) => {
    setStops((prev) => {
      const updated = prev.map((s) =>
        s.id === id ? { ...s, status: "delivered" as const } : s
      )
      // Automatically advance to the next pending stop if available
      const nextPending = updated.find((s) => s.status === "pending")
      if (nextPending) {
        nextPending.status = "in_transit"
        setSelectedStopId(nextPending.id)
      }
      return [...updated]
    })
  }

  // Generate route coordinates for the polyline
  const routePoints: [number, number][] = [
    [KITCHEN_HUB.lat, KITCHEN_HUB.lng],
    ...stops.map((s) => [s.lat, s.lng] as [number, number]),
  ]

  const activeCenter: [number, number] = [activeStop.lat, activeStop.lng]

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
            Batch #729
          </Badge>
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
                Live Route Overview (BGC Delivery Zone)
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

              {/* Central Hub Marker */}
              <Marker
                position={[KITCHEN_HUB.lat, KITCHEN_HUB.lng]}
                icon={createKitchenIcon()}
              >
                <Popup>
                  <div className="p-1 text-slate-900">
                    <p className="font-bold text-sm text-amber-700">{KITCHEN_HUB.name}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{KITCHEN_HUB.address}</p>
                    <span className="inline-block mt-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      Starting Hub & Dispatch Point
                    </span>
                  </div>
                </Popup>
              </Marker>

              {/* Delivery Stop Markers */}
              {stops.map((stop, idx) => (
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
              ))}

              {/* Route Path Line */}
              <Polyline
                positions={routePoints}
                pathOptions={{
                  color: "#2563eb",
                  weight: 4,
                  dashArray: "8, 8",
                  opacity: 0.8,
                }}
              />
            </MapContainer>

            {/* Map Floating Legend */}
            <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3 shadow-md text-xs space-y-1.5 font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-600 inline-block"></span>
                <span>Central Kitchen Dispatch</span>
              </div>
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
                  In Progress
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
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeStop.lat},${activeStop.lng}`}
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
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 flex items-center justify-center gap-2 cursor-pointer rounded-xl shadow-xs transition-all"
                >
                  <CheckCircle2 size={18} />
                  Mark as Delivered
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
              {/* Hub start */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <Store size={16} className="text-amber-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">Central Kitchen Hub</p>
                  <p className="text-slate-500 truncate">Pickup completed</p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-white font-bold">Origin</Badge>
              </div>

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

