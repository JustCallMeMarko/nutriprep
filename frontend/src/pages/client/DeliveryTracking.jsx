import {
  User,
  Locate,
  MapPin,
  Plus,
  Minus,
  Maximize2,
  MessageSquare,
  Phone,
  Star,
  Check,
} from "lucide-react";

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
  .font-montserrat { font-family: 'Montserrat', sans-serif; }
`;

const statusSteps = [
  {
    title: "Order Prepared",
    subtitle: "13:15 · Kitchen A",
    state: "done",
  },
  {
    title: "Driver Picked Up",
    subtitle: "13:45 · Hub Central",
    state: "done",
  },
  {
    title: "On The Way",
    subtitle: "Current location: Aguinaldo Highway",
    state: "current",
  },
  {
    title: "Delivery",
    subtitle: "Est. 14:30 · Office Lobby",
    state: "upcoming",
  },
];

const summaryItems = [
  { name: "Keto Salmon Bowl", note: "No onions, extra sauce", qty: "x1" },
  { name: "Green Detox Juice", note: "Cold", qty: "x2" },
];

function StatusStep({ step, isLast }) {
  const isDone = step.state === "done";
  const isCurrent = step.state === "current";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2"
          style={{
            backgroundColor: isDone ? "#306FE6" : "#FFFFFF",
            borderColor: isDone || isCurrent ? "#306FE6" : "#D9D9D9",
          }}
        >
          {isDone && <Check size={12} className="text-white" strokeWidth={3} />}
          {isCurrent && (
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#306FE6" }}
            />
          )}
        </div>
        {!isLast && (
          <div
            className="w-0.5 flex-1 my-1"
            style={{
              backgroundColor: isDone ? "#306FE6" : "#E2E2E2",
              minHeight: "24px",
            }}
          />
        )}
      </div>
      <div className="pb-6">
        <p
          className="text-sm font-bold"
          style={{ color: isCurrent ? "#306FE6" : "#1B1B1B" }}
        >
          {step.title}
        </p>
        <p className="text-xs text-[#4C4546] mt-0.5">{step.subtitle}</p>
      </div>
    </div>
  );
}

function MapPanel() {
  return (
    <div
      className="relative w-full h-[300px] rounded overflow-hidden border border-[#E2E2E2]"
      style={{ backgroundColor: "#E9EBEE" }}
    >
      <svg
        viewBox="0 0 500 300"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="500" height="300" fill="#E9EBEE" />
        <rect x="0" y="0" width="500" height="300" fill="#EDEFF1" />
        <rect x="60" y="0" width="18" height="300" fill="#DCDFE3" />
        <rect x="230" y="0" width="14" height="300" fill="#DCDFE3" />
        <rect x="0" y="70" width="500" height="14" fill="#DCDFE3" />
        <rect x="0" y="190" width="500" height="16" fill="#DCDFE3" />
        <path
          d="M40 250 L90 250 L90 150 L180 150 L180 100 L260 100 L260 60 L360 60 L360 130 L420 130"
          fill="none"
          stroke="#3A3A3A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {[
          [40, 250],
          [90, 150],
          [180, 150],
          [180, 100],
          [260, 100],
          [260, 60],
          [360, 60],
          [360, 130],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="4" fill="#3A3A3A" />
        ))}
        <circle cx="40" cy="250" r="7" fill="#1B1B1B" />
        <circle cx="420" cy="130" r="7" fill="#1B1B1B" />
      </svg>

      {/* Tracking live badge */}
      <div
        className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded shadow"
        style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
      >
        <Locate size={14} className="text-[#306FE6]" />
        <span className="text-xs font-bold text-[#1B1B1B]">Tracking Live</span>
      </div>

      {/* Info overlay */}
      <div
        className="absolute top-11 left-3 px-3 py-2 rounded text-[10px] leading-[14px] text-[#4C4546] shadow"
        style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
      >
        <p className="font-bold text-[#1B1B1B]">Current Route</p>
        <p>Order #493-192</p>
        <p>Driver: Alex R.</p>
        <p>ETA: 14:32</p>
        <p>Status: In Transit</p>
        <div className="mt-1">
          <p>Route Progress 74% Complete</p>
          <div
            className="w-full h-1 mt-1 rounded"
            style={{ backgroundColor: "#E2E2E2" }}
          >
            <div
              className="h-1 rounded"
              style={{ width: "74%", backgroundColor: "#306FE6" }}
            />
          </div>
        </div>
      </div>

      {/* Origin marker */}
      <div className="absolute" style={{ left: "10%", bottom: "12%" }}>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium shadow"
          style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
        >
          <MapPin size={12} className="text-[#1B1B1B]" />
          1245 Industrial Blvd
        </div>
      </div>

      {/* Destination marker */}
      <div className="absolute" style={{ right: "16%", top: "22%" }}>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium shadow"
          style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
        >
          <MapPin size={12} className="text-[#1B1B1B]" />
          47 Maple Avenue
        </div>
      </div>

      {/* Expand */}
      <button
        className="absolute top-3 right-3 w-6 h-6 rounded flex items-center justify-center shadow cursor-pointer"
        style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
      >
        <Maximize2 size={12} className="text-[#1B1B1B]" />
      </button>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex flex-col rounded shadow overflow-hidden">
        <button
          className="w-6 h-6 flex items-center justify-center cursor-pointer border-b border-[#E2E2E2]"
          style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
        >
          <Plus size={12} className="text-[#1B1B1B]" />
        </button>
        <button
          className="w-6 h-6 flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
        >
          <Minus size={12} className="text-[#1B1B1B]" />
        </button>
      </div>
    </div>
  );
}

export default function DeliveryTrackingWeb() {
  return (
    <div
      className="min-h-screen w-full font-montserrat"
      style={{ backgroundColor: "#F9F9F9" }}
    >
      <style>{FONT_STYLE}</style>

      {/* Top nav */}
      <header
        className="flex items-center justify-between px-16 h-16 border-b border-[#000] sticky top-0 z-10"
        style={{ backgroundColor: "#F9F9F9" }}
      >
        <p className="text-xl font-bold tracking-[-0.05em]">NUTRIPREP</p>
        <div className="flex items-center gap-8">
          <nav className="flex items-center gap-8">
            <p className="text-sm font-medium text-[#4C4546]">Macros</p>
            <div className="pb-4 pt-4 border-b-2 border-[#1B1B1B]">
              <p className="text-sm font-bold text-[#1B1B1B]">Delivery</p>
            </div>
          </nav>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#1B1B1B" }}
          >
            <User size={18} className="text-white" />
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-16 py-8 flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-black">Active Delivery</h1>
          <p className="text-sm text-[#4C4546]">
            Order #NP-8472-B · Estimated Arrival: 14:30
          </p>
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-6 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <div className="p-4 rounded border border-[#E2E2E2] bg-white">
              <MapPanel />
            </div>

            <div className="flex items-center justify-between p-6 rounded border border-[#E2E2E2] bg-white">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#E2E2E2" }}
                >
                  <User size={22} className="text-[#4C4546]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1B1B1B]">Marcus T.</p>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-[#306FE6] fill-[#306FE6]" />
                    <span className="text-xs text-[#4C4546]">
                      4.9 (124 Deliveries)
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-sm border border-[#D9D9D9] text-sm font-bold text-[#1B1B1B] cursor-pointer"
                  style={{ backgroundColor: "#F9F9F9" }}
                >
                  <MessageSquare size={14} />
                  Message
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-bold text-white cursor-pointer"
                  style={{ backgroundColor: "#306FE6" }}
                >
                  <Phone size={14} />
                  Call
                </button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <div className="p-6 rounded border border-[#E2E2E2] bg-white">
              <h2 className="text-lg font-bold text-black mb-4">Status</h2>
              <div>
                {statusSteps.map((step, i) => (
                  <StatusStep
                    key={step.title}
                    step={step}
                    isLast={i === statusSteps.length - 1}
                  />
                ))}
              </div>
            </div>

            <div className="p-6 rounded border border-[#E2E2E2] bg-white">
              <h2 className="text-lg font-bold text-black mb-4">Summary</h2>
              <div className="flex flex-col">
                {summaryItems.map((item, i) => (
                  <div
                    key={item.name}
                    className="flex items-start justify-between py-3"
                    style={{
                      borderTop: i === 0 ? "none" : "1px solid #E2E2E2",
                    }}
                  >
                    <div>
                      <p className="text-sm font-bold text-[#1B1B1B]">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#4C4546]">{item.note}</p>
                    </div>
                    <span className="text-sm text-[#4C4546]">{item.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}