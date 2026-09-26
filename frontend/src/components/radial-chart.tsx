import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

export type MacroChartData = {
  current: number;
  target: number;
  fill: string;
};

const macroChartConfig = {
  current: { label: "Current Intake" },
  calories: { label: "Calories", color: "#306FE6" },
  protein: { label: "Protein", color: "#10B981" },
  carbs: { label: "Carbs", color: "#F59E0B" },
  fat: { label: "Fat", color: "#EF4444" },
} satisfies ChartConfig;

export function ChartRadialShape({
  data,
  label,
  unit = "g",
}: {
  data: MacroChartData[];
  label: string;
  unit?: string;
}) {
  const current = data[0]?.current ?? 0;
  const target = data[0]?.target ?? 100;
  const percentage = target > 0 ? Math.min(1, current / target) : 0;
  const startAngle = 90;
  const calculatedEndAngle = 90 - percentage * 360;

  return (
    <Card className="flex flex-col border-[#E2E2E2]">
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={macroChartConfig}
          className="mx-auto aspect-square max-h-55"
        >
          <RadialBarChart
            data={data}
            startAngle={startAngle}
            endAngle={calculatedEndAngle}
            outerRadius={90}
            innerRadius={80}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[90, 80]}
            />
            <RadialBar dataKey="current" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {`${current}${unit}`}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 22}
                          className="fill-muted-foreground text-xs uppercase tracking-wider font-semibold"
                        >
                          {label}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
         <div className="flex items-center gap-2 leading-none font-medium">
          Target: {`${target}${unit}`}
        </div>
      </CardFooter>
    </Card>
  );
}
