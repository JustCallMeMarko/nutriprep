import Food1 from "@/assets/landing/Food1.png"
import Food2 from "@/assets/landing/Food2.png"
import Food3 from "@/assets/landing/Food3.png"
import { MealCard } from "@/components/MealCard"

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

export default function CartPage() {
  const totalItemsCount = INITIAL_CART.length

  return (
    <section className="bg-white text-slate-900 flex flex-col">

      {/* Left: Your Meals & Schedule Breakdown */}
      <div className="w-full lg:flex-1 space-y-6">
        <div className="sticky top-15 z-40 flex flex-col justify-between gap-2 border-b-2 border-slate-900 bg-white pb-4 sm:flex-row sm:items-baseline">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Favorite Meals
          </h1>
          <span className="text-sm font-semibold text-slate-500">
            {totalItemsCount} {totalItemsCount === 1 ? "Meal" : "Meals"} Favorited
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {INITIAL_CART.map((item) => (
            <MealCard key={item.id} meal={item} />
          ))}
        </div>
      </div>
    </section>
  )
}