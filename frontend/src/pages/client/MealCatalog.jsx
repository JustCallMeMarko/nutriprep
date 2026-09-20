import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyPlans } from "@/lib/dummyPlans";
import { dummyMeals, MEAL_TAGS } from "@/lib/dummyMeals";
import { FilterPills } from "@/features/meal-catalog/FilterPills";
import { SearchInput } from "@/features/meal-catalog/SearchInput";
import { ProfileBanner } from "@/features/meal-catalog/ProfileBanner";
import { ViewToggle } from "@/features/meal-catalog/ViewToggle";
import { CreditBalance } from "@/features/meal-catalog/CreditBalance";
import { PlanSection } from "@/features/meal-catalog/PlanSection";
import { TagFilter } from "@/features/meal-catalog/Tagfilter";
import { MealSection } from "@/features/meal-catalog/MealSection";
import { useApi } from "@/utils/api";
import { useApiResource } from "@/hooks/useApiResource";

const planImages = Object.fromEntries(dummyPlans.map((plan) => [plan.id, plan.image_url]));
const mealImages = Object.fromEntries(dummyMeals.map((meal) => [meal.id, meal.image_url]));

const DIET_FILTERS = [
  { value: "all", label: "All plans" },
  { value: "regular", label: "Regular diet" },
  { value: "specialized", label: "Specialized Diet" },
];

export default function MealCatalog() {
  const navigate = useNavigate();
  const [view, setView] = useState("plans");
  const [dietFilter, setDietFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [actionState, setActionState] = useState({ status: "idle", message: "" });
  const { makeRequest } = useApi();
  const { data, loading: catalogLoading, error, reload } = useApiResource("/user/catalog");
  const { data: profile } = useApiResource("/user/me");

  const plans = (data?.plans || []).map((plan) => ({
    ...plan,
    image_url: planImages[plan.id],
  }));
  const meals = (data?.meals || []).map((meal) => ({
    ...meal,
    image_url: mealImages[meal.id],
  }));

  const filteredPlans = useMemo(() => {
    const q = search.trim().toLowerCase();
    return plans.filter((plan) => {
      const matchesDiet = dietFilter === "all" || plan.category === dietFilter;
      const matchesSearch =
        !q ||
        plan.name.toLowerCase().includes(q) ||
        plan.tag.toLowerCase().includes(q);
      return matchesDiet && matchesSearch;
    });
  }, [dietFilter, plans, search]);

  const regular = filteredPlans.filter((p) => p.category === "regular");
  const specialized = filteredPlans.filter((p) => p.category === "specialized");

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredMeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    return meals.filter((meal) => {
      const matchesTags =
        selectedTags.length === 0 || selectedTags.every((t) => meal.tags.includes(t));
      const matchesSearch = !q || meal.title.toLowerCase().includes(q);
      return matchesTags && matchesSearch;
    });
  }, [meals, selectedTags, search]);

  const handleSelectPlan = async (plan) => {
    setActionState({ status: "loading", message: "Saving your meal plan..." });
    try {
      await makeRequest("/user/orders", {
        method: "POST",
        body: JSON.stringify({ plan_id: plan.id }),
      });
      setActionState({ status: "success", message: `${plan.name} was added to your orders.` });
    } catch (requestError) {
      setActionState({ status: "error", message: requestError.message });
    }
  };

  const handleAddFavorite = async (meal) => {
    setActionState({ status: "loading", message: "Saving favorite..." });
    try {
      await makeRequest("/user/favorites", {
        method: "POST",
        body: JSON.stringify({ meal_id: meal.id }),
      });
      setActionState({ status: "success", message: `${meal.title} was added to favorites.` });
    } catch (requestError) {
      setActionState({ status: "error", message: requestError.message });
    }
  };

  return (
    <div
      className="min-h-screen bg-white pb-24"
    >
      {/* Header */}
      <div className="border-b border-black/10 px-6 pb-8 pt-8">
        <div className="mx-auto flex max-w-[834px] flex-col items-center gap-2 text-center">
          <p className="text-[13px] font-bold leading-4 text-[#306FE6]">Meal Catalog</p>
          <h1 className="text-[24px] font-extrabold leading-[29px] text-black">
            Find the meal plan that fits your goal
          </h1>
          <p className="max-w-[455px] text-[16px] font-medium leading-5 text-black/50">
            Chef-cooked meals planned around your macros and calorie target.
          </p>
        </div>
      </div>

      {/* Controls + content */}
      <div className="mx-auto flex max-w-[834px] flex-col gap-4 px-6 pt-section">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <FilterPills options={DIET_FILTERS} value={dietFilter} onChange={setDietFilter} />
          <SearchInput value={search} onChange={setSearch} />
        </div>

        <ProfileBanner
          preference="Low carb · High protein"
          onChangeProfile={() => navigate("/user/onboarding")}
        />

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <ViewToggle value={view} onChange={setView} />
          <CreditBalance credits={profile?.credits ?? 0} topUpTo="/user/plans" />
        </div>

        {actionState.status !== "idle" && (
          <div className={actionState.status === "error" ? "rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" : "rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700"}>
            {actionState.status === "loading" ? "Saving..." : actionState.message}
          </div>
        )}

        <div className="pt-6">
          {catalogLoading ? (
            <p className="py-16 text-center text-[13px] font-medium text-black/50">Loading catalog...</p>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-[13px] font-medium text-red-600">Unable to load the meal catalog.</p>
              <button type="button" onClick={() => reload()} className="rounded-lg bg-black px-4 py-2 text-xs font-bold text-white">
                Try again
              </button>
            </div>
          ) : view === "plans" ? (
            filteredPlans.length === 0 ? (
              <p className="py-16 text-center text-[13px] font-medium text-black/50">
                No plans match your search.
              </p>
            ) : (
              <div className="flex flex-col gap-12">
                <PlanSection title="Regular Diet" plans={regular} onSelect={handleSelectPlan} />
                <PlanSection
                  title="Specialized Diet"
                  plans={specialized}
                  onSelect={handleSelectPlan}
                />
              </div>
            )
          ) : (
            <div className="flex flex-col gap-4">
              <TagFilter tags={MEAL_TAGS} selected={selectedTags} onToggle={toggleTag} />
              <MealSection meals={filteredMeals} onAddFavorite={handleAddFavorite} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}