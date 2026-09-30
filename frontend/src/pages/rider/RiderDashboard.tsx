import * as React from "react"
import {
  Clock,
  Hand,
  MapPin,
  Utensils,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface DeliveryOrder {
  id: string
  customerName: string
  customerPhone: string
  address: string
  district: string
  distanceKm: number
  payout: number
  wave: string
  slot: string
  mealsCount: number
  mealSummary: string
  notes?: string
  claimed: boolean
}

const INITIAL_DELIVERIES: DeliveryOrder[] = [
  {
    id: "ORD-9401",
    customerName: "Theo Crain",
    customerPhone: "+63 917 555 0192",
    address: "Unit 14B, One Serendra, 32nd St, Bonifacio Global City, Taguig",
    district: "BGC / Taguig",
    distanceKm: 2.4,
    payout: 160,
    wave: "Lunch Wave",
    slot: "11:30 AM – 12:30 PM",
    mealsCount: 2,
    mealSummary: "2x Grilled Chicken Quinoa Bowl",
    notes: "Call on arrival at the lobby entrance.",
    claimed: false,
  },
  {
    id: "ORD-9402",
    customerName: "Elena Rodriguez",
    customerPhone: "+63 920 555 0831",
    address: "8th Floor, Net Park Building, 5th Ave, BGC, Taguig",
    district: "BGC / Taguig",
    distanceKm: 3.1,
    payout: 180,
    wave: "Lunch Wave",
    slot: "12:00 PM – 1:00 PM",
    mealsCount: 2,
    mealSummary: "1x Avocado & Salmon Keto Bowl, 1x Chia Greek Yogurt",
    notes: "Leave at front desk with building security.",
    claimed: false,
  },
  {
    id: "ORD-9403",
    customerName: "Marcus Thorne",
    customerPhone: "+63 918 555 0341",
    address: "24th Floor, GT Tower International, Ayala Ave, Makati",
    district: "Makati CBD",
    distanceKm: 4.8,
    payout: 220,
    wave: "Lunch Wave",
    slot: "12:00 PM – 1:00 PM",
    mealsCount: 3,
    mealSummary: "2x Steak & Whole Egg Skillet, 1x Veggie Omelette",
    notes: "Deliver before 12:30 PM. Use service elevator.",
    claimed: false,
  },
  {
    id: "ORD-9404",
    customerName: "Shirley Crain",
    customerPhone: "+63 919 555 0284",
    address: "12 Palm Avenue, Dasmariñas Village, Makati",
    district: "Makati",
    distanceKm: 5.2,
    payout: 250,
    wave: "Lunch Wave",
    slot: "12:30 PM – 1:30 PM",
    mealsCount: 2,
    mealSummary: "2x Diabetic-Friendly Beef Tapa",
    notes: "Security guard will receive at the main village gate.",
    claimed: false,
  },
  {
    id: "ORD-9405",
    customerName: "Luke Crain",
    customerPhone: "+63 917 555 0491",
    address: "Unit 201, Two Palm Grove, Rockwell Center, Makati",
    district: "Rockwell / Makati",
    distanceKm: 3.8,
    payout: 190,
    wave: "Lunch Wave",
    slot: "11:45 AM – 12:45 PM",
    mealsCount: 1,
    mealSummary: "1x Turkey & Cheese Frittata",
    notes: "Drop package inside the mailbox container.",
    claimed: false,
  },
  {
    id: "ORD-9406",
    customerName: "Steven Crain",
    customerPhone: "+63 922 555 0928",
    address: "Penthouse 3, The Residences at Greenbelt, Makati",
    district: "Legaspi Village, Makati",
    distanceKm: 4.5,
    payout: 210,
    wave: "Lunch Wave",
    slot: "1:00 PM – 2:00 PM",
    mealsCount: 2,
    mealSummary: "2x Salmon Teriyaki & Broccoli",
    notes: "Friendly golden retriever in front yard, gate is unlocked.",
    claimed: false,
  },
  {
    id: "ORD-9407",
    customerName: "Arthur Parris",
    customerPhone: "+63 917 555 0712",
    address: "Unit 1904, Arthaland Century Pacific Tower, 5th Ave, BGC",
    district: "BGC / Taguig",
    distanceKm: 2.8,
    payout: 175,
    wave: "Lunch Wave",
    slot: "12:15 PM – 1:15 PM",
    mealsCount: 1,
    mealSummary: "1x Beef & Greens Stir-Fry",
    notes: "Deliver to receptionist at level 19.",
    claimed: false,
  },
  {
    id: "ORD-9408",
    customerName: "Eleanor Vance",
    customerPhone: "+63 918 555 0643",
    address: "Villa 7, Forbes Park North, Makati",
    district: "Makati",
    distanceKm: 4.9,
    payout: 240,
    wave: "Lunch Wave",
    slot: "12:00 PM – 1:00 PM",
    mealsCount: 3,
    mealSummary: "2x High-Protein Chicken Bowls, 1x Chia Parfait",
    notes: "Ring bell at side gate.",
    claimed: false,
  },
]

export default function RiderDashboard() {
  const [deliveries, setDeliveries] = React.useState<DeliveryOrder[]>(INITIAL_DELIVERIES)

  const handleClaim = (id: string) => {
    setDeliveries((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, claimed: true } : order
      )
    )
  }

  const availableCount = deliveries.filter((d) => !d.claimed).length

  return (
    <section className="flex flex-col gap-6 w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-slate-900 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Available Deliveries
          </h1>
          <p className="text-base font-medium text-slate-600 mt-1">
            Browse open meal dispatches and claim delivery stops on your route.
          </p>
        </div>

        {availableCount > 0 && (
          <Badge className="bg-blue-600 text-white font-bold text-sm py-1.5 px-4 rounded-full shrink-0 shadow-xs">
            {availableCount} Available
          </Badge>
        )}
      </div>

      {/* Scrollable list of cards */}
      <div className="flex flex-col gap-4">
        {deliveries.map((order) => {
          const isClaimed = order.claimed

          return (
            <div
              key={order.id}
              className={`rounded-2xl border bg-white p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 transition-all shadow-xs ${
                isClaimed ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Order Info */}
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant="outline" className="font-mono text-sm font-bold px-2.5 py-1 bg-slate-50 border-slate-300">
                    {order.id}
                  </Badge>
                  <span className="font-bold text-lg text-slate-900">
                    {order.customerName}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    • {order.district}
                  </span>
                  <span className="text-base font-extrabold text-emerald-600 ml-auto sm:ml-0 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    +₱{order.payout}
                  </span>
                </div>

                <p className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                  <MapPin size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{order.address}</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 pt-0.5">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Clock size={15} className="text-slate-500" />
                    {order.slot}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-medium text-slate-700">{order.distanceKm} km away</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Utensils size={15} className="text-blue-600" />
                    {order.mealSummary}
                  </span>
                </div>

                {order.notes && (
                  <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg italic">
                    "{order.notes}"
                  </p>
                )}
              </div>

              {/* Claim Button */}
              <div className="w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex justify-end">
                {isClaimed ? (
                  <Badge className="bg-emerald-600 text-white font-bold text-sm py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-xs">
                    <CheckCircle2 size={16} />
                    Claimed
                  </Badge>
                ) : (
                  <Button
                    onClick={() => handleClaim(order.id)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 px-6 gap-2 cursor-pointer shadow-sm rounded-xl transition-all"
                  >
                    <Hand size={16} />
                    Claim
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

