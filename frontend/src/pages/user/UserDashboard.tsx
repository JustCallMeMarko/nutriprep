import { useEffect, useMemo, useState } from "react";
import { History, PencilLine, Plus, Utensils } from "lucide-react";
import { ChartRadialShape } from "@/components/radial-chart";
import { WeeklyIntakeChart, type WeeklyIntakePoint } from "@/components/weekly-intake-chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useApi } from "@/lib/api";
import type { Meal } from "@/components/MealDataTable";

type DashboardData = {
  totals: { calories: number; protein: number; carbs: number; fat: number };
  targets: { calories: number; protein: number; carbs: number; fat: number };
  weekly: WeeklyIntakePoint[];
  recent_meals: Array<{
    id: number;
    meal_id: number;
    name: string;
    consumed_at: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
};

const emptyDashboard: DashboardData = {
  totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  targets: { calories: 2000, protein: 150, carbs: 220, fat: 65 },
  weekly: [],
  recent_meals: [],
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function UserDashboard() {
  const { makeRequest } = useApi();
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLogging, setIsLogging] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [logMode, setLogMode] = useState<"nutriprep" | "custom">("nutriprep");
  const [customName, setCustomName] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarb, setCustomCarb] = useState("");
  const [customFat, setCustomFat] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setError(null);
      const [data, catalog] = await Promise.all([
        makeRequest("dashboard"),
        makeRequest("meals"),
      ]);
      setDashboard(data);
      setMeals(catalog);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load your dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, [makeRequest]);

  const today = useMemo(
    () => new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(new Date()),
    []
  );
  const goalProgress = dashboard.targets.calories
    ? Math.min(100, Math.round((dashboard.totals.calories / dashboard.targets.calories) * 100))
    : 0;

  const resetSheet = () => {
    setSelectedMeal("");
    setCustomName("");
    setCustomCalories("");
    setCustomProtein("");
    setCustomCarb("");
    setCustomFat("");
    setLogMode("nutriprep");
  };

  const handleLogMeal = async () => {
    const isCustom = logMode === "custom";
    if (isCustom && !customName.trim()) return;
    if (!isCustom && !selectedMeal) return;
    try {
      setIsLogging(true);
      await makeRequest("meal-logs", {
        method: "POST",
        body: JSON.stringify(
          isCustom
            ? {
                custom_name: customName.trim(),
                calories: Number(customCalories) || 0,
                protein: Number(customProtein) || 0,
                carb: Number(customCarb) || 0,
                fat: Number(customFat) || 0,
              }
            : { meal_id: Number(selectedMeal) }
        ),
      });
      resetSheet();
      setSheetOpen(false);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to log this meal.");
    } finally {
      setIsLogging(false);
    }
  };

  const logDisabled = isLogging || isLoading || (logMode === "custom" ? !customName.trim() : !selectedMeal);

  return (
    <section className="flex flex-col gap-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground">Today&apos;s Nutrition</h1>
          <p className="text-sm text-muted-foreground">
            {today} — {goalProgress}% to Calorie Goal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <Button onClick={() => setSheetOpen(true)} className="cursor-pointer flex items-center gap-2">
              <Plus size={16} />
              Log Meal
            </Button>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Log a meal</SheetTitle>
                <SheetDescription>Pick a NutriPrep meal or enter a custom one.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogMode("nutriprep")}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-semibold cursor-pointer transition-colors ${logMode === "nutriprep" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-border bg-card text-muted-foreground hover:border-blue-400"}`}
                  >
                    <Utensils size={18} />
                    NutriPrep meal
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogMode("custom")}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-semibold cursor-pointer transition-colors ${logMode === "custom" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-border bg-card text-muted-foreground hover:border-blue-400"}`}
                  >
                    <PencilLine size={18} />
                    Custom meal
                  </button>
                </div>

                {logMode === "nutriprep" ? (
                  <div className="flex flex-col gap-2">
                    {meals.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-6 text-center">No meals available.</p>
                    ) : meals.map((meal) => (
                      <button
                        key={meal.id}
                        type="button"
                        onClick={() => setSelectedMeal(String(meal.id))}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left cursor-pointer transition-colors ${selectedMeal === String(meal.id) ? "border-blue-600 bg-blue-50" : "border-border bg-card hover:border-blue-400"}`}
                      >
                        <span className="text-sm font-semibold truncate">{meal.title}</span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">{meal.calories} kcal</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="custom-name" className="text-xs font-semibold">Meal name</Label>
                      <Input
                        id="custom-name"
                        placeholder="e.g., Chicken adobo with rice"
                        value={customName}
                        onChange={(event) => setCustomName(event.target.value)}
                        maxLength={100}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="custom-calories" className="text-xs font-semibold">Calories</Label>
                        <Input id="custom-calories" type="number" min={0} placeholder="0" value={customCalories} onChange={(event) => setCustomCalories(event.target.value)} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="custom-protein" className="text-xs font-semibold">Protein (g)</Label>
                        <Input id="custom-protein" type="number" min={0} step="0.1" placeholder="0" value={customProtein} onChange={(event) => setCustomProtein(event.target.value)} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="custom-carb" className="text-xs font-semibold">Carb (g)</Label>
                        <Input id="custom-carb" type="number" min={0} step="0.1" placeholder="0" value={customCarb} onChange={(event) => setCustomCarb(event.target.value)} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="custom-fat" className="text-xs font-semibold">Fat (g)</Label>
                        <Input id="custom-fat" type="number" min={0} step="0.1" placeholder="0" value={customFat} onChange={(event) => setCustomFat(event.target.value)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-border">
                <Button onClick={handleLogMeal} disabled={logDisabled} className="w-full cursor-pointer">
                  {isLogging ? "Logging..." : "Log Meal"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ChartRadialShape data={[{ current: dashboard.totals.calories, target: dashboard.targets.calories, fill: "#306FE6" }]} label="Calories" unit=" kcal" />
        <ChartRadialShape data={[{ current: dashboard.totals.protein, target: dashboard.targets.protein, fill: "#10B981" }]} label="Protein" unit="g" />
        <ChartRadialShape data={[{ current: dashboard.totals.carbs, target: dashboard.targets.carbs, fill: "#F59E0B" }]} label="Carbs" unit="g" />
        <ChartRadialShape data={[{ current: dashboard.totals.fat, target: dashboard.targets.fat, fill: "#EF4444" }]} label="Fat" unit="g" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start mb-8">
        <div className="flex flex-col gap-4 p-6 rounded border border-[#E2E2E2] bg-card">
          <h2 className="text-lg font-bold text-foreground">Weekly Intake Trend</h2>
          <WeeklyIntakeChart data={dashboard.weekly} />
        </div>
        <div className="flex flex-col rounded border border-[#E2E2E2] bg-card overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-lg font-bold text-foreground">Recent Meals</h2>
            <History size={18} className="text-muted-foreground" />
          </div>
          {dashboard.recent_meals.length === 0 ? (
            <p className="border-t border-[#E2E2E2] px-6 py-8 text-sm text-muted-foreground">No meals logged yet.</p>
          ) : dashboard.recent_meals.map((meal) => (
            <div key={meal.id} className="flex items-center gap-3 px-6 py-3 border-t border-[#E2E2E2]">
              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1B1B1B] truncate">{meal.name}</p>
                <p className="text-xs text-[#4C4546]">{formatTime(meal.consumed_at)}</p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <p className="text-sm font-bold text-[#1B1B1B]">{meal.calories} kcal</p>
                <p className="text-xs font-medium text-[#306FE6]">{meal.protein}P / {meal.carbs}C / {meal.fat}F</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
