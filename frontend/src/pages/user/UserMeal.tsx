import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { MealCard } from "@/components/MealCard"
import { Search } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { useApi } from "@/lib/api"
import type { Meal } from "@/components/MealDataTable"

function StarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.5 0L6.9855 4.37946L11 6L6.9855 7.62054L5.5 12L4.0145 7.62054L0 6L4.0145 4.37946L5.5 0Z"
        fill="white"
      />
    </svg>
  )
}

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
         <div className="flex h-10 items-center gap-2.5 rounded-full border border-slate-300 bg-white px-3.5 shadow-xs shrink-0">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black">
            <StarIcon />
          </span>
          <p className="text-xs font-medium text-slate-900">
            Balance: <span className="font-bold">67 credits</span>
          </p>
          <Link
            to={ROUTES.USER_SUBSCRIPTION}
            className="pl-1 text-xs font-extrabold text-[#306FE6] hover:underline"
          >
            Top up
          </Link>
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
