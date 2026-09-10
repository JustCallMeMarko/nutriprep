import React from "react"
import { Star, Minus, Plus, X, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MEAL_TIMES = ["Breakfast", "Lunch", "Dinner"]

/**
 * Reusable CartItem component with meal schedule / day selector and credits currency.
 */
export default function CartItem({
  item,
  onQuantityChange,
  onRemove,
  onScheduleChange,
  className,
}) {
  const {
    id,
    name,
    image,
    rating = 5,
    quantity = 1,
    credits = 250,
    day = "Monday",
    mealTime = "Lunch",
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
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80"
            }}
          />
        </div>

        {/* Meal Info & Day / Schedule */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              {name}
            </h3>

            {/* Schedule / Day Badge */}
            <div className="inline-flex items-center gap-1.5 bg-blue-50/80 border border-blue-200/60 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <Calendar className="size-3 text-blue-600" />
              {onScheduleChange ? (
                <select
                  value={`${day}-${mealTime}`}
                  onChange={(e) => {
                    const [newDay, newTime] = e.target.value.split("-")
                    onScheduleChange(id, { day: newDay, mealTime: newTime })
                  }}
                  className="bg-transparent text-blue-700 font-semibold text-xs border-none focus:outline-none cursor-pointer"
                  aria-label="Select delivery day and meal time"
                >
                  {DAYS_OF_WEEK.flatMap((d) =>
                    MEAL_TIMES.map((m) => (
                      <option key={`${d}-${m}`} value={`${d}-${m}`}>
                        {d} • {m}
                      </option>
                    ))
                  )}
                </select>
              ) : (
                <span>
                  {day} • {mealTime}
                </span>
              )}
            </div>
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
        {/* Counter */}
        <div className="inline-flex items-center bg-white border border-slate-300 rounded-full px-2 py-1 shadow-xs">
          <button
            type="button"
            onClick={() => onQuantityChange?.(id, Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="p-1 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="size-3.5" />
          </button>

          <span className="w-8 text-center text-sm font-bold text-slate-900 select-none">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => onQuantityChange?.(id, quantity + 1)}
            className="p-1 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

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
