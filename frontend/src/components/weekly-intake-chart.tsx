import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const weeklyIntakeData = [
  { day: "Mon", calories: 1750, target: 2000 },
  { day: "Tue", calories: 1920, target: 2000 },
  { day: "Wed", calories: 1450, target: 2000 },
  { day: "Thu", calories: 2100, target: 2000 },
  { day: "Fri", calories: 1680, target: 2000 },
  { day: "Sat", calories: 1850, target: 2000 },
  { day: "Sun", calories: 1500, target: 2000 },
];

const weeklyIntakeConfig = {
  calories: { label: "Calories", color: "#306FE6" },
  target: { label: "Target", color: "#B0B0B0" },
} satisfies ChartConfig;

export function WeeklyIntakeChart() {
  return (
    <>
      <ChartContainer config={weeklyIntakeConfig} className="h-[280px] w-full">
        <BarChart accessibilityLayer data={weeklyIntakeData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="calories" fill="var(--color-calories)" radius={4} />
          <Bar dataKey="target" fill="var(--color-target)" radius={4} />
        </BarChart>
      </ChartContainer>
      <div className="flex items-center gap-2 text-sm font-medium">
        Weekly intake is on track <TrendingUp className="h-4 w-4" />
      </div>
    </>
  );
}
