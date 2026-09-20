function FigmaStar() {
  return (
    <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5.5 0L6.9855 4.37946L11 6L6.9855 7.62054L5.5 12L4.0145 7.62054L0 6L4.0145 7.62054L5.5 0Z" fill="black" />
    </svg>
  )
}

export function MealCard({ meal, quantity = 4, onAddFavorite }) {
  const {
    title,
    description,
    image_url,
    calories,
    protein_g,
    carbs_g,
    carbs_fiber_g,
    fat_g,
    tags = [],
  } = meal

  return (
    <article className="flex min-w-0 w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface">
      <div className="relative aspect-[2.222] w-full overflow-hidden bg-rose-100">
        {image_url && <img src={image_url} alt={title} className="h-full w-full object-cover" />}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-(--layout-gutter)">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {tags.length > 0 && <p className="mb-1 truncate text-[10px] font-bold leading-3 text-blue-600">{tags[0]}</p>}
            <h3 className="wrap-break-word text-[13px] font-bold leading-4 text-black line-clamp-2">{title}</h3>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1">
            <FigmaStar />
            <span className="text-sm font-extrabold leading-4 text-black">{quantity}</span>
          </div>
        </div>

        <p className="min-w-0 wrap-break-word text-[10px] font-medium leading-3 text-black/50 line-clamp-2">{description}</p>

        <div className="grid min-w-0 grid-cols-3 gap-2">
          <span className="min-w-0 wrap-break-word rounded-md border border-[rgba(174,174,178,0.5)] px-1.5 py-1 text-center text-[8px] font-bold leading-3 text-black/70">
            {protein_g}g Protein
          </span>
          <span className="min-w-0 wrap-break-word rounded-md border border-[rgba(174,174,178,0.5)] px-1.5 py-1 text-center text-[8px] font-bold leading-3 text-black/70">
            {carbs_g}g Carbs{carbs_fiber_g != null ? ` (${carbs_fiber_g}g Fiber)` : ""}
          </span>
          <span className="min-w-0 wrap-break-word rounded-md border border-[rgba(174,174,178,0.5)] px-1.5 py-1 text-center text-[8px] font-bold leading-3 text-black/70">
            {fat_g}g Fat
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-black/20 pt-3">
          <span className="shrink-0 text-[10px] font-medium leading-3 text-black/50">{calories}kcal</span>
          <button type="button" onClick={() => onAddFavorite?.(meal)} className="min-w-0 max-w-full rounded-md bg-brand px-3 py-1.5 text-[9px] font-bold leading-3 text-white hover:bg-brand-hover">
            Add to cart
          </button>
        </div>
      </div>
    </article>
  )
}
