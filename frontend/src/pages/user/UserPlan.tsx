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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Lock, LockOpen, Plus, ShoppingBag, X } from "lucide-react"
import { useApi } from "@/lib/api"

// ---------- Types ----------

type Meal = {
    id: string
    name: string
    kcal: number
    tag: "Custom" | "Favorite"
    ordered?: boolean
    image_url?: string
}

type OrderItem = {
    title: string
    quantity: number
    calories: number
    protein_g: number
    carb: number
    fat: number
    credits: number
    image_url?: string
}

type UserOrder = {
    id: string
    items: OrderItem[]
    totalAmount: number
    address: string
    status: string
    rider: { name: string; vehicle: string; phone: string } | null
    placedAt: string
}

type SlotKey = "breakfast" | "lunch" | "dinner"
type ViewMode = "weeks" | "days"

const SLOTS: { key: SlotKey; label: string; window: string }[] = [
    { key: "breakfast", label: "Breakfast", window: "7:00 – 9:00 AM" },
    { key: "lunch", label: "Lunch", window: "12:00 – 2:00 PM" },
    { key: "dinner", label: "Dinner", window: "6:00 – 8:00 PM" },
]

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

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

// Deliveries go out every day, so today's batch is already being prepped —
// editing opens again tomorrow.
function unlockDateFor(today: Date) {
    return addDays(startOfDay(today), 1)
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
    const [orders, setOrders] = useState<UserOrder[]>([])
    const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null)
    const [placingOrder, setPlacingOrder] = useState(false)
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
    const orderableDateKeys = days
        .filter((d) => !isBlocked(d, unlockDate))
        .map(dateKeyOf)
        .filter((key) =>
            SLOTS.some((s) => {
                const meal = plan[key]?.[s.key]
                return meal && !meal.ordered && meal.tag === "Favorite"
            })
        )
    const orderableMealCount = orderableDateKeys.reduce(
        (count, key) =>
            count + SLOTS.filter((s) => {
                const meal = plan[key]?.[s.key]
                return meal && !meal.ordered && meal.tag === "Favorite"
            }).length,
        0
    )
    const formattedUnlockDate = unlockDate.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
    })

    useEffect(() => {
        let active = true
        Promise.all([makeRequest("plan"), makeRequest("fav-meal"), makeRequest("orders")])
            .then(([savedPlan, favorites, savedOrders]) => {
                if (!active) return
                const nextPlan: PlannerState = {}
                savedPlan.forEach((entry: { date: string; slot: SlotKey; meal: Meal; ordered: boolean }) => {
                    nextPlan[entry.date] = {
                        ...nextPlan[entry.date],
                        [entry.slot]: { ...entry.meal, ordered: entry.ordered },
                    }
                })
                setPlan(nextPlan)
                setOrders(savedOrders)
                setFavoriteMeals(favorites.map((meal: { id: string | number; title: string; calories: number; image_url?: string }) => ({
                    id: String(meal.id),
                    name: meal.title,
                    kcal: meal.calories,
                    image_url: meal.image_url,
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
        if (plan[key]?.[slot]?.ordered) return
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

    async function placeOrder() {
        if (orderableDateKeys.length === 0 || placingOrder) return
        setPlacingOrder(true)
        try {
            const order = await makeRequest("orders", {
                method: "POST",
                body: JSON.stringify({ plan_dates: orderableDateKeys }),
            })
            const orderedKeys = new Set(orderableDateKeys)
            setPlan((prev) => {
                const next: PlannerState = { ...prev }
                for (const key of orderedKeys) {
                    const dayMeals = { ...next[key] }
                    for (const slot of SLOTS) {
                        const meal = dayMeals[slot.key]
                        if (meal && !meal.ordered && meal.tag === "Favorite") {
                            dayMeals[slot.key] = { ...meal, ordered: true }
                        }
                    }
                    next[key] = dayMeals
                }
                return next
            })
            setOrders((prev) => [order, ...prev])
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to place your order. Please try again.")
        } finally {
            setPlacingOrder(false)
        }
    }

    async function removeMeal(key: string, slot: SlotKey) {
        if (locked || isBlocked(new Date(`${key}T00:00:00`), unlockDate)) return
        if (plan[key]?.[slot]?.ordered) return
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

                <Accordion className="mb-4 rounded-lg border px-4">
                    <AccordionItem value="how-it-works" className="border-b-0">
                        <AccordionTrigger className="py-3 text-sm font-medium">
                            How meal planning works
                        </AccordionTrigger>
                        <AccordionContent>
                            <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                                <li>Deliveries go out <span className="font-medium text-foreground">every day</span>.</li>
                                <li>Pick a meal for each slot (breakfast, lunch, dinner) on any open date. Use <span className="font-medium text-foreground">Weeks</span> to see the whole week or <span className="font-medium text-foreground">Days</span> for one day.</li>
                                <li>Only past dates and today are locked — today's delivery is already being prepped. Dimmed dates in the calendar can't be edited.</li>
                                <li>When your picks look good, hit <span className="font-medium text-foreground">Place order</span> to spend your credits. Ordered meals can't be changed or removed.</li>
                                <li>Custom meals are planning notes only — only catalog meals (from your favorites) can be ordered.</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

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
                                const blocked = isBlocked(d, unlockDate)
                                return (
                                    <div
                                        key={i}
                                        className="min-w-0 border-b border-r px-1 py-2 text-center sm:px-2 bg-muted/40"
                                    >
                                        <div className="text-xs text-muted-foreground">
                                            {DAY_LABELS[d.getDay()]}
                                        </div>
                                        <div className="text-sm font-semibold">{d.getDate()}</div>
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

                {orders.length > 0 && (
                    <div className="mt-4 w-full">
                        <h2 className="mb-3 text-xl font-semibold text-foreground">Your orders</h2>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {orders.map((order) => (
                                <button
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className="flex flex-col gap-1.5 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">{order.id}</span>
                                        <Badge variant="outline" className="capitalize">
                                            {order.status.replace(/_/g, " ")}
                                        </Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {order.items.reduce((n, item) => n + item.quantity, 0)} items · {order.totalAmount} credits
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Placed {new Date(order.placedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
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
                {orderableMealCount > 0 && (
                    <Button
                        size="sm"
                        onClick={placeOrder}
                        disabled={placingOrder}
                        className="gap-2 py-4.5 cursor-pointer"
                    >
                        <ShoppingBag className="size-4" />
                        {placingOrder
                            ? "Placing order…"
                            : `Place order (${orderableMealCount} meal${orderableMealCount === 1 ? "" : "s"})`}
                    </Button>
                )}
            </div>

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            Order {selectedOrder?.id}
                            {selectedOrder && (
                                <Badge variant="outline" className="capitalize">
                                    {selectedOrder.status.replace(/_/g, " ")}
                                </Badge>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="flex flex-col gap-4 text-sm">
                            <div className="flex flex-col gap-2">
                                {selectedOrder.items.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2">
                                        <div>
                                            <div className="font-medium">{item.title}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.calories} kcal · {item.protein_g}g protein · {item.carb}g carbs · {item.fat}g fat
                                            </div>
                                        </div>
                                        <div className="text-right text-xs text-muted-foreground">
                                            <div>×{item.quantity}</div>
                                            <div>{item.credits * item.quantity} credits</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col gap-1 border-t pt-3 text-xs text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Total</span>
                                    <span className="font-medium text-foreground">{selectedOrder.totalAmount} credits</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Deliver to</span>
                                    <span className="max-w-[60%] text-right">{selectedOrder.address}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Placed</span>
                                    <span>{new Date(selectedOrder.placedAt).toLocaleString()}</span>
                                </div>
                                {selectedOrder.rider && (
                                    <div className="flex justify-between">
                                        <span>Rider</span>
                                        <span>{selectedOrder.rider.name} · {selectedOrder.rider.vehicle}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSelectedOrder(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                            >
                                <span className="flex min-w-0 items-center gap-2">
                                    {meal.image_url && (
                                        <img
                                            src={meal.image_url}
                                            alt=""
                                            className="size-9 shrink-0 rounded-md object-cover"
                                        />
                                    )}
                                    <span className="min-w-0 wrap-break-word">{meal.name}</span>
                                </span>
                                <span className="shrink-0 text-xs text-muted-foreground">{meal.kcal} kcal</span>
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
                const blocked = isBlocked(d, unlockDate)
                const meal = plan[key]?.[slot.key]
                const disabled = locked || blocked || meal?.ordered

                return (
                    <div
                        key={i}
                        className="min-w-0 border-b border-r p-1 sm:p-2 min-h-19 flex"
                    >
                        {meal ? (
                            <div className="min-w-0 w-full rounded-md border bg-background px-1.5 py-1.5 text-xs flex flex-col gap-1 sm:px-2">
                                {meal.image_url && (
                                    <img
                                        src={meal.image_url}
                                        alt=""
                                        className="h-10 w-full rounded-sm object-cover"
                                    />
                                )}
                                <div className="flex items-start justify-between gap-1">
                                    <span className="min-w-0 wrap-break-word font-medium leading-snug">{meal.name}</span>
                                    {meal.ordered ? (
                                        <Badge variant="outline" className="shrink-0 border-emerald-300 px-1 py-0 text-[10px] text-emerald-700">
                                            Ordered
                                        </Badge>
                                    ) : !disabled && (
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