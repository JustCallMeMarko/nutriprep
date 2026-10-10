"use client"

import { useEffect, useMemo, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { ButtonGroup } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Lock, LockOpen, Plus, X } from "lucide-react"
import { useApi } from "@/lib/api"

// ---------- Types ----------

type Meal = {
    id: string
    name: string
    kcal: number
    tag: "Custom" | "Favorite"
}

type SlotKey = "breakfast" | "lunch" | "dinner"
type ViewMode = "weeks" | "days"

const SLOTS: { key: SlotKey; label: string; window: string }[] = [
    { key: "breakfast", label: "Breakfast", window: "7:00 – 9:00 AM" },
    { key: "lunch", label: "Lunch", window: "12:00 – 2:00 PM" },
    { key: "dinner", label: "Dinner", window: "6:00 – 8:00 PM" },
]

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DELIVERY_DAYS = new Set([0, 3]) // Sunday, Wednesday

// ---------- Helpers ----------

function startOfDay(d: Date) {
    const copy = new Date(d)
    copy.setHours(0, 0, 0, 0)
    return copy
}

function startOfWeek(d: Date) {
    const copy = startOfDay(d)
    copy.setDate(copy.getDate() - copy.getDay())
    return copy
}

function addDays(d: Date, n: number) {
    const copy = new Date(d)
    copy.setDate(copy.getDate() + n)
    return copy
}

