import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyPlans } from "@/lib/dummyPlans";
import { dummyMeals, MEAL_TAGS } from "@/lib/dummyMeals"; // NEW
import { FilterPills } from "@/features/meal-catalog/FilterPills";
import { SearchInput } from "@/features/meal-catalog/SearchInput";
import { ProfileBanner } from "@/features/meal-catalog/ProfileBanner";
import { ViewToggle } from "@/features/meal-catalog/ViewToggle";
import { CreditBalance } from "@/features/meal-catalog/CreditBalance";
import { PlanSection } from "@/features/meal-catalog/PlanSection";
import { TagFilter } from "@/features/meal-catalog/TagFilter"; // NEW
import { MealSection } from "@/features/meal-catalog/MealSection"; // NEW

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
  const [selectedTags, setSelectedTags] = useState([]); // NEW

  const filteredPlans = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dummyPlans.filter((plan) => {
      const matchesDiet = dietFilter === "all" || plan.category === dietFilter;
      const matchesSearch =
        !q ||
        plan.name.toLowerCase().includes(q) ||
        plan.tag.toLowerCase().includes(q);
      return matchesDiet && matchesSearch;
    });
  }, [dietFilter, search]);

  const regular = filteredPlans.filter((p) => p.category === "regular");
  const specialized = filteredPlans.filter((p) => p.category === "specialized");

  // NEW — tag toggle handler for individual meals
  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // NEW — individual meals filtering
  const filteredMeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dummyMeals.filter((meal) => {
      const matchesTags =
        selectedTags.length === 0 || selectedTags.every((t) => meal.tags.includes(t));
      const matchesSearch = !q || meal.title.toLowerCase().includes(q);
      return matchesTags && matchesSearch;
    });
  }, [selectedTags, search]);

  const handleSelectPlan = (plan) => {
    // TODO: wire to subscription flow / cart — separate ticket
    console.log("Selected plan:", plan.name);
  };

  return (
    <div
      className="min-h-screen bg-white pb-24"
      style={{ fontFamily: "Montserrat, sans-serif" }}
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
      <div className="mx-auto flex max-w-[834px] flex-col gap-4 px-6 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <FilterPills options={DIET_FILTERS} value={dietFilter} onChange={setDietFilter} />
          <SearchInput value={search} onChange={setSearch} />
        </div>

        <ProfileBanner
          preference="Low carb · High protein"
          onChangeProfile={() => navigate("/user/onboarding")} // CHANGED: /user prefix
        />

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <ViewToggle value={view} onChange={setView} />
          <CreditBalance credits={67} topUpTo="/user/plans" /> {/* CHANGED: /user prefix */}
        </div>

        <div className="pt-6">
          {view === "plans" ? (
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
              <MealSection meals={filteredMeals} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}