import { User, Plus, History, UtensilsCrossed, Coffee, Apple } from "lucide-react";

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
  .font-montserrat { font-family: 'Montserrat', sans-serif; }
`;

const macros = [
  {
    key: "kcal",
    value: "1,850",
    unit: "KCAL",
    remaining: "650 remaining",
    color: "#306FE6",
    percent: 0.74,
  },
  {
    key: "pro",
    value: "145g",
    unit: "PRO",
    remaining: "35g remaining",
    color: "#F5A623",
    percent: 0.81,
  },
  {
    key: "carb",
    value: "180g",
    unit: "CARB",
    remaining: "120g remaining",
    color: "#7CB342",
    percent: 0.6,
  },
  {
    key: "fat",
    value: "55g",
    unit: "FAT",
    remaining: "5g remaining",
    color: "#F2C230",
    percent: 0.92,
  },
];

const weeklyIntake = [
  { day: "Mon", value: 1300 },
  { day: "Tue", value: 1900 },
  { day: "Wed", value: 1600 },
  { day: "Thu", value: 2050 },
  { day: "Fri", value: 2700 },
  { day: "Sat", value: 1750 },
  { day: "Sun", value: 2600 },
];

const recentMeals = [
  {
    icon: UtensilsCrossed,
    name: "Grilled Chicken Salad",
    meta: "Lunch · 12:30 PM",
    kcal: "450 kcal",
    macros: "40P / 20C / 15F",
  },
  {
    icon: Coffee,
    name: "Oatmeal & Protein",
    meta: "Breakfast · 08:15 AM",
    kcal: "320 kcal",
    macros: "30P / 45C / 5F",
  },
  {
    icon: Apple,
    name: "Almonds & Apple",
    meta: "Snack · Yesterday",
    kcal: "200 kcal",
    macros: "5P / 25C / 12F",
  },
];

function MacroRing({ value, unit, remaining, color, percent }) {
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - percent);

  return (
    <div
      className="flex flex-col items-center gap-4 p-6 rounded border border-[#E2E2E2] bg-white"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#E2E2E2"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-[#1B1B1B]">{value}</span>
          <span className="text-[10px] font-bold tracking-[0.05em] text-[#4C4546]">
            {unit}
          </span>
        </div>
      </div>
      <p className="text-sm font-medium text-[#1B1B1B]">{remaining}</p>
    </div>
  );
}

function WeeklyIntakeChart() {
  const width = 640;
  const height = 220;
  const maxValue = 3000;
  const padLeft = 8;
  const padRight = 8;
  const chartWidth = width - padLeft - padRight;
  const stepX = chartWidth / (weeklyIntake.length - 1);

  const points = weeklyIntake.map((d, i) => {
    const x = padLeft + i * stepX;
    const y = height - (d.value / maxValue) * height;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const targetY = height - (2000 / maxValue) * height;

  return (
    <div className="flex w-full">
      <div className="flex flex-col justify-between text-xs font-medium text-[#4C4546] pr-2 pb-5 h-[220px]">
        <span>3k</span>
        <span>2k</span>
        <span>1k</span>
        <span>0</span>
      </div>
      <div className="flex-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-[220px]"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1={targetY}
            x2={width}
            y2={targetY}
            stroke="#B0B0B0"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <path d={areaPath} fill="#306FE6" opacity="0.12" />
          <path
            d={linePath}
            fill="none"
            stroke="#306FE6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex justify-between text-xs font-medium text-[#4C4546] mt-2">
          {weeklyIntake.map((d) => (
            <span key={d.day}>{d.day}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MacroAnalyticsWeb() {
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
            <div className="pb-4 pt-4 border-b-2 border-[#1B1B1B]">
              <p className="text-sm font-bold text-[#1B1B1B]">Macros</p>
            </div>
            <p className="text-sm font-medium text-[#4C4546]">Delivery</p>
          </nav>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#1B1B1B" }}
          >
            <User size={18} className="text-white" />
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-16 py-8 flex flex-col gap-8">
        {/* Title row */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-black">Today's Macros</h1>
            <p className="text-sm text-[#4C4546]">
              Tuesday, Oct 24 — 75% to Daily Goal
            </p>
          </div>
          <button
            className="flex items-center gap-2 py-2.5 px-5 text-white text-sm font-bold rounded-sm cursor-pointer"
            style={{ backgroundColor: "#306FE6" }}
          >
            <Plus size={16} />
            Log Meal
          </button>
        </div>

        {/* Macro rings */}
        <div className="grid grid-cols-4 gap-6">
          {macros.map((m) => (
            <MacroRing key={m.key} {...m} />
          ))}
        </div>

        {/* Chart + Recent meals */}
        <div className="grid grid-cols-[1fr_360px] gap-6 items-start">
          <div className="flex flex-col gap-4 p-6 rounded border border-[#E2E2E2] bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-black">
                Weekly Intake Trend
              </h2>
              <div className="flex items-center gap-4 text-xs font-medium text-[#4C4546]">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: "#306FE6" }}
                  />
                  Calories
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: "#B0B0B0" }}
                  />
                  Target
                </span>
              </div>
            </div>
            <WeeklyIntakeChart />
          </div>

          <div className="flex flex-col rounded border border-[#E2E2E2] bg-white overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-lg font-bold text-black">Recent Meals</h2>
              <History size={18} className="text-[#4C4546]" />
            </div>
            <div className="flex flex-col">
              {recentMeals.map((meal) => {
                const Icon = meal.icon;
                return (
                  <div
                    key={meal.name}
                    className="flex items-center gap-3 px-6 py-3 border-t border-[#E2E2E2]"
                  >
                    <div
                      className="w-9 h-9 rounded flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "#F3F3F3" }}
                    >
                      <Icon size={16} className="text-[#1B1B1B]" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#1B1B1B] truncate">
                        {meal.name}
                      </p>
                      <p className="text-xs text-[#4C4546]">{meal.meta}</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <p className="text-sm font-bold text-[#1B1B1B]">
                        {meal.kcal}
                      </p>
                      <p className="text-xs font-medium text-[#306FE6]">
                        {meal.macros}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              className="text-sm font-bold text-[#1B1B1B] py-3 border-t border-[#E2E2E2] cursor-pointer"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              View All History
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}