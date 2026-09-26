import Food1 from "@/assets/landing/Food1.png"
import Food2 from "@/assets/landing/Food2.png"
import Food3 from "@/assets/landing/Food3.png"
import { MealCard } from "@/components/MealCard"
import { ROUTES } from "@/constants/routes"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

const INITIAL_CART = [
  {
    id: 1,
    title: "Veggie Egg White Omelette",
    description: "Egg whites, spinach, tomato and mushroom, served with wholegrain toast. asdsa sadsadsad ads asdsadsa sadsadsadsa adsa dsdsa dsdsadasd asd",
    image_url: Food1,
    calories: 310,
    protein_g: 26,
    carbs_g: 16,
    carbs_fiber_g: 4,
    fat_g: 9,
    tags: ["Low calorie"],
    credits: 4,
    isFavorite: true,
  },
  {
    id: "meal-2",
    title: "Chicken cacciatore",
    description: "Tender chicken simmered with tomatoes, peppers, onions and herbs.",
    image_url: Food2,
    calories: 250,
    protein_g: 32,
    carbs_g: 12,
    carbs_fiber_g: 3,
    fat_g: 8,
    tags: ["Low carb", "High protein"],
    credits: 3,
    isFavorite: true,
  },
  {
    id: "meal-3",
    title: "Potato with Chicken",
    description: "Roasted potato served with seasoned chicken and fresh vegetables.",
    image_url: Food3,
    calories: 200,
    protein_g: 28,
    carbs_g: 24,
    carbs_fiber_g: 4,
    fat_g: 6,
    tags: ["High protein"],
    credits: 5,
    isFavorite: true,
  },
]

export default function UserFavorite() {
  const navigate = useNavigate()
  const totalItemsCount = INITIAL_CART.length
  const totalCalories = INITIAL_CART.reduce((total, meal) => total + meal.calories, 0)
  const totalCredits = INITIAL_CART.reduce((total, meal) => total + meal.credits, 0)

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
            {INITIAL_CART.map((item) => (
              <MealCard key={item.id} meal={item} />
            ))}
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