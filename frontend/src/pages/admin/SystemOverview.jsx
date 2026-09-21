import {
  Menu,
  User,
  Users,
  Wallet,
  Plus,
  UserCog,
  Megaphone,
  ArrowRight,
} from "lucide-react";

function TruckIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
  .font-montserrat { font-family: 'Montserrat', sans-serif; }
`;

const acquisitionData = [
  { day: "Mon", value: 2000, label: "2.0k" },
  { day: "Tue", value: 2700, label: "2.7k" },
  { day: "Wed", value: 1500, label: "1.5k" },
  { day: "Thu", value: 3500, label: "3.5k" },
  { day: "Fri", value: 4500, label: "4.5k", highlight: true },
  { day: "Sat", value: 3000, label: "3.0k" },
  { day: "Sun", value: 4000, label: "4.0k" },
];

const zones = [
  {
    id: "#CAV-DASMA",
    region: "Dasmariñas",
    rate: 98.5,
    time: "24 mins",
    status: "OPTIMAL",
    tone: "neutral",
  },
  {
    id: "#CAV-IMUS",
    region: "Imus",
    rate: 92.1,
    time: "42 mins",
    status: "NORMAL",
    tone: "neutral",
  },
  {
    id: "#CAV-BACOOR",
    region: "Bacoor",
    rate: 78.4,
    time: "65 mins",
    status: "WARNING",
    tone: "danger",
  },
  {
    id: "#CAV-GENTRI",
    region: "General Trias",
    rate: 85.2,
    time: "38 mins",
    status: "NORMAL",
    tone: "neutral",
  },
];

function StatusPill({ status, tone }) {
  const isDanger = tone === "danger";
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-sm border text-xs font-bold font-montserrat"
      style={{
        backgroundColor: isDanger ? "rgba(186,26,26,0.10)" : "#E2E2E2",
        borderColor: isDanger ? "rgba(186,26,26,0.30)" : "#E2E2E2",
        color: isDanger ? "#BA1A1A" : "#1B1B1B",
      }}
    >
      {status}
    </span>
  );
}

function RateBar({ rate, tone }) {
  const barColor = tone === "danger" ? "#BA1A1A" : "#306FE6";
  return (
    <div
      className="w-16 h-1 shrink-0"
      style={{ backgroundColor: "#E2E2E2" }}
    >
      <div
        className="h-1"
        style={{ width: `${rate}%`, backgroundColor: barColor }}
      />
    </div>
  );
}

export default function SystemOverviewWeb() {
  const maxValue = 5000;

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
        <div className="flex items-center gap-6">
          <button aria-label="Open menu" className="cursor-pointer">
            <Menu size={20} strokeWidth={2.5} />
          </button>
          <p className="text-2xl font-bold tracking-[-0.05em]">NUTRIPREP</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="pb-4 pt-4 border-b-2 border-[#000]">
            <p className="text-sm font-bold tracking-[0.05em]">Admin</p>
          </div>
          <User size={24} />
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-16 py-8 flex flex-col gap-8">
        {/* Title */}
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-extrabold tracking-[-0.02em] text-black">
            System Overview
          </h1>
          <p className="text-lg text-[#4C4546]">
            Real-time performance metrics and management hub.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-6">
          <div className="flex flex-col justify-between p-6 rounded border border-[#E2E2E2] bg-white">
            <div className="flex justify-between items-start pb-4">
              <p className="text-sm font-bold tracking-[0.05em] text-[#4C4546]">
                TOTAL USERS
              </p>
              <Users size={20} className="text-[#4C4546]" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[32px] font-bold tracking-[-0.01em] text-[#1B1B1B]">
                12,482
              </p>
              <p className="text-xs font-medium text-[#306FE6]">
                ↑ +8.4% vs last week
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between p-6 rounded border border-[#E2E2E2] bg-white">
            <div className="flex justify-between items-start pb-4">
              <p className="text-sm font-bold tracking-[0.05em] text-[#4C4546]">
                DAILY REVENUE
              </p>
              <Wallet size={20} className="text-[#4C4546]" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[32px] font-bold tracking-[-0.01em] text-[#1B1B1B]">
                ₱42,890
              </p>
              <p className="text-xs font-medium text-[#306FE6]">
                ↑ +12.1% vs yesterday
              </p>
            </div>
          </div>

          <div
            className="flex flex-col justify-between p-6 rounded"
            style={{ backgroundColor: "#306FE6" }}
          >
            <div className="flex justify-between items-start pb-4">
              <p className="text-sm font-bold tracking-[0.05em] text-white">
                ACTIVE DELIVERIES
              </p>
              <TruckIcon size={20} className="text-white" />
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[32px] font-bold tracking-[-0.01em] text-white">
                843
              </p>
              <div
                className="w-full h-2"
                style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
              >
                <div
                  className="h-2"
                  style={{ width: "75%", backgroundColor: "#FFFFFF" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chart + Quick actions */}
        <div className="grid grid-cols-[1fr_320px] gap-6 items-start">
          <div className="flex flex-col gap-2 p-6 rounded border border-[#E2E2E2] bg-white">
            <h2 className="text-2xl font-bold">User Acquisition Trends</h2>
            <div className="flex border-b border-[#E2E2E2] h-[272px] py-4">
              <div className="flex flex-col justify-between text-xs font-medium text-[#4C4546] w-8 h-full pb-1">
                <span>5k</span>
                <span>2.5k</span>
                <span>0</span>
              </div>
              <div className="flex items-end justify-around w-full h-full pl-2">
                {acquisitionData.map((d) => (
                  <div
                    key={d.day}
                    className="flex flex-col items-center justify-end h-full"
                  >
                    <div
                      className="flex justify-center pt-1 mb-2 rounded-sm"
                      style={{
                        backgroundColor: "#1B1B1B",
                        width: "40px",
                      }}
                    >
                      <span className="text-xs text-white px-1">
                        {d.label}
                      </span>
                    </div>
                    <div
                      className="w-8"
                      style={{
                        height: `${(d.value / maxValue) * 215}px`,
                        backgroundColor: d.highlight ? "#306FE6" : "#E2E2E2",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-around pl-10">
              {acquisitionData.map((d) => (
                <span
                  key={d.day}
                  className="text-xs font-medium text-[#4C4546] w-8 text-center"
                >
                  {d.day}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col p-6 rounded border border-[#E2E2E2] bg-white gap-4">
            <h2 className="text-2xl font-bold pb-2">Quick Actions</h2>
            <button
              className="flex items-center justify-center gap-2 py-3 px-4 text-white cursor-pointer"
              style={{ backgroundColor: "#306FE6" }}
            >
              <Plus size={18} />
              <span className="text-sm font-bold tracking-[0.05em]">
                New Meal Plan
              </span>
            </button>
            <button
              className="flex items-center justify-center gap-2 py-3 px-4 border border-[#1B1B1B] cursor-pointer"
              style={{ backgroundColor: "#F9F9F9" }}
            >
              <UserCog size={18} />
              <span className="text-sm font-bold tracking-[0.05em]">
                Manage Roles
              </span>
            </button>
            <button
              className="flex items-center justify-center gap-2 py-3 px-4 border border-[#1B1B1B] cursor-pointer"
              style={{ backgroundColor: "#F9F9F9" }}
            >
              <Megaphone size={18} />
              <span className="text-sm font-bold tracking-[0.05em]">
                Send Broadcast
              </span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded border border-[#E2E2E2] bg-white overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-[#E2E2E2]">
            <h2 className="text-2xl font-bold">Delivery Zone Efficiency</h2>
            <button className="flex items-center gap-1 cursor-pointer">
              <span className="text-sm font-bold tracking-[0.05em] text-[#306FE6]">
                View Full Report
              </span>
              <ArrowRight size={14} className="text-[#306FE6]" />
            </button>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr style={{ backgroundColor: "#F3F3F3" }}>
                <th className="text-left text-sm tracking-[0.05em] font-normal text-[#4C4546] px-6 py-3">
                  ZONE ID
                </th>
                <th className="text-left text-sm tracking-[0.05em] font-normal text-[#4C4546] px-6 py-3">
                  REGION
                </th>
                <th className="text-left text-sm tracking-[0.05em] font-normal text-[#4C4546] px-6 py-3">
                  SUCCESS RATE
                </th>
                <th className="text-left text-sm tracking-[0.05em] font-normal text-[#4C4546] px-6 py-3">
                  AVG. TIME
                </th>
                <th className="text-left text-sm tracking-[0.05em] font-normal text-[#4C4546] px-6 py-3">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id} className="border-b border-[#E2E2E2]">
                  <td className="px-6 py-[17px] text-base font-medium text-[#1B1B1B]">
                    {z.id}
                  </td>
                  <td className="px-6 py-[17px] text-base text-[#4C4546]">
                    {z.region}
                  </td>
                  <td className="px-6 py-[17px]">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-[#1B1B1B]">
                        {z.rate}%
                      </span>
                      <RateBar rate={z.rate} tone={z.tone} />
                    </div>
                  </td>
                  <td className="px-6 py-[17px] text-base text-[#4C4546]">
                    {z.time}
                  </td>
                  <td className="px-6 py-[17px]">
                    <StatusPill status={z.status} tone={z.tone} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}