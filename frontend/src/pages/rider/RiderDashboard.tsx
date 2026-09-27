import {
  Bike,
  CheckCircle2,
  MapPin,
  Package,
  Phone,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function RiderDashboard() {

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-[#1B1B1B]">
            Courier Deliveries
          </h1>
          <p className="text-sm text-[#4C4546] mt-0.5">
            Active meal drops, optimized delivery routes, and customer dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-600 text-white font-bold text-xs py-1 px-3 rounded-full">
            ● Active On-Duty
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-[#E2E2E2] bg-white flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Assigned Stops
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">4 Active</p>
            <p className="text-xs text-blue-600 mt-0.5">Lunch Dispatch Wave</p>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <Package size={20} />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-[#E2E2E2] bg-white flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Completed Today
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">8 Drops</p>
            <p className="text-xs text-emerald-600 mt-0.5">100% On-Time</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-[#E2E2E2] bg-white flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Today's Payout
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">₱1,250</p>
            <p className="text-xs text-amber-600 mt-0.5">+₱300 Peak Incentive</p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <Bike size={20} />
          </div>
        </div>
      </div>

      {/* Active Stops List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Current Delivery Queue</h2>

        <div className="space-y-3">
          {[
            {
              id: "ORD-9401",
              customer: "Theo Crain",
              address: "Unit 14B, One Serendra, BGC, Taguig",
              phone: "+63 917 555 0192",
              meals: "2x High-Protein Chicken Bowls",
              slot: "12:00 PM – 1:00 PM",
              status: "Out for Delivery",
            },
            {
              id: "ORD-9402",
              customer: "Elena Rodriguez",
              address: "8th Floor, Net Park Building, 5th Ave, BGC",
              phone: "+63 920 555 0831",
              meals: "1x Keto Salmon Greens",
              slot: "12:30 PM – 1:30 PM",
              status: "Out for Delivery",
            },
          ].map((drop) => (
            <div
              key={drop.id}
              className="p-5 rounded-xl border border-[#E2E2E2] bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {drop.id}
                  </Badge>
                  <span className="font-bold text-base text-foreground">
                    {drop.customer}
                  </span>
                  <Badge className="bg-blue-600 text-white text-[10px]">
                    {drop.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin size={13} className="text-blue-600 shrink-0" />
                  {drop.address}
                </p>
                <p className="text-xs text-slate-700 font-medium">
                  {drop.meals} • Window: {drop.slot}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer text-xs flex-1 md:flex-none gap-1.5"
                >
                  <Phone size={13} />
                  Call
                </Button>
                <Button
                  size="sm"
                  className="cursor-pointer text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex-1 md:flex-none gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  Mark Delivered
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
