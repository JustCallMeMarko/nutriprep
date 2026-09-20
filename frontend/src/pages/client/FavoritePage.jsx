import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import FavoriteItem from "@/components/FavoriteItem"
import Food1 from "@/assets/landing/Food1.png"
import Food2 from "@/assets/landing/Food2.png"
import Food3 from "@/assets/landing/Food3.png"
import { Link } from "react-router-dom"
import { ROUTES } from "@/lib/routes"
import { useApi } from "@/utils/api"
import { useApiResource } from "@/hooks/useApiResource"

export default function FavoritePage() {
  const { makeRequest } = useApi()
  const { data: favorites = [], loading, error, reload } = useApiResource("/user/favorites", [])
  const [actionState, setActionState] = useState({ status: "idle", message: "" })
  const imageById = { 1: Food1, 2: Food2, 3: Food3 }
  const items = favorites.map((item) => ({
    id: item.id,
    name: item.title,
    image: imageById[item.id],
    rating: 5,
    credits: item.credits,
  }))

  const handleRemoveItem = async (id) => {
    setActionState({ status: "loading", message: "Removing favorite..." })
    try {
      await makeRequest(`/user/favorites/${id}`, { method: "DELETE" })
      await reload()
      setActionState({ status: "success", message: "Favorite removed." })
    } catch (requestError) {
      setActionState({ status: "error", message: requestError.message })
    }
  }

  const totalItemsCount = items.length
  const finalTotal = items.reduce((total, item) => total + item.credits, 0)

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          {/* Left: Your Meals & Schedule Breakdown */}
          <div className="w-full lg:flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b-2 border-slate-900 pb-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Favorite Meals
              </h1>
              <span className="text-sm font-semibold text-slate-500">
                {totalItemsCount} {totalItemsCount === 1 ? "Meal" : "Meals"}
              </span>
            </div>

            {/* Meals List */}
            {loading ? (
              <p className="py-16 text-center text-sm text-slate-500">Loading favorites...</p>
            ) : error ? (
              <div className="space-y-3 py-16 text-center text-sm text-red-600"><p>Unable to load favorites.</p><button type="button" onClick={() => reload()} className="font-bold underline">Try again</button></div>
            ) : items.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <FavoriteItem
                    key={item.id}
                    item={item}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-base font-semibold text-slate-600">Your favorite meals are empty.</p>
                <p className="text-xs text-slate-400 mt-1">Explore our meal plans to add your favorite meals.</p>
                <Link to={ROUTES.USER_MEALS} className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">Browse meals</Link>
              </div>
            )}
          </div>

          {/* Right: Meal Summary Card */}
          <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-7 shadow-sm space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Meal Summary
              </h2>


              {/* Total & Checkout Section */}
              <div className="pt-4 border-t border-slate-200/90 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-extrabold text-slate-900">
                    Total ({totalItemsCount} items)
                  </span>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-slate-900">
                      {finalTotal}{" "}
                      <span className="text-sm font-bold text-slate-500">Credits</span>
                    </span>
                  </div>
                </div>

                {actionState.status !== "idle" && <p className={actionState.status === "error" ? "text-sm text-red-600" : "text-sm text-emerald-600"}>{actionState.status === "loading" ? "Saving..." : actionState.message}</p>}

                {/* Checkout Button */}
                <Link
                  to={ROUTES.USER_PLANS}
                  className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Plan Meals
                </Link>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span>Credits deducted upon locking in for the week</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
