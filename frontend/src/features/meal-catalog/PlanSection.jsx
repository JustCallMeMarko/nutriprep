import { PlanCard } from "@/components/PlanCard";

export function PlanSection({ title, plans, onSelect }) {
  if (!plans.length) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[13px] font-bold leading-4 text-black">{title}</h2>
      <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}