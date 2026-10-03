import type { PlanItem } from "@/lib/dummyPlans"

export function PlanCard({
  plan,
  onSelect,
}: {
  plan: PlanItem
  onSelect?: (plan: PlanItem) => void
}) {
  const { name, tag, description, image_url, credits_per_meal, macros } = plan

  const macroPills = [
    { label: "Protein", value: macros?.protein },
    { label: "Carbs", value: macros?.carbs },
    { label: "Fat", value: macros?.fat },
  ].filter((m) => m.value != null)

  return (
    <div className="flex h-full flex-col rounded-xl border border-[rgba(174,174,178,0.5)] bg-white shadow-xs hover:border-black/30 transition-all">
      {/* Image */}
      <div className="aspect-[260/117] w-full overflow-hidden rounded-t-xl bg-[#FFBEBE]">
        {image_url && (
          <img src={image_url} alt={name} className="h-full w-full object-cover" />
        )}
      </div>

      {/* Body — grows so footers line up across the row */}
      <div className="flex flex-1 flex-col gap-1 px-4 pt-3 pb-4">
        <span className="text-[10px] font-bold leading-3 text-[#306FE6]">{tag}</span>
        <h3 className="text-[13px] font-bold leading-4 text-black">{name}</h3>
        <p className="text-[10px] font-medium leading-3 text-black/50">{description}</p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
          {macroPills.map((m) => (
            <span
              key={m.label}
              className="rounded-[7px] border border-[rgba(174,174,178,0.5)] bg-white px-2 py-[6px] text-[8px] font-bold leading-[10px] text-black/70"
            >
              {m.value} {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-black/20 px-3 py-2">
        <p className="text-[10px] font-medium leading-3 text-black/50">
          <span className="text-[13px] font-bold text-[#306FE6]">{credits_per_meal}</span>{" "}
          credits per meal
        </p>
        <button
          type="button"
          onClick={() => onSelect?.(plan)}
          className="rounded-[5px] bg-[#306FE6] px-3 py-[7px] text-[9px] font-bold leading-[11px] text-white transition hover:bg-[#2559c4] cursor-pointer"
        >
          Select Plan
        </button>
      </div>
    </div>
  )
}
