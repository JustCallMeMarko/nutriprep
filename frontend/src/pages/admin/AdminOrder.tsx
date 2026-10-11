import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Check,
  CheckCircle2,
  Clock,
  Columns3,
  Eye,
  GripVertical,
  MapPin,
  Package,
  Phone,
  Search,
  Table as TableIcon,
  Truck,
  UserPlus,
  Utensils,
  X,
} from "lucide-react"

import Food1 from "@/assets/landing/Food1.png"
import Food2 from "@/assets/landing/Food2.png"
import Food3 from "@/assets/landing/Food3.png"
import Salad from "@/assets/landing/salad.png"
import OrderDataTable, {
  type Order,
  type OrderRider,
  type OrderStatus,
} from "@/components/OrderDataTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useApi } from "@/lib/api"

function FigmaStar() {
  return (
    <svg
      width="11"
      height="12"
      viewBox="0 0 11 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block shrink-0"
    >
      <path
        d="M5.5 0L6.9855 4.37946L11 6L6.9855 7.62054L5.5 12L4.0145 7.62054L0 6L4.0145 4.37946L5.5 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const KANBAN_COLUMNS: {
  id: OrderStatus
  title: string
  subtitle: string
  color: string
  bgColor: string
  borderColor: string
  badgeColor: string
  dotColor: string
  icon: typeof Clock
}[] = [
  {
    id: "Upcoming",
    title: "Upcoming",
    subtitle: "Scheduled for next batch",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-50/70 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-900/60",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    dotColor: "bg-blue-600",
    icon: Clock,
  },
  {
    id: "Preparing",
    title: "Preparing",
    subtitle: "In kitchen prep & packing",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50/70 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-900/60",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500 animate-pulse",
    icon: Utensils,
  },
  {
    id: "Out for Delivery",
    title: "Out for Delivery",
    subtitle: "En route with courier",
    color: "text-indigo-700 dark:text-indigo-400",
    bgColor: "bg-indigo-50/70 dark:bg-indigo-950/20",
    borderColor: "border-indigo-200 dark:border-indigo-900/60",
    badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
    dotColor: "bg-indigo-600",
    icon: Truck,
  },
  {
    id: "Delivered",
    title: "Delivered",
    subtitle: "Completed drop-offs",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-50/70 dark:bg-emerald-950/20",
    borderColor: "border-emerald-200 dark:border-emerald-900/60",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-600",
    icon: CheckCircle2,
  },
]

const AVAILABLE_RIDERS: OrderRider[] = [
  {
    id: "r1",
    name: "Carlos Mendoza",
    vehicle: "E-Bike #04",
    phone: "+63 918 842 1109",
    rating: "4.9",
    activeLoads: 2,
  },
  {
    id: "r2",
    name: "Samantha Lee",
    vehicle: "Scooter #12",
    phone: "+63 917 334 9812",
    rating: "4.8",
    activeLoads: 1,
  },
  {
    id: "r3",
    name: "David Kim",
    vehicle: "Motorbike #09",
    phone: "+63 920 119 4432",
    rating: "5.0",
    activeLoads: 1,
  },
  {
    id: "r4",
    name: "Aria Thorne",
    vehicle: "E-Bike #02",
    phone: "+63 922 761 0045",
    rating: "4.9",
    activeLoads: 3,
  },
]

const INITIAL_ORDERS: Order[] = [
  {
    id: "#ORD-9021",
    customerName: "Eleanor Vance",
    customerPhone: "+63 917 555 0192",
    customerEmail: "eleanor.vance@gmail.com",
    items: [
      {
        title: "Veggie Egg White Omelette",
        quantity: 2,
        calories: 310,
        protein_g: 26,
        credits: 4,
        price: 4,
        image_url: Food1,
      },
    ],
    totalAmount: 8,
    deliveryWave: "Lunch Wave",
    deliverySlot: "11:30 AM - 12:30 PM",
    address: "1024 Writer's Way, Suite 5",
    city: "Makati",
    deliveryNotes: "Please leave with concierge on the 5th floor.",
    status: "Preparing",
    rider: null,
    placedAt: "10:45 AM",
    paymentMethod: "NutriPrep Credits",
    paymentStatus: "Paid",
  },
  {
    id: "#ORD-9022",
    customerName: "Theo Crain",
    customerPhone: "+63 918 342 9811",
    customerEmail: "theo.crain@designstudio.ph",
    items: [
      {
        title: "Chicken cacciatore",
        quantity: 1,
        calories: 250,
        protein_g: 32,
        credits: 3,
        price: 3,
        image_url: Food2,
      },
      {
        title: "Mediterranean Salmon Salad",
        quantity: 1,
        calories: 340,
        protein_g: 30,
        credits: 5,
        price: 5,
        image_url: Salad,
      },
    ],
    totalAmount: 8,
    deliveryWave: "Lunch Wave",
    deliverySlot: "11:30 AM - 12:30 PM",
    address: "334 Main St, Apt 4A",
    city: "BGC, Taguig",
    deliveryNotes: "Call on arrival at the lobby entrance.",
    status: "Upcoming",
    rider: null,
    placedAt: "10:50 AM",
    paymentMethod: "NutriPrep Credits",
    paymentStatus: "Paid",
  },
  {
    id: "#ORD-9023",
    customerName: "Luke Crain",
    customerPhone: "+63 920 891 0023",
    customerEmail: "luke.c@wellness.org",
    items: [
      {
        title: "Mediterranean Salmon Salad",
        quantity: 1,
        calories: 340,
        protein_g: 30,
        credits: 5,
        price: 5,
        image_url: Salad,
      },
    ],
    totalAmount: 5,
    deliveryWave: "Lunch Wave",
    deliverySlot: "11:30 AM - 12:30 PM",
    address: "12 Caretaker Lodge, Unit B",
    city: "Ortigas, Pasig",
    deliveryNotes: "Drop on front door porch, no need to ring bell.",
    status: "Out for Delivery",
    rider: AVAILABLE_RIDERS[0],
    placedAt: "11:00 AM",
    paymentMethod: "NutriPrep Credits",
    paymentStatus: "Paid",
  },
  {
    id: "#ORD-9024",
    customerName: "Shirley Crain",
    customerPhone: "+63 919 443 2219",
    customerEmail: "shirley.c@mortuaryarts.com",
    items: [
      {
        title: "High Protein Beef Power Bowl",
        quantity: 2,
        calories: 450,
        protein_g: 38,
        credits: 6,
        price: 6,
        image_url: Food1,
      },
    ],
    totalAmount: 12,
    deliveryWave: "Lunch Wave",
    deliverySlot: "11:30 AM - 12:30 PM",
    address: "892 Massachusetts Ave",
    city: "Mandaluyong",
    deliveryNotes: "Deliver before 12:15 PM if possible.",
    status: "Preparing",
    rider: null,
    placedAt: "11:10 AM",
    paymentMethod: "NutriPrep Credits",
    paymentStatus: "Paid",
  },
  {
    id: "#ORD-9025",
    customerName: "Steven Crain",
    customerPhone: "+63 917 220 8731",
    customerEmail: "author.steven@crainbooks.com",
    items: [
      {
        title: "Potato with Chicken",
        quantity: 1,
        calories: 200,
        protein_g: 28,
        credits: 5,
        price: 5,
        image_url: Food3,
      },
      {
        title: "Veggie Egg White Omelette",
        quantity: 1,
        calories: 310,
        protein_g: 26,
        credits: 4,
        price: 4,
        image_url: Food1,
      },
    ],
    totalAmount: 9,
    deliveryWave: "Lunch Wave",
    deliverySlot: "11:30 AM - 12:30 PM",
    address: "400 Blueprint Ave, Penthouse",
    city: "Makati",
    deliveryNotes: "Front desk security has guest elevator key.",
    status: "Upcoming",
    rider: AVAILABLE_RIDERS[2],
    placedAt: "11:15 AM",
    paymentMethod: "NutriPrep Credits",
    paymentStatus: "Paid",
  },
  {
    id: "#ORD-9026",
    customerName: "Arthur Pendelton",
    customerPhone: "+63 922 411 9090",
    customerEmail: "arthur.p@lawfirm.ph",
    items: [
      {
        title: "High Protein Beef Power Bowl",
        quantity: 1,
        calories: 450,
        protein_g: 38,
        credits: 6,
        price: 6,
        image_url: Food1,
      },
    ],
    totalAmount: 6,
    deliveryWave: "Lunch Wave",
    deliverySlot: "11:30 AM - 12:30 PM",
    address: "55 Oakwood Drive",
    city: "Quezon City",
    deliveryNotes: "Security guard will receive at gate.",
    status: "Upcoming",
    rider: null,
    placedAt: "11:20 AM",
    paymentMethod: "NutriPrep Credits",
    paymentStatus: "Paid",
  },
  {
    id: "#ORD-9027",
    customerName: "Nellie Vance",
    customerPhone: "+63 918 765 4321",
    customerEmail: "nellie.v@cupoftea.org",
    items: [
      {
        title: "Mediterranean Salmon Salad",
        quantity: 1,
        calories: 340,
        protein_g: 30,
        credits: 5,
        price: 5,
        image_url: Salad,
      },
      {
        title: "Chicken cacciatore",
        quantity: 1,
        calories: 250,
        protein_g: 32,
        credits: 3,
        price: 3,
        image_url: Food2,
      },
    ],
    totalAmount: 8,
    deliveryWave: "Lunch Wave",
    deliverySlot: "11:30 AM - 12:30 PM",
    address: "42 Hill House St, Floor 1",
    city: "San Juan",
    deliveryNotes: "Friendly golden retriever in front yard, gate is unlocked.",
    status: "Preparing",
    rider: null,
    placedAt: "11:30 AM",
    paymentMethod: "NutriPrep Credits",
    paymentStatus: "Paid",
  },
  {
    id: "#ORD-9028",
    customerName: "Hugh Crain",
    customerPhone: "+63 917 111 8899",
    customerEmail: "hugh.crain@heritagearch.ph",
    items: [
      {
        title: "Chicken cacciatore",
        quantity: 1,
        calories: 250,
        protein_g: 32,
        credits: 3,
        price: 3,
        image_url: Food2,
      },
    ],
    totalAmount: 3,
    deliveryWave: "Morning Wave",
    deliverySlot: "7:00 AM - 8:30 AM",
    address: "101 Manor Boulevard",
    city: "Muntinlupa",
    deliveryNotes: "Leave at main door steps.",
    status: "Upcoming",
    rider: AVAILABLE_RIDERS[1],
    placedAt: "6:45 AM",
    paymentMethod: "NutriPrep Credits",
    paymentStatus: "Paid",
  },
  {
    id: "#ORD-9029",
    customerName: "Clara Dudley",
    customerPhone: "+63 920 333 4455",
    customerEmail: "clara.d@hollowhouse.com",
    items: [
      {
        title: "Veggie Egg White Omelette",
        quantity: 1,
        calories: 310,
        protein_g: 26,
        credits: 4,
        price: 4,
        image_url: Food1,
      },
      {
        title: "Potato with Chicken",
        quantity: 1,
        calories: 200,
        protein_g: 28,
        credits: 5,
        price: 5,
        image_url: Food3,
      },
    ],
    totalAmount: 9,
    deliveryWave: "Lunch Wave",
    deliverySlot: "11:30 AM - 12:30 PM",
    address: "71 Red Cedar Lane",
    city: "Pasay",
    deliveryNotes: "Do not arrive after 12:45 PM.",
    status: "Out for Delivery",
    rider: AVAILABLE_RIDERS[3],
    placedAt: "11:40 AM",
    paymentMethod: "NutriPrep Credits",
    paymentStatus: "Paid",
  },
  {
    id: "#ORD-9030",
    customerName: "Horace Dudley",
    customerPhone: "+63 919 888 7766",
    customerEmail: "horace.d@groundskeeping.ph",
    items: [
      {
        title: "High Protein Beef Power Bowl",
        quantity: 1,
        calories: 450,
        protein_g: 38,
        credits: 6,
        price: 6,
        image_url: Food1,
      },
    ],
    totalAmount: 6,
    deliveryWave: "Morning Wave",
    deliverySlot: "7:00 AM - 8:30 AM",
    address: "73 Red Cedar Lane",
    city: "Pasay",
    deliveryNotes: "Drop package in the mailbox container.",
    status: "Delivered",
    rider: AVAILABLE_RIDERS[0],
    placedAt: "6:30 AM",
    paymentMethod: "NutriPrep Credits",
    paymentStatus: "Paid",
  },
  {
    id: "#ORD-9031",
    customerName: "Marcus Thorne",
    customerPhone: "+63 917 999 1234",
    customerEmail: "marcus.t@thorneinvest.com",
    items: [
      {
        title: "Mediterranean Salmon Salad",
        quantity: 2,
        calories: 340,
        protein_g: 30,
        credits: 5,
        price: 5,
        image_url: Salad,
      },
    ],
    totalAmount: 10,
    deliveryWave: "Lunch Wave",
    deliverySlot: "11:30 AM - 12:30 PM",
    address: "210 Grand Avenue",
    city: "Mandaluyong",
    deliveryNotes: "Building 3, Unit 1402.",
    status: "Preparing",
    rider: null,
    placedAt: "11:55 AM",
    paymentMethod: "NutriPrep Credits",
    paymentStatus: "Paid",
  },
  {
    id: "#ORD-9032",
    customerName: "Elena Rodriguez",
    customerPhone: "+63 918 223 9988",
    customerEmail: "elena.r@designers.ph",
    items: [
      {
        title: "Veggie Egg White Omelette",
        quantity: 1,
        calories: 310,
        protein_g: 26,
        credits: 4,
        price: 4,
        image_url: Food1,
      },
    ],
    totalAmount: 4,
    deliveryWave: "Lunch Wave",
    deliverySlot: "11:30 AM - 12:30 PM",
    address: "95 Ayala Avenue, Tower 1",
    city: "Makati",
    deliveryNotes: "Leave at front desk with security.",
    status: "Delivered",
    rider: AVAILABLE_RIDERS[1],
    placedAt: "12:00 PM",
    paymentMethod: "NutriPrep Credits",
    paymentStatus: "Paid",
  },
]

void INITIAL_ORDERS

export default function AdminOrder() {
  const { makeRequest } = useApi()
  const ordersQuery = useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: () => makeRequest("orders"),
    staleTime: 30_000,
  })
  const ridersQuery = useQuery<OrderRider[]>({
    queryKey: ["admin-riders"],
    queryFn: () => makeRequest("riders"),
    staleTime: 60_000,
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<"all" | OrderStatus>("all")

  // Drag & drop state for Kanban
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<OrderStatus | null>(null)

  // Modals & Drawers state
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null)
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null)
  const [batchAssignOrders, setBatchAssignOrders] = useState<Order[] | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (ordersQuery.data) setOrders(ordersQuery.data)
  }, [ordersQuery.data])

  const getOrderId = (orderId: string) => orderId.replace("#ORD-", "")
  const toApiStatus = (status: OrderStatus) => ({
    Upcoming: "pending",
    Preparing: "preparing",
    "Out for Delivery": "out_for_delivery",
    Delivered: "delivered",
    Ready: "preparing",
    Cancelled: "cancelled",
  })[status]

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handle single status change
  const handleUpdateStatus = async (order: Order, newStatus: OrderStatus) => {
    try {
      const updated = await makeRequest(`orders/${getOrderId(order.id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: toApiStatus(newStatus) }),
      }) as Order
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
      setInspectingOrder((prev) => (prev?.id === updated.id ? updated : prev))
      showToast(`Updated ${order.id} status to "${newStatus}"`)
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update order status.")
    }
  }

  // Handle batch status change
  const handleBatchUpdateStatus = (
    targetOrders: Order[],
    newStatus: OrderStatus
  ) => {
    void Promise.all(
      targetOrders.map((order) =>
        makeRequest(`orders/${getOrderId(order.id)}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: toApiStatus(newStatus) }),
        }) as Promise<Order>
      )
    )
      .then((updatedOrders) => {
        const updatedById = new Map(updatedOrders.map((order) => [order.id, order]))
        setOrders((prev) => prev.map((order) => updatedById.get(order.id) ?? order))
        showToast(`Updated ${targetOrders.length} order(s) to "${newStatus}"`)
      })
      .catch((error) => {
        showToast(error instanceof Error ? error.message : "Could not update orders.")
      })
  }

  // Handle single rider assign
  const handleAssignRider = async (order: Order, rider: OrderRider) => {
    try {
      const updated = await makeRequest(`orders/${getOrderId(order.id)}/rider`, {
        method: "PUT",
        body: JSON.stringify({ rider_id: rider.id }),
      }) as Order
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
      setInspectingOrder((prev) => (prev?.id === updated.id ? updated : prev))
      setAssigningOrder(null)
      showToast(`Assigned courier ${rider.name} to ${order.id}`)
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not assign courier.")
    }
  }

  // Handle batch rider assign
  const handleBatchAssignRider = (
    targetOrders: Order[],
    rider: OrderRider
  ) => {
    void Promise.all(
      targetOrders.map((order) =>
        makeRequest(`orders/${getOrderId(order.id)}/rider`, {
          method: "PUT",
          body: JSON.stringify({ rider_id: rider.id }),
        }) as Promise<Order>
      )
    )
      .then((updatedOrders) => {
        const updatedById = new Map(updatedOrders.map((order) => [order.id, order]))
        setOrders((prev) => prev.map((order) => updatedById.get(order.id) ?? order))
        setBatchAssignOrders(null)
        showToast(`Assigned ${rider.name} to ${targetOrders.length} order(s)`)
      })
      .catch((error) => {
        showToast(error instanceof Error ? error.message : "Could not assign courier.")
      })
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData("text/plain", orderId)
    setDraggedOrderId(orderId)
  }

  const handleDragEnd = () => {
    setDraggedOrderId(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnId: OrderStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId)
    }
  }

  const handleDrop = (e: React.DragEvent, targetStatus: OrderStatus) => {
    e.preventDefault()
    const orderId = e.dataTransfer.getData("text/plain") || draggedOrderId
    if (!orderId) return

    const targetOrder = orders.find((o) => o.id === orderId)
    if (targetOrder && targetOrder.status !== targetStatus) {
      handleUpdateStatus(targetOrder, targetStatus)
    }
    setDraggedOrderId(null)
    setDragOverColumn(null)
  }

  // Filtered orders calculation
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.toLowerCase().includes(q) ||
        order.address.toLowerCase().includes(q) ||
        order.city.toLowerCase().includes(q) ||
        order.items.some((i) => i.title.toLowerCase().includes(q)) ||
        (order.rider && order.rider.name.toLowerCase().includes(q))

      if (!matchesSearch) return false

      if (viewMode === "table" && selectedStatus !== "all" && order.status !== selectedStatus) {
        return false
      }

      return true
    })
  }, [orders, searchQuery, selectedStatus, viewMode])

  // Status counts
  const totalCount = orders.length
  const upcomingCount = orders.filter((o) => o.status === "Upcoming").length
  const preparingCount = orders.filter((o) => o.status === "Preparing").length
  const outForDeliveryCount = orders.filter((o) => o.status === "Out for Delivery").length
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length
  const totalCredits = orders.reduce((sum, o) => sum + o.totalAmount, 0)

  // Next/prev status transitions for Kanban cards
  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    if (current === "Upcoming") return "Preparing"
    if (current === "Preparing") return "Out for Delivery"
    return null
  }

  const getPrevStatus = (current: OrderStatus): OrderStatus | null => {
    if (current === "Delivered") return "Out for Delivery"
    if (current === "Out for Delivery") return "Preparing"
    if (current === "Preparing") return "Upcoming"
    return null
  }

  const getActionLabel = (next: OrderStatus): string => {
    if (next === "Preparing") return "Start Prep"
    if (next === "Out for Delivery") return "Dispatch"
    if (next === "Delivered") return "Deliver"
    return "Advance"
  }

  return (
    <section className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-[#1B1B1B]">
            Order Management
          </h1>
          <p className="text-sm text-[#4C4546] mt-0.5">
            Real-time kitchen preparation, delivery schedules, and courier dispatch.
          </p>
        </div>

        {/* View Mode Toggle: Kanban Mode vs Table Mode */}
        <ButtonGroup>
          <Button
            variant={viewMode === "kanban" ? "default" : "outline"}
            onClick={() => setViewMode("kanban")}
            className="cursor-pointer gap-1.5 text-xs font-semibold"
          >
            <Columns3 size={15} />
            Kanban
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            onClick={() => setViewMode("table")}
            className="cursor-pointer gap-1.5 text-xs font-semibold"
          >
            <TableIcon size={15} />
            Table
          </Button>
        </ButtonGroup>
      </div>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="p-3.5 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-md flex items-center justify-between transition-all animate-in fade-in">
          <span className="flex items-center gap-2">
            <Check className="size-4 shrink-0" />
            {toastMessage}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 cursor-pointer hover:bg-blue-700 rounded-md"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {ordersQuery.isLoading && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-xs font-semibold text-blue-800">
          Loading orders from the server...
        </div>
      )}
      {ordersQuery.isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-800">
          <span>Unable to load orders. Check the backend connection.</span>
          <Button size="sm" variant="outline" onClick={() => void ordersQuery.refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Orders */}
        <div
          onClick={() => {
            if (viewMode === "table") setSelectedStatus("all")
          }}
          className={`flex flex-col justify-between p-4 rounded-xl border transition-all ${
            viewMode === "table" && selectedStatus === "all"
              ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600/30"
              : "border-[#E2E2E2] bg-white hover:border-zinc-300"
          } ${viewMode === "table" ? "cursor-pointer" : ""}`}
        >
          <div className="flex justify-between items-start pb-2">
            <span className="text-[11px] font-bold tracking-wider text-[#4C4546] uppercase">
              Total Today
            </span>
            <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700">
              <Package size={15} />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-[#1B1B1B]">
              {totalCount} Orders
            </p>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5 flex items-center gap-1">
              <FigmaStar />
              <span>{totalCredits} credits volume</span>
            </p>
          </div>
        </div>

        {/* Upcoming */}
        <div
          onClick={() => {
            if (viewMode === "table") setSelectedStatus("Upcoming")
          }}
          className={`flex flex-col justify-between p-4 rounded-xl border transition-all ${
            viewMode === "table" && selectedStatus === "Upcoming"
              ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600/30"
              : "border-[#E2E2E2] bg-white hover:border-zinc-300"
          } ${viewMode === "table" ? "cursor-pointer" : ""}`}
        >
          <div className="flex justify-between items-start pb-2">
            <span className="text-[11px] font-bold tracking-wider text-[#4C4546] uppercase">
              Upcoming
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Clock size={15} />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-[#1B1B1B]">
              {upcomingCount} Orders
            </p>
            <p className="text-[11px] font-medium text-blue-600 mt-0.5">
              Next batch queue
            </p>
          </div>
        </div>

        {/* Preparing */}
        <div
          onClick={() => {
            if (viewMode === "table") setSelectedStatus("Preparing")
          }}
          className={`flex flex-col justify-between p-4 rounded-xl border transition-all ${
            viewMode === "table" && selectedStatus === "Preparing"
              ? "border-amber-500 bg-amber-50/40 ring-1 ring-amber-500/30"
              : "border-[#E2E2E2] bg-white hover:border-zinc-300"
          } ${viewMode === "table" ? "cursor-pointer" : ""}`}
        >
          <div className="flex justify-between items-start pb-2">
            <span className="text-[11px] font-bold tracking-wider text-[#4C4546] uppercase">
              In Kitchen
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Utensils size={15} />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-[#1B1B1B]">
              {preparingCount} Orders
            </p>
            <p className="text-[11px] font-medium text-amber-600 mt-0.5">
              Active meal prep
            </p>
          </div>
        </div>

        {/* Out for Delivery */}
        <div
          onClick={() => {
            if (viewMode === "table") setSelectedStatus("Out for Delivery")
          }}
          className={`flex flex-col justify-between p-4 rounded-xl border transition-all ${
            viewMode === "table" && selectedStatus === "Out for Delivery"
              ? "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600/30"
              : "border-[#E2E2E2] bg-white hover:border-zinc-300"
          } ${viewMode === "table" ? "cursor-pointer" : ""}`}
        >
          <div className="flex justify-between items-start pb-2">
            <span className="text-[11px] font-bold tracking-wider text-[#4C4546] uppercase">
              Out for Delivery
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Truck size={15} />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-[#1B1B1B]">
              {outForDeliveryCount} Orders
            </p>
            <p className="text-[11px] font-medium text-indigo-600 mt-0.5">
              En route with rider
            </p>
          </div>
        </div>

        {/* Delivered */}
        <div
          onClick={() => {
            if (viewMode === "table") setSelectedStatus("Delivered")
          }}
          className={`flex flex-col justify-between p-4 rounded-xl border transition-all ${
            viewMode === "table" && selectedStatus === "Delivered"
              ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600/30"
              : "border-[#E2E2E2] bg-white hover:border-zinc-300"
          } ${viewMode === "table" ? "cursor-pointer" : ""}`}
        >
          <div className="flex justify-between items-start pb-2">
            <span className="text-[11px] font-bold tracking-wider text-[#4C4546] uppercase">
              Delivered
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-[#1B1B1B]">
              {deliveredCount} Orders
            </p>
            <p className="text-[11px] font-medium text-emerald-600 mt-0.5">
              Completed on time
            </p>
          </div>
        </div>
      </div>

      {/* Main Filter Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex items-center w-full lg:w-80">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search order #, customer, meals, rider..."
            className="pl-9 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right Controls: Filters for Table Mode */}
        {viewMode === "table" && (
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <ButtonGroup className="flex flex-wrap">
              <Button
                variant={selectedStatus === "all" ? "default" : "outline"}
                onClick={() => setSelectedStatus("all")}
                className="cursor-pointer text-xs"
              >
                All ({orders.length})
              </Button>
              <Button
                variant={selectedStatus === "Upcoming" ? "default" : "outline"}
                onClick={() => setSelectedStatus("Upcoming")}
                className="cursor-pointer text-xs"
              >
                Upcoming ({upcomingCount})
              </Button>
              <Button
                variant={selectedStatus === "Preparing" ? "default" : "outline"}
                onClick={() => setSelectedStatus("Preparing")}
                className="cursor-pointer text-xs"
              >
                Preparing ({preparingCount})
              </Button>
              <Button
                variant={
                  selectedStatus === "Out for Delivery" ? "default" : "outline"
                }
                onClick={() => setSelectedStatus("Out for Delivery")}
                className="cursor-pointer text-xs"
              >
                Out ({outForDeliveryCount})
              </Button>
              <Button
                variant={selectedStatus === "Delivered" ? "default" : "outline"}
                onClick={() => setSelectedStatus("Delivered")}
                className="cursor-pointer text-xs"
              >
                Delivered ({deliveredCount})
              </Button>
            </ButtonGroup>
          </div>
        )}
      </div>

      {/* VIEW: KANBAN BOARD */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
          {KANBAN_COLUMNS.filter((column) => column.id !== "Delivered").map((column) => {
            const columnOrders = filteredOrders.filter(
              (o) => o.status === column.id
            )
            const ColumnIcon = column.icon
            const isDropTarget = dragOverColumn === column.id

            return (
              <div
                key={column.id}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`flex flex-col rounded-2xl border transition-all ${
                  isDropTarget
                    ? `${column.borderColor} ring-2 ring-blue-500/40 ${column.bgColor}`
                    : "border-[#E2E2E2] bg-zinc-50/50 dark:bg-zinc-900/30"
                }`}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-[#E2E2E2] flex items-center justify-between bg-white dark:bg-zinc-900 rounded-t-2xl">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-1.5 rounded-lg ${column.badgeColor}`}
                    >
                      <ColumnIcon size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {column.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {column.subtitle}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`font-bold text-xs px-2 py-0.5 rounded-full ${column.badgeColor}`}
                  >
                    {columnOrders.length}
                  </Badge>
                </div>

                {/* Column Cards Container */}
                <div className="p-3 flex flex-col gap-3 min-h-[460px]">
                  {columnOrders.length > 0 ? (
                    columnOrders.map((order) => {
                      const nextStatus = getNextStatus(order.status)
                      const prevStatus = getPrevStatus(order.status)
                      const totalCals = order.items.reduce(
                        (s, i) => s + i.calories * i.quantity,
                        0
                      )
                      const totalProtein = order.items.reduce(
                        (s, i) => s + i.protein_g * i.quantity,
                        0
                      )

                      return (
                        <div
                          key={order.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, order.id)}
                          onDragEnd={handleDragEnd}
                          className="group bg-white dark:bg-zinc-900 rounded-xl border border-[#E2E2E2] hover:border-blue-400 dark:hover:border-blue-700 shadow-xs hover:shadow-md transition-all p-3.5 flex flex-col gap-3 cursor-grab active:cursor-grabbing"
                        >
                          {/* Card Top: Order ID + Time + Slot */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <GripVertical className="size-3.5 text-muted-foreground/50 group-hover:text-muted-foreground" />
                              <button
                                type="button"
                                onClick={() => setInspectingOrder(order)}
                                className="font-bold text-xs text-foreground hover:text-blue-600 transition-colors cursor-pointer"
                              >
                                {order.id}
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                {order.placedAt}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 font-medium"
                              >
                                {order.deliverySlot}
                              </Badge>
                            </div>
                          </div>

                          {/* Customer & Address */}
                          <div className="flex flex-col gap-0.5">
                            <p className="font-semibold text-xs text-foreground truncate">
                              {order.customerName}
                            </p>
                            <span
                              className="text-[11px] text-muted-foreground flex items-center gap-1 truncate"
                              title={`${order.address}, ${order.city}`}
                            >
                              <MapPin size={11} className="shrink-0 text-muted-foreground/70" />
                              {order.address}, {order.city}
                            </span>
                          </div>

                          {/* Ordered Items Preview */}
                          <div className="space-y-1.5 border-t border-b border-zinc-100 dark:border-zinc-800 py-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2 truncate max-w-[190px]">
                                  {item.image_url ? (
                                    <img
                                      src={item.image_url}
                                      alt={item.title}
                                      className="size-7 rounded-md object-cover border border-zinc-200 shrink-0"
                                    />
                                  ) : (
                                    <div className="size-7 rounded-md bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                                      {item.quantity}x
                                    </div>
                                  )}
                                  <span className="text-[11px] font-medium text-foreground truncate">
                                    {item.title}
                                  </span>
                                </div>
                                <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                                  x{item.quantity}
                                </span>
                              </div>
                            ))}
                            <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground font-medium">
                              <span>
                                {totalCals} kcal • {totalProtein}g protein
                              </span>
                              <span className="font-bold text-foreground flex items-center gap-1">
                                <FigmaStar />
                                <span>{order.totalAmount} Credits</span>
                              </span>
                            </div>
                          </div>

                          {/* Courier Tag */}
                          <div className="flex items-center justify-between text-xs">
                            {order.rider ? (
                              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900 text-[11px] font-medium">
                                <Bike size={12} className="shrink-0" />
                                <span className="truncate max-w-[110px]">
                                  {order.rider.name}
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setAssigningOrder(order)}
                                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                              >
                                <UserPlus size={12} />
                                Assign Courier
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setInspectingOrder(order)}
                              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-0.5 cursor-pointer"
                            >
                              <Eye size={12} />
                              Details
                            </button>
                          </div>

                          {/* Action Advance / Revert Buttons */}
                          <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                            {prevStatus ? (
                              <Button
                                type="button"
                                size="xs"
                                variant="ghost"
                                onClick={() => handleUpdateStatus(order, prevStatus)}
                                className="cursor-pointer text-[10px] font-semibold px-2 text-muted-foreground hover:text-foreground"
                                title={`Move back to ${prevStatus}`}
                              >
                                <ArrowLeft size={11} className="mr-0.5" />
                                Back
                              </Button>
                            ) : (
                              <div />
                            )}

                            {nextStatus && (
                              <Button
                                type="button"
                                size="xs"
                                onClick={() => handleUpdateStatus(order, nextStatus)}
                                className={`cursor-pointer text-[10px] font-semibold px-2.5 gap-1 ${
                                  nextStatus === "Delivered"
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : ""
                                }`}
                              >
                                <span>{getActionLabel(nextStatus)}</span>
                                {nextStatus === "Delivered" ? (
                                  <Check size={11} />
                                ) : (
                                  <ArrowRight size={11} />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl my-auto">
                      <ColumnIcon size={24} className="mb-2 opacity-40" />
                      <p className="text-xs font-semibold">No orders here</p>
                      <p className="text-[11px] opacity-75">
                        Drag orders here to update status
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* VIEW: TABLE MODE */
        <OrderDataTable
          data={filteredOrders}
          onViewOrder={(order) => setInspectingOrder(order)}
          onAssignRider={(order) => setAssigningOrder(order)}
          onUpdateStatus={handleUpdateStatus}
          onBatchUpdateStatus={handleBatchUpdateStatus}
          onBatchAssignRider={(targetOrders) =>
            setBatchAssignOrders(targetOrders)
          }
        />
      )}

      {/* Order Details Slide-over Drawer (Sheet) */}
      <Sheet
        open={!!inspectingOrder}
        onOpenChange={(open) => {
          if (!open) setInspectingOrder(null)
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-6 flex flex-col gap-6">
          {inspectingOrder && (
            <>
              {/* Drawer Header */}
              <SheetHeader className="p-0 border-b border-[#E2E2E2] pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
                      Order {inspectingOrder.id}
                    </SheetTitle>
                    <Badge
                      variant="outline"
                      className="rounded-full text-xs font-bold px-2.5 py-0.5"
                    >
                      {inspectingOrder.status}
                    </Badge>
                  </div>
                </div>
                <SheetDescription className="text-xs text-muted-foreground mt-1">
                  Placed today at {inspectingOrder.placedAt} ({inspectingOrder.deliverySlot})
                </SheetDescription>
              </SheetHeader>

              {/* Status Action Banner */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-blue-900">Current Phase</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    {inspectingOrder.status === "Upcoming" &&
                      "Order is queued for the upcoming preparation batch."}
                    {inspectingOrder.status === "Preparing" &&
                      "Order is in the kitchen undergoing meal prep."}
                    {inspectingOrder.status === "Out for Delivery" &&
                      "Order is on the road with the assigned courier."}
                    {inspectingOrder.status === "Delivered" &&
                      "Customer has received this order."}
                    {inspectingOrder.status === "Cancelled" &&
                      "This order has been cancelled."}
                  </p>
                </div>

                {inspectingOrder.status === "Upcoming" && (
                  <Button
                    size="sm"
                    className="cursor-pointer text-xs"
                    onClick={() =>
                      handleUpdateStatus(inspectingOrder, "Preparing")
                    }
                  >
                    <Utensils size={14} />
                    Start Kitchen Prep
                  </Button>
                )}
                {inspectingOrder.status === "Preparing" && (
                  <Button
                    size="sm"
                    className="cursor-pointer text-xs"
                    onClick={() =>
                      handleUpdateStatus(inspectingOrder, "Out for Delivery")
                    }
                  >
                    <Truck size={14} />
                    Dispatch Courier
                  </Button>
                )}
              </div>

              {/* Customer Information Card */}
              <div className="p-4 rounded-xl border border-[#E2E2E2] bg-white space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Customer & Delivery
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                    <span className="text-muted-foreground">Recipient</span>
                    <span className="font-semibold text-foreground">
                      {inspectingOrder.customerName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Phone size={12} /> Contact
                    </span>
                    <span className="font-semibold text-foreground">
                      {inspectingOrder.customerPhone}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-1 border-b border-zinc-100">
                    <span className="text-muted-foreground flex items-center gap-1 shrink-0">
                      <MapPin size={12} /> Destination
                    </span>
                    <span className="font-semibold text-foreground text-right max-w-[240px]">
                      {inspectingOrder.address}, {inspectingOrder.city}
                    </span>
                  </div>
                  {inspectingOrder.deliveryNotes && (
                    <div className="py-1">
                      <span className="text-muted-foreground block text-[11px] font-semibold mb-0.5">
                        Instructions / Notes:
                      </span>
                      <p className="p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs italic">
                        "{inspectingOrder.deliveryNotes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 rounded-xl border border-[#E2E2E2] bg-white space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Ordered Meals ({inspectingOrder.items.length})
                  </h4>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {inspectingOrder.items.reduce(
                      (s, i) => s + i.calories * i.quantity,
                      0
                    )}{" "}
                    kcal
                  </span>
                </div>

                <div className="space-y-2.5">
                  {inspectingOrder.items.map((item, index) => {
                    const itemCredits = item.credits ?? item.price ?? 4
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 bg-zinc-50/50 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="size-11 rounded-lg object-cover border border-zinc-200"
                            />
                          ) : (
                            <div className="size-11 rounded-lg bg-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-500">
                              Meal
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {item.calories} kcal • {item.protein_g}g Protein
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-foreground flex items-center justify-end gap-1">
                            <FigmaStar />
                            {itemCredits * item.quantity} Credits
                          </span>
                          <p className="text-[11px] text-muted-foreground">
                            Qty: {item.quantity} × {itemCredits} Credits
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Subtotal & Total */}
                <div className="border-t border-[#E2E2E2] pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <FigmaStar />
                      {inspectingOrder.totalAmount} Credits
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span className="text-emerald-600 font-semibold">FREE (Subscription)</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t border-dashed border-zinc-200">
                    <span>Total Deducted</span>
                    <span className="flex items-center gap-1">
                      <FigmaStar />
                      {inspectingOrder.totalAmount} Credits
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned Courier Card */}
              <div className="p-4 rounded-xl border border-[#E2E2E2] bg-white space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Assigned Courier
                  </h4>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      setAssigningOrder(inspectingOrder)
                    }}
                    className="cursor-pointer text-xs font-semibold text-blue-600 border-blue-200"
                  >
                    {inspectingOrder.rider ? "Change Courier" : "Assign Courier"}
                  </Button>
                </div>

                {inspectingOrder.rider ? (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-blue-100 bg-blue-50/30">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                        {inspectingOrder.rider.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-foreground">
                          {inspectingOrder.rider.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {inspectingOrder.rider.vehicle} • ★ {inspectingOrder.rider.rating}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-700">
                      {inspectingOrder.rider.phone}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 text-center rounded-xl border border-dashed border-zinc-200 text-xs text-muted-foreground">
                    No courier currently assigned for this order.
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Assign Courier Dialog Modal */}
      <Dialog
        open={!!assigningOrder || !!batchAssignOrders}
        onOpenChange={(open) => {
          if (!open) {
            setAssigningOrder(null)
            setBatchAssignOrders(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Courier</DialogTitle>
            <DialogDescription>
              {batchAssignOrders
                ? `Assign a courier to ${batchAssignOrders.length} selected orders.`
                : `Assign a courier to order ${assigningOrder?.id} (${assigningOrder?.customerName}).`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 py-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Select an available courier:
            </p>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {(ridersQuery.data ?? []).map((rider) => (
                <div
                  key={rider.id}
                  onClick={() => {
                    if (batchAssignOrders) {
                      handleBatchAssignRider(batchAssignOrders, rider)
                    } else if (assigningOrder) {
                      handleAssignRider(assigningOrder, rider)
                    }
                  }}
                  className="p-3 rounded-xl border border-[#E2E2E2] hover:border-blue-500 hover:bg-blue-50/40 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                      {rider.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {rider.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {rider.vehicle} • ★ {rider.rating} • {rider.phone}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {rider.activeLoads} active
                  </span>
                </div>
              ))}
              {!ridersQuery.isLoading && (ridersQuery.data ?? []).length === 0 && (
                <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                  No riders are available.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}