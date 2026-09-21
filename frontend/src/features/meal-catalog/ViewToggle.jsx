export function ViewToggle({ value, onChange }) {
  const tabs = [
    { value: "plans", label: "Meal Plans" },
    { value: "meals", label: "Individual meals" },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg bg-[rgba(217,217,217,0.5)] p-1">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={
              "rounded-md px-4 py-[9px] text-[9px] font-bold leading-[11px] transition " +
              (active ? "bg-white text-black shadow-sm" : "text-black/60 hover:text-black")
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}