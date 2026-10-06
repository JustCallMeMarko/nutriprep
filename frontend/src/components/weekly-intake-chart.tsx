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

export type WeeklyIntakePoint = {
  day: string;
  calories: number;
  target: number;
};

const weeklyIntakeConfig = {
  calories: { label: "Calories", color: "#306FE6" },
  target: { label: "Target", color: "#B0B0B0" },
} satisfies ChartConfig;

export function WeeklyIntakeChart({ data }: { data: WeeklyIntakePoint[] }) {
  return (
    <>
      <ChartContainer config={weeklyIntakeConfig} className="h-[280px] w-full">
        <BarChart accessibilityLayer data={data}>
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
