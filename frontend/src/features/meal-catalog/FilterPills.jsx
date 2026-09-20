export function FilterPills({ options, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              "rounded-[5px] px-4 py-[11px] text-[13px] font-bold leading-4 transition " +
              (active
                ? "bg-black text-white"
                : "border-[1.5px] border-[rgba(174,174,178,0.5)] bg-[#FFFEFE] text-black hover:border-black/40")
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}