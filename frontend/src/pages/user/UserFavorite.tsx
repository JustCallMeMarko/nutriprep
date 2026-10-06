import { MealCard } from "@/components/MealCard"
import type { Meal } from "@/components/MealDataTable"
import { ROUTES } from "@/constants/routes"
import { useApi } from "@/lib/api"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function UserFavorite() {
  const navigate = useNavigate()
  const {makeRequest} = useApi()
  const [meals, setMeals] = useState<Meal[]>()
  const totalItemsCount = meals?.length || 0
  const totalCalories = meals?.reduce((total, meal) => total + meal.calories, 0) || 0
  const totalCredits = meals?.reduce((total, meal) => total + meal.credits, 0) || 0

  useEffect(() => {
    fetchFavoriteMeals()
  }, [])

  const fetchFavoriteMeals = async () => {
    try {
      const response = await makeRequest("fav-meal")
      setMeals(response.map((meal: Meal) => ({ ...meal, isFavorite: true })))
      console.log("Fetched favorite meals:", response)
    }
    catch (error) {
      console.error("Error fetching favorite meals:", error)
    }
  }
  
  return (
    <section className="bg-white text-slate-900 flex flex-col">

      <div className="grid w-full gap-8 md:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="w-full lg:flex-1">
          <div className="flex flex-col justify-between gap-2 border-b-2 mb-4 border-slate-900 bg-white pb-4 ">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Favorite Meals
            </h1>
            <span className="text-sm font-semibold text-slate-500">
              {totalItemsCount} {totalItemsCount === 1 ? "Meal" : "Meals"} Favorited
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
            {meals && meals.length > 0 ? (
              meals.map((item) => (
                <MealCard
                  key={item.id}
                  meal={item}
                  onFavoriteChange={(isFavorite) => {
                    if (!isFavorite) {
                      setMeals((currentMeals) =>
                        currentMeals?.filter((meal) => meal.id !== item.id)
                      )
                    }
                  }}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No favorite meals found.
              </p>
            )}
          </div>
        </div>

        <aside className="order-first h-fit rounded-xl border border-slate-200 bg-slate-50 p-5 md:order-0 md:sticky md:top-23">
          <p className="text-xs font-bold uppercase tracking-wide text-[#306FE6]">
            Your favorites
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
            Ready to plan?  
          </h2>
          <p className="mt-2 text-sm leading-5 text-slate-500">
            You have {totalItemsCount} favorite meals ready to add to your week.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-200 py-4">
            <div>
              <p className="text-xl font-bold text-slate-900">{totalCalories}</p>
              <p className="text-xs text-slate-500">total kcal</p>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{totalCredits}</p>
              <p className="text-xs text-slate-500">credits</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.USER_PLAN)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#306FE6] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#2459bd] cursor-pointer"
          >
            Plan your week
            <ArrowRight className="size-4" />
          </button>
        </aside>
      </div>
    </section>
  )
}