import { Plus, History } from "lucide-react";
import { ChartRadialShape } from "@/components/radial-chart";
import { WeeklyIntakeChart } from "@/components/weekly-intake-chart";
import { Button } from "@/components/ui/button";

export default function UserDashboard() {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  const consumedCalories = 1500;
  const dailyCalorieGoal = 2000;
  const goalProgress = Math.min(
    100,
    Math.round((consumedCalories / dailyCalorieGoal) * 100)
  );

  const consumedProtein = 120;
  const dailyProteinGoal = 150;

  const consumedCarbs = 180;
  const dailyCarbsGoal = 220;

  const consumedFat = 45;
  const dailyFatGoal = 65;

  const recentMeals = [
    {
      name: "Grilled Chicken Salad",
      meta: "Lunch · 12:30 PM",
      kcal: "450 kcal",
      macros: "40P / 20C / 15F",
    },
    {
      name: "Oatmeal & Protein",
      meta: "Breakfast · 08:15 AM",
      kcal: "320 kcal",
      macros: "30P / 45C / 5F",
    },
    {
      name: "Almonds & Apple",
      meta: "Snack · Yesterday",
      kcal: "200 kcal",
      macros: "5P / 25C / 12F",
    },
  ];



  return (
    <section className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground">Today's Nutrition</h1>
          <p className="text-sm text-muted-foreground">
            {today} — {goalProgress}% to Calorie Goal
          </p>
        </div>
        <Button className="cursor-pointer flex items-center gap-2 px-4 py-4.5">
          <Plus size={16} />
          Log Meal
        </Button>
      </div>

      {/* 4 Cards: Calories, Protein, Carbs, Fat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ChartRadialShape
          data={[{ current: consumedCalories, target: dailyCalorieGoal, fill: "#306FE6" }]}
          label="Calories"
          unit=" kcal"
        />
        <ChartRadialShape
          data={[{ current: consumedProtein, target: dailyProteinGoal, fill: "#10B981" }]}
          label="Protein"
          unit="g"
        />
        <ChartRadialShape
          data={[{ current: consumedCarbs, target: dailyCarbsGoal, fill: "#F59E0B" }]}
          label="Carbs"
          unit="g"
        />
        <ChartRadialShape
          data={[{ current: consumedFat, target: dailyFatGoal, fill: "#EF4444" }]}
          label="Fat"
          unit="g"
        />
      </div>

      {/* Weekly Intake & Recent Meals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start mb-8">
        <div className="flex flex-col gap-4 p-6 rounded border border-[#E2E2E2] bg-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              Weekly Intake Trend
            </h2>
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block bg-[#306FE6]" />
                Calories
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block bg-[#B0B0B0]" />
                Target
              </span>
            </div>
          </div>
          <WeeklyIntakeChart />
        </div>

        <div className="flex flex-col h-full rounded border border-[#E2E2E2] bg-card overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-lg font-bold text-foreground">Recent Meals</h2>
            <History size={18} className="text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            {recentMeals.map((meal) => {
              return (
                <div
                  key={meal.name}
                  className="flex items-center gap-3 px-6 py-3 border-t border-[#E2E2E2]"
                >
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
        </div>
      </div>
    </section>
  );
}