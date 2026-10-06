import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { AlertCircle, Plus, Users, UserCog, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

import { BroadcastDialog } from "@/components/BroadcastDialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ROUTES } from "@/constants/routes";
import { useApi } from "@/lib/api";

type AcquisitionPoint = {
  day: string;
  date: string;
  users: number;
};

type DashboardMetrics = {
  total_users: number;
  daily_credits: number;
  active_deliveries: number;
  active_delivery_rate: number;
  user_change_percent: number;
  acquisition: AcquisitionPoint[];
};

const chartConfig = {
  users: {
    label: "New users",
    color: "#306FE6",
  },
} satisfies ChartConfig;

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
      aria-hidden="true"
    >
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex min-h-40 flex-col justify-between rounded border p-6 ${
        accent ? "border-[#306FE6] bg-[#306FE6] text-white" : "border-[#E2E2E2] bg-white"
      }`}
    >
      <div className="flex items-start justify-between pb-4">
        <p className={`text-sm font-bold tracking-wider ${accent ? "text-white" : "text-[#4C4546]"}`}>
          {label}
        </p>
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className={`text-[32px] font-bold tracking-[-0.01em] ${accent ? "text-white" : "text-[#1B1B1B]"}`}>
          {value}
        </p>
        <p className={`text-xs font-medium ${accent ? "text-blue-100" : "text-[#306FE6]"}`}>
          {detail}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { makeRequest } = useApi();
  const { data, isLoading, isError, refetch } = useQuery<DashboardMetrics>({
    queryKey: ["admin-dashboard"],
    queryFn: () => makeRequest("dashboard"),
    staleTime: 60_000,
  });

  const formatNumber = (value: number) => new Intl.NumberFormat("en-PH").format(value);
  const change = data?.user_change_percent ?? 0;
  const changeLabel = `${change >= 0 ? "↑" : "↓"} ${Math.abs(change).toFixed(1)}% vs previous 7 days`;

  if (isError) {
    return (
      <section className="flex min-h-96 flex-col items-center justify-center gap-4 rounded border border-[#E2E2E2] bg-white p-8 text-center">
        <AlertCircle className="text-red-600" />
        <div>
          <h1 className="text-xl font-bold">Unable to load dashboard metrics</h1>
          <p className="mt-1 text-sm text-[#4C4546]">Check the backend connection and try again.</p>
        </div>
        <button className="border border-[#1B1B1B] px-4 py-2 text-sm font-bold" onClick={() => refetch()}>
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-black">System Overview</h1>
        <p className="text-sm text-[#4C4546]">Real-time performance metrics and management hub.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard
          label="TOTAL USERS"
          value={isLoading ? "—" : formatNumber(data?.total_users ?? 0)}
          detail={isLoading ? "Loading metrics..." : changeLabel}
          icon={<Users size={20} className="text-[#4C4546]" />}
        />
        <MetricCard
          label="DAILY ORDER CREDITS"
          value={isLoading ? "—" : formatNumber(data?.daily_credits ?? 0)}
          detail="Confirmed orders today"
          icon={<Wallet size={20} className="text-[#4C4546]" />}
        />
        <MetricCard
          label="ACTIVE DELIVERIES"
          value={isLoading ? "—" : formatNumber(data?.active_deliveries ?? 0)}
          detail={`${data?.active_delivery_rate ?? 0}% of all orders`}
          icon={<TruckIcon size={20} className="text-white" />}
          accent
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-2 rounded border border-[#E2E2E2] bg-white p-6">
          <div>
            <h2 className="text-2xl font-bold">User Acquisition Trends</h2>
            <p className="mt-1 text-sm text-[#4C4546]">New accounts created over the last seven days.</p>
          </div>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart accessibilityLayer data={data?.acquisition ?? []} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="users" fill="var(--color-users)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="flex flex-col gap-4 rounded border border-[#E2E2E2] bg-white p-6">
          <h2 className="pb-2 text-2xl font-bold">Quick Actions</h2>
          <button
            className="flex cursor-pointer items-center justify-center gap-2 bg-[#306FE6] px-4 py-3 text-white"
            onClick={() => navigate(ROUTES.ADMIN_MEAL)}
          >
            <Plus size={18} />
            <span className="text-sm font-bold tracking-wider">New Meal Plan</span>
          </button>
          <button
            className="flex cursor-pointer items-center justify-center gap-2 border border-[#1B1B1B] px-4 py-3"
            onClick={() => navigate(ROUTES.ADMIN_USER)}
          >
            <UserCog size={18} />
            <span className="text-sm font-bold tracking-wider">Manage Users</span>
          </button>
          <BroadcastDialog />
        </div>
      </div>
    </section>
  );
}
