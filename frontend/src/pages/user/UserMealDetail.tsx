import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ROUTES } from "@/constants/routes"
import {
  ArrowLeft,
  Check,
  Heart,
  Plus,
  Minus,
  Sparkles,
  ShoppingBag,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/api"
import type { Meal } from "@/components/MealDataTable"

function FigmaStar() {
  return (
    <svg
      width="12"
      height="13"
      viewBox="0 0 11 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block shrink-0"
    >
      <path
        d="M5.5 0L6.9855 4.37946L11 6L6.9855 7.62054L5.5 12L4.0145 7.62054L0 6L4.0145 4.37946L5.5 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function UserMealDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [meal, setMeal] = useState<Meal>()
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isFavoriteUpdating, setIsFavoriteUpdating] = useState(false)
  const [addedToast, setAddedToast] = useState(false)
  const {makeRequest} = useApi()

  useEffect(() => {
    // Fetch meal details from the API using the id
    const fetchMealDetails = async () => {
      try {
        const [mealResponse, favoritesResponse] = await Promise.all([
          makeRequest(`meals/${id}`, { method: "GET" }),
          makeRequest("fav-meal"),
        ])
        if (mealResponse) {
          setMeal(mealResponse)
          setIsFavorite(
            favoritesResponse.some(
              (favoriteMeal: Meal) => String(favoriteMeal.id) === String(id)
            )
          )
        }
      } catch (error) {
        console.error("Error fetching meal details:", error);
      }
    };

    fetchMealDetails();
  }, [id]);

  if (!meal) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const totalCredits = meal.credits * quantity

  const handleFavoriteClick = async () => {
    if (!meal?.id || isFavoriteUpdating) return

    setIsFavoriteUpdating(true)
    try {
      await makeRequest(`fav-meal?meal_id=${encodeURIComponent(meal.id)}`, {
        method: isFavorite ? "DELETE" : "POST",
      })
      setIsFavorite((current) => !current)
    } catch (error) {
      console.error("Failed to update favorite meal:", error)
    } finally {
      setIsFavoriteUpdating(false)
    }
  }

  const handleAddToCart = () => {
    setAddedToast(true)
    setTimeout(() => setAddedToast(false), 3000)
  }

  return (
    <section className="flex flex-col gap-8 pb-16 w-full max-w-5xl mx-auto">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-black transition-colors cursor-pointer group"
        >
          <div className="size-8 rounded-lg border border-slate-200 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
            <ArrowLeft size={16} />
          </div>
          <span>Back to Meals</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={isFavoriteUpdating}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? "Remove meal from favorites" : "Add meal to favorites"}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isFavorite
                ? "border-pink-200 bg-pink-50 text-pink-600"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Heart size={15} className={isFavorite ? "fill-pink-600 text-pink-600" : ""} />
            <span>{isFavorite ? "Favorited" : "Add to Favorites"}</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {addedToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-md flex items-center justify-between text-xs font-bold animate-in fade-in">
          <span className="flex items-center gap-2">
            <Check className="size-4 shrink-0" />
            Added {quantity}x {meal.title} ({totalCredits} Credits) to your meal plan queue!
          </span>
          <Link
            to={ROUTES.USER_PLAN}
            className="underline text-emerald-100 hover:text-white"
          >
            View Weekly Plan →
          </Link>
        </div>
      )}

      {/* Main Meal Detail Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Big Hero Image & Badges */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
            <img
              src={meal.image_url}
              alt={meal.title}
              className="w-full h-full object-cover"
            />
            {/* Credits pill */}
            <div className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-xs border border-slate-200 flex items-center gap-1.5 shadow-sm text-black">
              <FigmaStar />
              <span className="font-extrabold text-sm">
                {meal.credits} Credits
              </span>
            </div>

            {meal.tags && meal.tags.length > 0 && (
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
                {meal.tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-black/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 border-0"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Nutrition Info, Breakdown & Actions */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="space-y-2 border-b border-slate-200 pb-5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#306FE6] uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Chef-Curated Prep</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {meal.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed pt-1">
              {meal.description}
            </p>
          </div>

          {/* Macro Profile Breakdown Cards */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Macronutrient Profile
            </h2>
            <div className="grid grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-center flex flex-col justify-center">
                <span className="text-lg font-black text-slate-900">
                  {meal.calories}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  Calories
                </span>
              </div>
              <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/50 text-center flex flex-col justify-center">
                <span className="text-lg font-black text-blue-700">
                  {meal.protein}g
                </span>
                <span className="text-[11px] font-semibold text-blue-600 mt-0.5">
                  Protein
                </span>
              </div>
              <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/50 text-center flex flex-col justify-center">
                <span className="text-lg font-black text-amber-700">
                  {meal.carb}g
                </span>
                <span className="text-[11px] font-semibold text-amber-600 mt-0.5">
                  Carbs
                </span>
              </div>
              <div className="p-3 rounded-xl border border-rose-100 bg-rose-50/50 text-center flex flex-col justify-center">
                <span className="text-lg font-black text-rose-700">
                  {meal.fat}g
                </span>
                <span className="text-[11px] font-semibold text-rose-600 mt-0.5">
                  Fats
                </span>
              </div>
            </div>
          </div>

          {/* Quantity and Checkout Card */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Meal Portions
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  Select quantity to schedule
                </p>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-3 border border-slate-200 rounded-lg p-1 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="size-7 rounded bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-xs cursor-pointer"
                >
                  <Minus size={13} />
                </button>
                <span className="font-extrabold text-sm w-4 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="size-7 rounded bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-xs cursor-pointer"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Total Credit Cost</span>
                <div className="flex items-center gap-1.5 text-xl font-black text-slate-900 mt-0.5">
                  <FigmaStar />
                  <span>{totalCredits} Credits</span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleAddToCart}
                className="cursor-pointer bg-[#306FE6] hover:bg-[#2559c4] text-white font-bold gap-2 text-xs px-6"
              >
                <ShoppingBag size={16} />
                Add to Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