function dateKeyOf(d: Date) {
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${d.getFullYear()}-${month}-${day}`
}

// The delivery day that "owns" the current cycle: the most recent delivery
// day on or before `from`. Everything from this date up to (but not
// including) the *next* delivery day is already being prepped/shipped.
function currentCycleDeliveryDate(from: Date) {
    let d = startOfDay(from)
    while (!DELIVERY_DAYS.has(d.getDay())) d = addDays(d, -1)
    return d
}

// First delivery day strictly after `from`.
function nextDeliveryDateAfter(from: Date) {
    let d = addDays(startOfDay(from), 1)
    while (!DELIVERY_DAYS.has(d.getDay())) d = addDays(d, 1)
    return d
}

// The date on which the calendar unlocks again: the delivery day that
// follows whichever delivery day currently governs "today". e.g. if today
// is Wed, the Wed batch covers through Sat, and things open back up Sun.
function unlockDateFor(today: Date) {
    return nextDeliveryDateAfter(currentCycleDeliveryDate(today))
}

function isBlocked(d: Date, unlockDate: Date) {
    return startOfDay(d).getTime() < unlockDate.getTime()
}

function formatRange(start: Date, end: Date) {
    const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    return start.getTime() === end.getTime() ? fmt(start) : `${fmt(start)} – ${fmt(end)}`
}

type PlannerState = Record<string, Partial<Record<SlotKey, Meal>>> // keyed by ISO date

export default function UserPlan() {
    const { makeRequest } = useApi()
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [view, setView] = useState<ViewMode>("weeks")
    const [plan, setPlan] = useState<PlannerState>({})
    const [locked, setLocked] = useState(false)
    const [pickerFor, setPickerFor] = useState<{ dateKey: string; slot: SlotKey } | null>(null)
    const [customName, setCustomName] = useState("")
    const [favoriteMeals, setFavoriteMeals] = useState<Meal[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const activeDate = useMemo(() => date ?? new Date(), [date])
    const unlockDate = useMemo(() => unlockDateFor(new Date()), [])

    const days = useMemo(() => {
        if (view === "days") return [activeDate]
        const start = startOfWeek(activeDate)
        return Array.from({ length: 7 }, (_, i) => addDays(start, i))
    }, [view, activeDate])

    const editableDays = days.filter((d) => !isBlocked(d, unlockDate))
    const hasEditableDays = editableDays.length > 0
    const formattedUnlockDate = unlockDate.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
    })

    useEffect(() => {
        let active = true
        Promise.all([makeRequest("plan"), makeRequest("fav-meal")])
            .then(([savedPlan, favorites]) => {
                if (!active) return
                const nextPlan: PlannerState = {}
                savedPlan.forEach((entry: { date: string; slot: SlotKey; meal: Meal }) => {
                    nextPlan[entry.date] = { ...nextPlan[entry.date], [entry.slot]: entry.meal }
                })
                setPlan(nextPlan)
                setFavoriteMeals(favorites.map((meal: { id: string | number; title: string; calories: number }) => ({
                    id: String(meal.id),
                    name: meal.title,
                    kcal: meal.calories,
                    tag: "Favorite",
                })))
            })
            .catch(() => active && setError("Unable to load your meal plan. Please try again."))
            .finally(() => active && setLoading(false))
        return () => { active = false }
    }, [makeRequest])

    function openPicker(key: string, slot: SlotKey) {
        const day = days.find((d) => dateKeyOf(d) === key)
        if (locked || (day && isBlocked(day, unlockDate))) return
        setCustomName("")
        setPickerFor({ dateKey: key, slot })
    }

    async function assignMeal(meal: Meal) {
        if (!pickerFor) return
        const target = pickerFor
        try {
            await makeRequest("plan", {
                method: "PUT",
                body: JSON.stringify({
                    plan_date: target.dateKey,
                    slot: target.slot,
                    meal_id: meal.tag === "Favorite" ? Number(meal.id) : null,
                    custom_name: meal.tag === "Custom" ? meal.name : null,
                    kcal: meal.kcal,
                }),
            })
            setPlan((prev) => ({
                ...prev,
                [target.dateKey]: { ...prev[target.dateKey], [target.slot]: meal },
            }))
            setPickerFor(null)
            setError(null)
        } catch {
            setError("Unable to save this meal. Please try again.")
        }
    }

    function addCustomMeal() {
        if (!customName.trim()) return
        assignMeal({ id: `custom-${Date.now()}`, name: customName.trim(), kcal: 0, tag: "Custom" })
    }

    async function removeMeal(key: string, slot: SlotKey) {
        if (locked || isBlocked(new Date(`${key}T00:00:00`), unlockDate)) return
        try {
            await makeRequest(`plan/${key}/${slot}`, { method: "DELETE" })
            setPlan((prev) => {
                const dayMeals = { ...prev[key] }
                delete dayMeals[slot]
                return { ...prev, [key]: dayMeals }
            })
        } catch {
            setError("Unable to remove this meal. Please try again.")
        }
    }

    return (
        <section className="flex flex-col-reverse gap-4 md:flex-row">
            <div className="flex flex-1 min-w-0 flex-col gap-2 mb-8">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <h1 className="text-3xl font-bold text-foreground">Plan your meals</h1>
                    <ButtonGroup>
                        <Button
                            variant={view === "weeks" ? "default" : "outline"}
                            onClick={() => setView("weeks")}
                            className="cursor-pointer"
                        >
                            Weeks
                        </Button>
                        <Button
                            variant={view === "days" ? "default" : "outline"}
                            onClick={() => setView("days")}
                            className="cursor-pointer"
                        >
                            Days
                        </Button>
                    </ButtonGroup>
                </div>

                {loading ? (
                    <p className="text-sm text-muted-foreground">Loading your plan…</p>
                ) : error ? (
                    <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                ) : null}
                <div className="min-w-0">
                    <div className="mb-2 flex items-center justify-between text-sm font-medium text-muted-foreground">
                        <span>{formatRange(days[0], days[days.length - 1])}</span>
                        {hasEditableDays ? (
                            <span className="max-w-[60%] text-right text-xs leading-tight">
                                Editing reopens {formattedUnlockDate} — earlier dates are locked
                            </span>
                        ) : (
                            <span className="max-w-[60%] text-right text-xs leading-tight text-amber-600">
                                This {view === "days" ? "day" : "week"} is locked — editing reopens {formattedUnlockDate}
                            </span>
                        )}
                    </div>

                    <div className={view === "days" ? "rounded-lg border overflow-hidden" : "overflow-x-auto rounded-lg border lg:overflow-x-hidden"}>
                        <div
                            className={view === "days" ? "grid w-full min-w-0" : "grid min-w-190 lg:min-w-0"}
                            style={{
                                gridTemplateColumns:
                                    view === "days"
                                        ? "minmax(90px, auto) minmax(0, 1fr)"
                                        : `minmax(88px, 0.8fr) repeat(${days.length}, minmax(0, 1fr))`,
                                width: "100%",
                            }}
                        >
                            <div className="border-b border-r bg-muted/40" />
                            {days.map((d, i) => {
                                const delivery = DELIVERY_DAYS.has(d.getDay())
                                const blocked = isBlocked(d, unlockDate)
                                return (
                                    <div
                                        key={i}
                                        className={`min-w-0 border-b border-r px-1 py-2 text-center sm:px-2 ${delivery ? "bg-emerald-50" : "bg-muted/40"
                                            }`}
                                    >
                                        <div className="text-xs text-muted-foreground">
                                            {DAY_LABELS[d.getDay()]}
                                        </div>
                                        <div className="text-sm font-semibold">{d.getDate()}</div>
                                        {delivery && (
                                            <Badge
                                                variant="outline"
                                                className="mt-1 max-w-full overflow-hidden text-ellipsis whitespace-nowrap border-emerald-300 px-1 py-0 text-[10px] text-emerald-700"
                                            >
                                                Delivery day
                                            </Badge>
                                        )}
                                        {blocked && (
                                            <div className="mt-1 text-[10px] text-muted-foreground">
                                                Locked
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            {SLOTS.map((slot) => (
                                <SlotRow
                                    key={slot.key}
                                    slot={slot}
                                    days={days}
                                    plan={plan}
                                    locked={locked}
                                    unlockDate={unlockDate}
                                    onOpenPicker={openPicker}
                                    onRemove={removeMeal}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">

                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-lg border h-fit w-full"
                    captionLayout="dropdown"
                    modifiers={{ locked: (day) => isBlocked(day, unlockDate) }}
                    modifiersClassNames={{ locked: "opacity-40" }}
                />
                {hasEditableDays && (
                    <Button
                        size="sm"
                        variant={locked ? "secondary" : "default"}
                        onClick={() => setLocked((v) => !v)}
                        className="gap-2 py-4.5 cursor-pointer"
                    >
                        {locked ? <LockOpen className="size-4" /> : <Lock className="size-4" />}
                        {locked ? "Unlock" : "Lock meals"}
                    </Button>
                )}
            </div>


            <Dialog open={!!pickerFor} onOpenChange={(open) => !open && setPickerFor(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add a meal</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                        {favoriteMeals.map((meal) => (
                            <button
                                key={meal.id}
                                onClick={() => assignMeal(meal)}
                                className="flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                            >
                                <span>{meal.name}</span>
                                <span className="text-xs text-muted-foreground">{meal.kcal} kcal</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                        <Input
                            placeholder="Or type a custom meal…"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addCustomMeal()}
                        />
                        <Button onClick={addCustomMeal} disabled={!customName.trim()}>
                            Add
                        </Button>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setPickerFor(null)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    )
}

function SlotRow({
    slot,
    days,
    plan,
    locked,
    unlockDate,
    onOpenPicker,
    onRemove,
}: {
    slot: { key: SlotKey; label: string; window: string }
    days: Date[]
    plan: PlannerState
    locked: boolean
    unlockDate: Date
    onOpenPicker: (dateKey: string, slot: SlotKey) => void
    onRemove: (dateKey: string, slot: SlotKey) => void
}) {
    return (
        <>
            <div className="min-w-0 border-b border-r bg-muted/20 px-2 py-3 sm:px-3">
                <div className="text-sm font-medium">{slot.label}</div>
                <div className="text-[11px] text-muted-foreground">{slot.window}</div>
            </div>
            {days.map((d, i) => {
                const key = dateKeyOf(d)
                const delivery = DELIVERY_DAYS.has(d.getDay())
                const blocked = isBlocked(d, unlockDate)
                const meal = plan[key]?.[slot.key]
                const disabled = locked || blocked

                return (
                    <div
                        key={i}
                        className={`min-w-0 border-b border-r p-1 sm:p-2 min-h-19 flex ${delivery ? "bg-emerald-50/60" : ""
                            }`}
                    >
                        {meal ? (
                            <div className="min-w-0 w-full rounded-md border bg-background px-1.5 py-1.5 text-xs flex flex-col gap-1 sm:px-2">
                                <div className="flex items-start justify-between gap-1">
                                    <span className="min-w-0 wrap-break-word font-medium leading-snug">{meal.name}</span>
                                    {!disabled && (
                                        <button
                                            onClick={() => onRemove(key, slot.key)}
                                            className="text-muted-foreground hover:text-foreground shrink-0"
                                            aria-label="Remove meal"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    )}
                                </div>
                                {meal.kcal > 0 && (
                                    <span className="text-muted-foreground">{meal.kcal} kcal</span>
                                )}
                            </div>
                        ) : disabled ? (
                            <div className="w-full flex items-center justify-center text-muted-foreground/50">
                                <Lock className="size-3.5" />
                            </div>
                        ) : (
                            <button
                                onClick={() => onOpenPicker(key, slot.key)}
                                className="w-full flex items-center justify-center rounded-md border border-dashed text-muted-foreground hover:border-solid hover:bg-muted/50 hover:text-foreground transition-colors"
                            >
                                <Plus className="size-4" />
                            </button>
                        )}
                    </div>
                )
            })}
        </>
    )
}