import {
  Users,
  Wallet,
  Plus,
  UserCog
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { BroadcastDialog } from "@/components/BroadcastDialog";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

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

const acquisitionData = [
  { day: "Mon", value: 2000, label: "2.0k" },
  { day: "Tue", value: 2700, label: "2.7k" },
  { day: "Wed", value: 1500, label: "1.5k" },
  { day: "Thu", value: 3500, label: "3.5k" },
  { day: "Fri", value: 4500, label: "4.5k", highlight: true },
  { day: "Sat", value: 3000, label: "3.0k" },
  { day: "Sun", value: 4000, label: "4.0k" },
];

export default function AdminDashboard() {
  const maxValue = 5000;
  const navigate = useNavigate();
  const {makeRequest} = useApi();

  const { data } = useQuery({
    queryKey: ["total-users"],
    queryFn: async () => { 
      const response = await makeRequest("/admin/total-users");
      return response.total_users;
    },
  })

  return (
    <section
      className="flex flex-col gap-8 md:max-h-screen"
    >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-black">
            System Overview
          </h1>
          <p className="text-sm text-[#4C4546]">
            Real-time performance metrics and management hub.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="flex flex-col justify-between p-6 rounded border border-[#E2E2E2] bg-white">
            <div className="flex justify-between items-start pb-4">
              <p className="text-sm font-bold tracking-wider text-[#4C4546]">
                TOTAL USERS
              </p>
              <Users size={20} className="text-[#4C4546]" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[32px] font-bold tracking-[-0.01em] text-[#1B1B1B]">
                {data ?? 'Loading...'}
              </p>
              <p className="text-xs font-medium text-[#306FE6]">
                ↑ +8.4% vs last week
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between p-6 rounded border border-[#E2E2E2] bg-white">
            <div className="flex justify-between items-start pb-4">
              <p className="text-sm font-bold tracking-wider text-[#4C4546]">
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
              <p className="text-sm font-bold tracking-wider text-white">
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
            <div className="flex border-b border-[#E2E2E2] h-68 py-4">
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
              className="flex items-center justify-center gap-2 py-3 px-4 text-white cursor-pointer bg-blue-500"
              onClick={() => navigate(ROUTES.ADMIN_MEAL)}
            >
              <Plus size={18} />
              <span className="text-sm font-bold tracking-wider">
                New Meal Plan
              </span>
            </button>
            <button
              className="flex items-center justify-center gap-2 py-3 px-4 border border-[#1B1B1B] cursor-pointer"
              onClick={() => navigate(ROUTES.ADMIN_USER)}
            >
              <UserCog size={18} />
              <span className="text-sm font-bold tracking-wider">
                Manage Users
              </span>
            </button>
            <BroadcastDialog />
          </div>
        </div>
    </section>
  );
}