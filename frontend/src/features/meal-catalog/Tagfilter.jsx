export function TagFilter({ tags, selected, onToggle }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => {
        const active = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className={
              "rounded-full px-3 py-[6px] text-[11px] font-bold transition " +
              (active
                ? "bg-black text-white"
                : "border border-border-subtle bg-surface text-text-primary hover:border-text-primary/40")
            }
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}