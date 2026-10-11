import { useEffect, useMemo, useState } from "react"
import { MealCard } from "@/components/MealCard"
import { Search } from "lucide-react"
import { useApi } from "@/lib/api"
import type { Meal } from "@/components/MealDataTable"

export default function UserMeal() {
  const {makeRequest} = useApi()
  const [search, setSearch] = useState("")
  const [meals, setMeals] = useState<Meal[]>([])

  useEffect(() => {
    fetchMeals()
  }, [])

  const fetchMeals = async () => {
    try {
      const [mealsResponse, favoritesResponse] = await Promise.all([
        makeRequest("meals"),
        makeRequest("fav-meal"),
      ])
      const favoriteIds = new Set(
        favoritesResponse.map((meal: Meal) => String(meal.id))
      )
      setMeals(
        mealsResponse.map((meal: Meal) => ({
          ...meal,
          isFavorite: favoriteIds.has(String(meal.id)),
        }))
      )
    }
    catch (error) {
      console.error("Error fetching meals:", error)
    }
  }

  const filteredMeals = useMemo(() => {
    const q = search.trim().toLowerCase()
    return meals.filter((meal) => !q || meal.title.toLowerCase().includes(q))
  }, [meals, search])

  return (
    <section className="flex flex-col gap-8 pb-16 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-slate-900 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Meal Catalog
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Chef-cooked meals planned around your macros and calorie target.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-100">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meals..."
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-4 pr-10 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#306FE6]"
          />
          <Search
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>

      {/* Meals Content Grid */}
      <div>
        {filteredMeals.length === 0 ? (
          <div className="py-20 text-center border border-dashed rounded-xl bg-white text-slate-400 space-y-2">
            <p className="text-base font-semibold text-slate-700">No meals found</p>
            <p className="text-xs">Try adjusting your search terms or active tag filters.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMeals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
