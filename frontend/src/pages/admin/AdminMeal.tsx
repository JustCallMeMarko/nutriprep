import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Grid2x2, List, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import Food1 from "@/assets/landing/Food1.png"
import Food2 from "@/assets/landing/Food2.png"
import Food3 from "@/assets/landing/Food3.png"
import { MealCard } from '@/components/MealCard'

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
    stocks: 10,
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
    stocks: 5,
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
    stocks: 8,
    credits: 5,
    isFavorite: true,
  },
]

export default function AdminMeals() {
  const [selected, setSelected] = useState<'all' | 'low' | 'archived'>('all')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  return (
    <section className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-black">
          Meal Management
        </h1>
        <Button className="cursor-pointer flex items-center gap-2 px-4 py-4.5">
          <Plus size={16} />
          Add Meal
        </Button>
      </div>
      <Field className="w-1/3 mb-2">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input type="text" placeholder="Search meals..." className="pl-9" />
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
          >
            <Grid2x2 />
          </Button>
          <Button
            variant={layout === "list" ? "default" : "outline"}
            onClick={() => setLayout("list")}
            className="cursor-pointer"
          >
            <List />
          </Button>
        </ButtonGroup>
      </div>
      {layout === "grid" ? (
        <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-4`}>
          {INITIAL_CART.map((meal) => (
            <MealCard key={meal.id} meal={meal} type="admin" />
          ))}
        </div>
      ) : null
      }
    </section>
  )
}
