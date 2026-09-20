import { MealCard } from "@/components/MealCard";
import { MEAL_TIME_SECTIONS } from "@/lib/dummyMeals";

export function MealSection({ meals }) {
  if (!meals.length) {
    return (
      <p className="py-16 text-center text-[13px] font-medium text-black/50">
        No meals match your filters.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {MEAL_TIME_SECTIONS.map(({ key, label }) => {
        const group = meals.filter((m) => m.meal_time === key);
        if (!group.length) return null;

        return (
          <section key={key} className="flex flex-col gap-4">
            <h2 className="text-[13px] font-bold leading-4 text-black">{label}</h2>
            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((meal) => (
                <MealCard key={meal.id} meal={meal} quantity={meal.credits} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}