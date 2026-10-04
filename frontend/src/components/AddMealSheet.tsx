import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Utensils,
  Check,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Layers,
  Coins,
  UploadCloud,
  X,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react"
import type { Meal } from "@/components/MealDataTable"

interface AddMealSheetProps {
  onAddMeal?: (meal: Meal) => void
  trigger?: React.ReactNode
}

export function AddMealSheet({ onAddMeal, trigger }: AddMealSheetProps) {
  const [open, setOpen] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Form Fields
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [calories, setCalories] = React.useState<number | "">("")
  const [protein, setProtein] = React.useState<number | "">("")
  const [carb, setCarb] = React.useState<number | "">("")
  const [fat, setFat] = React.useState<number | "">("")
  const [credits, setCredits] = React.useState<number | "">("")
  const [stocks, setStocks] = React.useState<number | "">("")

  // Photo upload & preview
  const [previewImage, setPreviewImage] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WEBP).")
      return
    }
    setErrorMessage(null)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleRemoveImage = () => {
    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setCalories("")
    setProtein("")
    setCarb("")
    setFat("")
    setCredits("")
    setStocks("")
    setPreviewImage(null)
    setErrorMessage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCancel = () => {
    resetForm()
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!previewImage) {
      setErrorMessage("Please upload a meal photo.")
      return
    }

    if (!title.trim()) {
      setErrorMessage("Please enter a meal title.")
      return
    }

    if (!description.trim()) {
      setErrorMessage("Please enter a meal description.")
      return
    }

    if (calories === "" || isNaN(Number(calories)) || Number(calories) < 0) {
      setErrorMessage("Please enter valid calories.")
      return
    }

    if (protein === "" || isNaN(Number(protein)) || Number(protein) < 0) {
      setErrorMessage("Please enter valid protein (g).")
      return
    }

    if (carb === "" || isNaN(Number(carb)) || Number(carb) < 0) {
      setErrorMessage("Please enter valid carb (g).")
      return
    }

    if (fat === "" || isNaN(Number(fat)) || Number(fat) < 0) {
      setErrorMessage("Please enter valid fat (g).")
      return
    }

    if (credits === "" || isNaN(Number(credits)) || Number(credits) <= 0) {
      setErrorMessage("Please enter valid credits (at least 1).")
      return
    }

    setErrorMessage(null)

    const parsedStocks = stocks === "" ? 0 : Math.max(0, Number(stocks) || 0)

    const newMeal: Meal = {
      id: `meal-${Date.now()}`,
      title: title.trim().slice(0, 100),
      description: description.trim(),
      image_url: previewImage,
      calories: Math.round(Number(calories)),
      protein_g: Number(protein),
      carbs_g: Number(carb),
      fat_g: Number(fat),
      credits: Math.round(Number(credits)),
      stocks: parsedStocks,
      status: "active",
      isFavorite: false,
    }

    if (onAddMeal) {
      onAddMeal(newMeal)
    }

    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      setOpen(false)
      resetForm()
    }, 1000)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button className="cursor-pointer flex items-center gap-2 px-4 py-4.5 font-bold text-sm shadow-xs">
              <Plus size={16} />
              Add Meal
            </Button>
          )
        }
      />
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg md:max-w-xl h-full flex flex-col p-0 overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Sheet Header */}
          <SheetHeader className="p-6 border-b border-border bg-card flex flex-col items-start gap-1.5">
            <SheetTitle className="text-xl font-bold tracking-tight flex items-center gap-2 text-foreground">
              <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <Utensils size={20} />
              </div>
              Add New Meal
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Provide meal details and nutrition macros to add to your catalog.
            </SheetDescription>
          </SheetHeader>

          {/* Sheet Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isSuccess ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in">
                <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
                  <Check size={32} />
                </div>
                <p className="text-lg font-bold text-foreground">Meal Added Successfully!</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  The meal has been saved to the list.
                </p>
              </div>
            ) : (
              <FieldGroup className="space-y-4.5">
                {/* 1. Meal Photo Upload & Preview */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-blue-600" />
                    Meal Photo *
                  </Label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />

                  {previewImage ? (
                    <div className="relative w-full h-52 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-50 group">
                      <img
                        src={previewImage}
                        alt="Meal Preview"
                        className="w-full h-full object-cover"
                      />

                      {/* Delete X Button on Top Right (appears on hover) */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={handleRemoveImage}
                        className="absolute top-2.5 right-2.5 z-20 size-7 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md cursor-pointer opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                        title="Remove photo"
                        aria-label="Remove photo"
                      >
                        <X size={14} />
                      </Button>

                      {/* Centered Change Button on Hover */}
                      <div className="absolute inset-0 z-10 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white/95 text-slate-900 hover:bg-white font-bold text-xs h-9 px-4 gap-2 cursor-pointer shadow-lg rounded-lg backdrop-blur-xs transition-transform active:scale-95"
                        >
                          <UploadCloud size={15} />
                          Change Photo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all p-4 text-center ${
                        isDragging
                          ? "border-blue-600 bg-blue-50/50"
                          : "border-slate-300 hover:border-blue-500 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                        <UploadCloud size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Drop or browse files
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          PNG, JPG, or WEBP up to 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Title */}
                <Field>
                  <Label htmlFor="meal-title" className="text-xs font-semibold text-foreground">
                    Title *
                  </Label>
                  <Input
                    id="meal-title"
                    name="title"
                    maxLength={100}
                    placeholder="e.g., Grilled Lemon Herb Salmon"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white text-xs h-9 mt-1"
                    required
                  />
                  <span className="text-[10px] text-muted-foreground ml-auto block text-right mt-0.5">
                    {title.length}/100
                  </span>
                </Field>

                {/* 3. Description */}
                <Field>
                  <Label htmlFor="meal-desc" className="text-xs font-semibold text-foreground">
                    Description *
                  </Label>
                  <Textarea
                    id="meal-desc"
                    name="description"
                    placeholder="Describe the meal ingredients, preparation, and nutritional profile..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-20 resize-none text-xs bg-white mt-1"
                    required
                  />
                </Field>

                {/* 4. Macros Grid: calories, protein, carb, fat */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">
                    Macronutrients *
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Calories */}
                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                        <Flame size={12} /> Calories *
                      </span>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-8 text-xs bg-white font-bold"
                        required
                      />
                    </div>

                    {/* Protein */}
                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                        <Dumbbell size={12} /> Protein (g) *
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step="0.1"
                        placeholder="0"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-8 text-xs bg-white font-bold"
                        required
                      />
                    </div>

                    {/* Carb */}
                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <Wheat size={12} /> Carb (g) *
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step="0.1"
                        placeholder="0"
                        value={carb}
                        onChange={(e) => setCarb(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-8 text-xs bg-white font-bold"
                        required
                      />
                    </div>

                    {/* Fat */}
                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                        <Droplet size={12} /> Fat (g) *
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step="0.1"
                        placeholder="0"
                        value={fat}
                        onChange={(e) => setFat(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-8 text-xs bg-white font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Credits & Stocks */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Field>
                    <Label htmlFor="meal-credits" className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Coins size={13} className="text-amber-600" /> Credits *
                    </Label>
                    <Input
                      id="meal-credits"
                      type="number"
                      min={1}
                      placeholder="0"
                      value={credits}
                      onChange={(e) => setCredits(e.target.value === "" ? "" : Number(e.target.value))}
                      className="h-9 text-xs bg-white mt-1 font-bold"
                      required
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="meal-stocks" className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Layers size={13} className="text-zinc-600" /> Stocks <span className="text-muted-foreground font-normal text-[10px]">(optional)</span>
                    </Label>
                    <Input
                      id="meal-stocks"
                      type="number"
                      min={0}
                      placeholder="0"
                      value={stocks}
                      onChange={(e) => setStocks(e.target.value === "" ? "" : Number(e.target.value))}
                      className="h-9 text-xs bg-white mt-1 font-bold"
                    />
                  </Field>
                </div>
              </FieldGroup>
            )}
          </div>

          {/* Sheet Footer */}
          {!isSuccess && (
            <SheetFooter className="p-4 border-t border-border bg-card flex flex-row items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-xs px-5 h-9"
              >
                <Plus size={14} />
                Save Meal
              </Button>
            </SheetFooter>
          )}
        </form>
      </SheetContent>
    </Sheet>
  )
}

