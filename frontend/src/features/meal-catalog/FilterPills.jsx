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
                : "border border-border-subtle bg-surface text-text-primary hover:border-text-primary/40")
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}