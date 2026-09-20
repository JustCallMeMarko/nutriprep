import { Check } from "lucide-react";

export function TierCard({ tier, onChoose }) {
  const { name, tagline, price, credits, mealsInfo, billing, highlighted, badge, features } = tier;

  return (
    <div
      className={
        "relative flex flex-1 flex-col rounded-xl border px-9 pb-9 pt-9 " +
        (highlighted
          ? "border-[#306FE6] bg-[#306FE6] text-white"
          : "border-[#FFBEBE] bg-white text-black")
      }
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-black px-3 py-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}

      {/* Name */}
      <h3 className="text-[20px] font-bold leading-6">{name}</h3>

      {/* Tagline */}
      <p
        className={
          "mt-3 text-[13px] font-medium leading-4 " +
          (highlighted ? "text-white/80" : "text-[#5E5E5E]")
        }
      >
        {tagline}
      </p>

      {/* Price */}
      <div className="mt-4 flex items-end gap-1 whitespace-nowrap">
        <span className="text-[36px] font-extrabold leading-[44px]">{price}</span>
        <span className={"pb-2 text-[16px] font-medium " + (highlighted ? "text-white/80" : "text-black")}>
          / month
        </span>
      </div>

      {/* Credits + meals info, same row */}
      <div className="mt-1 flex items-baseline gap-2 whitespace-nowrap">
        <span className="text-[16px] font-bold">{credits} credits</span>
        <span className="text-[14px] font-medium">{mealsInfo}</span>
      </div>

      {/* Billing note */}
      <p
        className={
          "mt-2 text-[11px] font-medium leading-[13px] " +
          (highlighted ? "text-white/70" : "text-[#5E5E5E]")
        }
      >
        {billing}
      </p>

      {/* Divider */}
      <div className={"mt-5 border-t " + (highlighted ? "border-white/20" : "border-black/20")} />

      {/* Button */}
      <button
        type="button"
        onClick={() => onChoose?.(tier)}
        className={
          "mt-5 h-[42px] w-full rounded-lg text-[15px] font-bold transition " +
          (highlighted
            ? "bg-white text-[#306FE6] hover:bg-white/90"
            : "bg-black text-white hover:bg-black/80")
        }
      >
        Choose {name}
      </button>

      {/* Features */}
      <ul className="mt-7 flex flex-col gap-6">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check
              size={17}
              className={"mt-[2px] shrink-0 " + (highlighted ? "text-white" : "text-[#306FE6]")}
            />
            <span className="text-[14px] font-medium leading-[17px]">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}