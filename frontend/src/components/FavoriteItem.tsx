import { Star, X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Reusable favorite item with credits pricing and removal control.
 */
interface FavoriteItemProps {
  item: {
    id: string | number
    name: string
    image: string
    rating?: number
    credits?: number
  }
  onRemove?: (id: string | number) => void
  className?: string
}

export default function FavoriteItem({
  item,
  onRemove,
  className,
}: FavoriteItemProps) {
  const {
    id,
    name,
    image,
    rating = 5,
    credits = 250,
  } = item

  return (
    <div
      className={cn(
        "group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 border-b border-slate-200/80 transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Meal Image */}
        <div className="relative size-20 sm:size-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60 shadow-xs">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Meal Info & Day / Schedule */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              {name}
            </h3>

          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-4",
                  i < Math.round(rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-slate-200 text-slate-200"
                )}
              />
            ))}
            <span className="text-xs text-slate-400 ml-1 font-medium">
              ({rating.toFixed(1)})
            </span>
          </div>

          {/* Credits Price */}
          <p className="text-sm font-bold text-slate-900">
            {credits} <span className="text-xs font-semibold text-slate-500">Credits</span>
          </p>
        </div>
      </div>

      {/* Right controls: Quantity Counter & Remove Button */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pl-24 sm:pl-0">
        {/* Remove Button */}
        <button
          type="button"
          onClick={() => onRemove?.(id)}
          className="size-8 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          aria-label={`Remove ${name} from cart`}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}