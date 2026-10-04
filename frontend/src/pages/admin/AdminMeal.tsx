import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Grid2x2, List, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import Food1 from "@/assets/landing/Food1.png"
import Food2 from "@/assets/landing/Food2.png"
import Food3 from "@/assets/landing/Food3.png"
import Salad from "@/assets/landing/salad.png"
import { MealCard } from '@/components/MealCard'
import MealDataTable, { type Meal } from '@/components/MealDataTable'
import { AddMealSheet } from '@/components/AddMealSheet'

const INITIAL_MEALS: Meal[] = [
  {
    id: "meal-1",
    title: "Veggie Egg White Omelette",
    description: "Egg whites, spinach, tomato and mushroom, served with wholegrain toast.",
    image_url: Food1,
    calories: 310,
    protein_g: 26,
    carbs_g: 16,
    carbs_fiber_g: 4,
    fat_g: 9,
    tags: ["Low calorie"],
    stocks: 10,
    credits: 4,
    status: "active",
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
    stocks: 4,
    credits: 3,
    status: "active",
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
    stocks: 8,
    credits: 5,
    status: "archived",
    isFavorite: true,
  },
  {
    id: "meal-4",
    title: "Mediterranean Salmon Salad",
    description: "Fresh Atlantic salmon with crisp greens, olives, cucumber, and lemon vinaigrette.",
    image_url: Salad,
    calories: 340,
    protein_g: 30,
    carbs_g: 8,
    carbs_fiber_g: 3,
    fat_g: 14,
    tags: ["Low carb", "High protein"],
    stocks: 3,
    credits: 5,
    status: "active",
    isFavorite: false,
  },
  {
    id: "meal-5",
    title: "High Protein Beef Power Bowl",
    description: "Lean ground beef, jasmine rice, steamed broccoli, and avocado slices.",
    image_url: Food1,
    calories: 450,
    protein_g: 38,
    carbs_g: 35,
    carbs_fiber_g: 5,
    fat_g: 12,
    tags: ["High protein"],
    stocks: 15,
    credits: 6,
    status: "active",
    isFavorite: false,
  },
  {
    id: "meal-6",
    title: "Keto Turkey Lettuce Wrap",
    description: "Seasoned lean ground turkey wrapped in crisp romaine with avocado sauce.",
    image_url: Food2,
    calories: 275,
    protein_g: 29,
    carbs_g: 5,
    carbs_fiber_g: 2,
    fat_g: 10,
    tags: ["Low carb", "Keto"],
    stocks: 2,
    credits: 4,
    status: "archived",
    isFavorite: false,
  },
]

export default function AdminMeals() {
  const [meals, setMeals] = useState<Meal[]>(INITIAL_MEALS)
  const [selected, setSelected] = useState<'all' | 'low' | 'archived'>('all')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const handleAddMeal = (newMeal: Meal) => {
    setMeals((prev) => [newMeal, ...prev])
  }

  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        meal.title.toLowerCase().includes(q) ||
        (meal.description && meal.description.toLowerCase().includes(q)) ||
        (meal.tags && meal.tags.some((tag) => tag.toLowerCase().includes(q)))

      if (!matchesSearch) return false

      if (selected === 'low') {
        return meal.stocks <= 5
      }
      if (selected === 'archived') {
        return meal.status === 'archived'
      }
      return true
    })
  }, [meals, searchQuery, selected])

  return (
    <section className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-black">
          Meal Management
        </h1>
        <AddMealSheet
          onAddMeal={handleAddMeal}
          trigger={
            <Button className="cursor-pointer flex items-center gap-2 px-4 py-4.5 font-bold text-sm shadow-xs">
              <Plus size={16} />
              Add Meal
            </Button>
          }
        />
      </div>

      <Field className="w-full sm:w-1/2 md:w-1/3 mb-2">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search meals..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Field>

      <div className="flex justify-between items-center">
        <ButtonGroup>
          <Button
            variant={selected === "all" ? "default" : "outline"}
            onClick={() => setSelected("all")}
            className="cursor-pointer active:scale-100 active:translate-y-0"
          >
            All
          </Button>
          <Button
            variant={selected === "low" ? "default" : "outline"}
            onClick={() => setSelected("low")}
            className="cursor-pointer active:scale-100 active:translate-y-0"
          >
            Low Stocks
          </Button>
          <Button
            variant={selected === "archived" ? "default" : "outline"}
            onClick={() => setSelected("archived")}
            className="cursor-pointer"
          >
            Archived
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button
            variant={layout === "grid" ? "default" : "outline"}
            onClick={() => setLayout("grid")}
            className="cursor-pointer"
            aria-label="Grid layout"
          >
            <Grid2x2 />
          </Button>
          <Button
            variant={layout === "list" ? "default" : "outline"}
            onClick={() => setLayout("list")}
            className="cursor-pointer"
            aria-label="List layout"
          >
            <List />
          </Button>
        </ButtonGroup>
      </div>

      {layout === "grid" ? (
        filteredMeals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 my-4">
            {filteredMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} type="admin" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border rounded-xl mt-4">
            <p className="text-base font-medium">No meals found</p>
            <p className="text-sm">Try changing your search or filter criteria.</p>
          </div>
        )
      ) : (
        <div className="my-4">
          <MealDataTable data={filteredMeals} />
        </div>
      )}
    </section>
  )
}
