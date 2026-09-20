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
                : "border border-[rgba(174,174,178,0.5)] bg-white text-black hover:border-black/40")
            }
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}