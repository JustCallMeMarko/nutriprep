import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Grid2x2, List, Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { MealCard } from '@/components/MealCard'
import MealDataTable, { type Meal } from '@/components/MealDataTable'
import { AddMealSheet } from '@/components/AddMealSheet'
import { useApi } from '@/lib/api'

export default function AdminMeals() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [selected, setSelected] = useState<'all' | 'low' | 'archived'>('all')
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const {makeRequest} = useApi()

  useEffect(() => {
    fetchMeals()
  }, [])

  const fetchMeals = async () => {
    try {
      const response = await makeRequest("meals")
      setMeals(response)
      console.log("Fetched meals:", response)
    } catch (error) {
      console.error("Error fetching meals:", error)
    }
  }

  const handleAddMeal = (newMeal: Meal) => {
    setMeals((prev) => [newMeal, ...prev])
  }

  const handleUpdateMeal = (updatedMeal: Meal) => {
    setMeals((prev) => prev.map((meal) => meal.id === updatedMeal.id ? updatedMeal : meal))
    setEditingMeal(null)
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
        return meal.status !== 'archived' && meal.stocks <= 5
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
              <MealCard key={meal.id} meal={meal} type="admin" onClick={() => setEditingMeal(meal)} />
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
          <MealDataTable data={filteredMeals} onMealClick={setEditingMeal} />
        </div>
      )}
      <AddMealSheet
        editingMeal={editingMeal}
        onUpdateMeal={handleUpdateMeal}
        onAddMeal={handleAddMeal}
        trigger={<span className="hidden" />}
      />
    </section>
  )
}
