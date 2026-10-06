import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type SortingState,
} from "@tanstack/react-table"
import {
  ArrowUpDown,
  Bike,
  Check,
  ChevronDown,
  Coins,
  Copy,
  CreditCard,
  Crown,
  Eye,
  MoreHorizontal,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

export type UserRole = "user" | "admin" | "rider"
export type SubscriptionPlan = "Bronze" | "Silver" | "Gold" | "Free" | "None"
export type SubscriptionStatus = "Active" | "Trialing" | "Cancelled" | "Expired" | "None"

export type ClerkUser = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  avatarUrl?: string
  role: UserRole
  subscriptionPlan: SubscriptionPlan
  subscriptionStatus: SubscriptionStatus
  credits: number
  joinedAt: string
  lastActiveAt: string
  status: "active" | "suspended"
  ordersCount: number
}

const INITIAL_CLERK_USERS: ClerkUser[] = [
  {
    id: "user_2nx98AkL310mQ",
    name: "Eleanor Vance",
    email: "eleanor.vance@gmail.com",
    emailVerified: true,
    avatarUrl: "",
    role: "admin",
    subscriptionPlan: "None",
    subscriptionStatus: "None",
    credits: 0,
    joinedAt: "Jan 12, 2026",
    lastActiveAt: "10 mins ago",
    status: "active",
    ordersCount: 28,
  },
  {
    id: "user_2nx49BtP821wX",
    name: "Theo Crain",
    email: "theo.crain@designstudio.ph",
    emailVerified: true,
    avatarUrl: "",
    role: "user",
    subscriptionPlan: "Bronze",
    subscriptionStatus: "Active",
    credits: 18,
    joinedAt: "Jan 18, 2026",
    lastActiveAt: "1 hour ago",
    status: "active",
    ordersCount: 14,
  },
  {
    id: "user_2nx71KmV903zY",
    name: "Carlos Mendoza",
    email: "carlos.m@nutriprep.ph",
    emailVerified: true,
    avatarUrl: "",
    role: "rider",
    subscriptionPlan: "Free",
    subscriptionStatus: "None",
    credits: 0,
    joinedAt: "Jan 15, 2026",
    lastActiveAt: "5 mins ago",
    status: "active",
    ordersCount: 0,
  },
  {
    id: "user_2nx14LkC452aB",
    name: "Shirley Crain",
    email: "shirley.c@mortuaryarts.com",
    emailVerified: true,
    avatarUrl: "",
    role: "user",
    subscriptionPlan: "Gold",
    subscriptionStatus: "Active",
    credits: 60,
    joinedAt: "Feb 02, 2026",
    lastActiveAt: "Yesterday",
    status: "active",
    ordersCount: 31,
  },
  {
    id: "user_2nx88NpQ771eF",
    name: "Steven Crain",
    email: "author.steven@crainbooks.com",
    emailVerified: true,
    avatarUrl: "",
    role: "admin",
    subscriptionPlan: "None",
    subscriptionStatus: "None",
    credits: 0,
    joinedAt: "Dec 10, 2025",
    lastActiveAt: "Just now",
    status: "active",
    ordersCount: 42,
  },
  {
    id: "user_2nx55RqT339pM",
    name: "Samantha Lee",
    email: "samantha.l@nutriprep.ph",
    emailVerified: true,
    avatarUrl: "",
    role: "rider",
    subscriptionPlan: "Free",
    subscriptionStatus: "None",
    credits: 0,
    joinedAt: "Jan 20, 2026",
    lastActiveAt: "20 mins ago",
    status: "active",
    ordersCount: 0,
  },
  {
    id: "user_2nx99ZaV114sR",
    name: "Nellie Vance",
    email: "nellie.v@cupoftea.org",
    emailVerified: true,
    avatarUrl: "",
    role: "user",
    subscriptionPlan: "Bronze",
    subscriptionStatus: "Active",
    credits: 16,
    joinedAt: "Feb 18, 2026",
    lastActiveAt: "5 hours ago",
    status: "active",
    ordersCount: 8,
  },
  {
    id: "user_2nx33XyM662hT",
    name: "Hugh Crain",
    email: "hugh.crain@heritagearch.ph",
    emailVerified: true,
    avatarUrl: "",
    role: "user",
    subscriptionPlan: "Silver",
    subscriptionStatus: "Active",
    credits: 35,
    joinedAt: "Jan 05, 2026",
    lastActiveAt: "Yesterday",
    status: "active",
    ordersCount: 19,
  },
  {
    id: "user_2nx62PvL884wQ",
    name: "Clara Dudley",
    email: "clara.d@hollowhouse.com",
    emailVerified: true,
    avatarUrl: "",
    role: "user",
    subscriptionPlan: "Free",
    subscriptionStatus: "None",
    credits: 0,
    joinedAt: "Feb 20, 2026",
    lastActiveAt: "3 days ago",
    status: "suspended",
    ordersCount: 1,
  },
  {
    id: "user_2nx81QwN990uE",
    name: "David Kim",
    email: "david.k@nutriprep.ph",
    emailVerified: true,
    avatarUrl: "",
    role: "rider",
    subscriptionPlan: "Free",
    subscriptionStatus: "None",
    credits: 0,
    joinedAt: "Jan 25, 2026",
    lastActiveAt: "1 hour ago",
    status: "active",
    ordersCount: 0,
  },
  {
    id: "user_2nx04TrK223zX",
    name: "Marcus Thorne",
    email: "marcus.t@thorneinvest.com",
    emailVerified: true,
    avatarUrl: "",
    role: "admin",
    subscriptionPlan: "None",
    subscriptionStatus: "None",
    credits: 0,
    joinedAt: "Dec 18, 2025",
    lastActiveAt: "1 hour ago",
    status: "active",
    ordersCount: 37,
  },
  {
    id: "user_2nx17ZmL551vY",
    name: "Elena Rodriguez",
    email: "elena.r@designers.ph",
    emailVerified: true,
    avatarUrl: "",
    role: "user",
    subscriptionPlan: "Gold",
    subscriptionStatus: "Active",
    credits: 28,
    joinedAt: "Feb 10, 2026",
    lastActiveAt: "2 hours ago",
    status: "active",
    ordersCount: 11,
  },
]
void INITIAL_CLERK_USERS

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
})

const columnHelper = createColumnHelper<typeof features, ClerkUser>()

export default function AdminUsers() {
  const { makeRequest } = useApi()
  const queryClient = useQueryClient()
  const usersQuery = useQuery<ClerkUser[]>({
    queryKey: ["admin-users"],
    queryFn: () => makeRequest("users"),
    staleTime: 30_000,
  })
  const users = usersQuery.data ?? []
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedRoleFilter, setSelectedRoleFilter] = React.useState<
    "all" | "admin" | "rider" | "user" | "subscribers"
  >("all")

  // Modals & Drawers
  const [inspectingUser, setInspectingUser] = React.useState<ClerkUser | null>(null)
  const [roleChangeUser, setRoleChangeUser] = React.useState<{
    user: ClerkUser
    targetRole: UserRole
  } | null>(null)
  const [adjustCreditsUser, setAdjustCreditsUser] = React.useState<ClerkUser | null>(null)
  const [creditAmountInput, setCreditAmountInput] = React.useState("10")
  const [changePlanUser, setChangePlanUser] = React.useState<ClerkUser | null>(null)
  const [targetPlan, setTargetPlan] = React.useState<SubscriptionPlan>("Bronze")
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  const showToast = React.useCallback((message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3500)
  }, [])

  const replaceUser = React.useCallback((updatedUser: ClerkUser) => {
    queryClient.setQueryData<ClerkUser[]>(["admin-users"], (prev = []) =>
      prev.map((user) => user.id === updatedUser.id ? updatedUser : user)
    )
    setInspectingUser((prev) => prev?.id === updatedUser.id ? updatedUser : prev)
  }, [queryClient])

  // Handle Promote / Change Role
  const handleConfirmRoleChange = async () => {
    if (!roleChangeUser) return
    const { user, targetRole } = roleChangeUser
    try {
      const updatedUser = await makeRequest(`users/${user.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: targetRole }),
      })
      replaceUser(updatedUser)
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to update the user role.")
      return
    }

    const roleNames: Record<UserRole, string> = {
      admin: "Administrator",
      rider: "Delivery Rider",
      user: "Standard User",
    }
    showToast(`Updated ${user.name}'s role to ${roleNames[targetRole]}.`)
    setRoleChangeUser(null)
  }

  // Handle Adjust Credits
  const handleConfirmAdjustCredits = async (isAdd: boolean) => {
    if (!adjustCreditsUser) return
    const amount = parseInt(creditAmountInput, 10) || 0
    if (amount <= 0) return

    try {
      const updatedUser = await makeRequest(`users/${adjustCreditsUser.id}/credits`, {
        method: "PATCH",
        body: JSON.stringify({ amount, operation: isAdd ? "add" : "deduct" }),
      })
      replaceUser(updatedUser)
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to adjust credits.")
      return
    }
    showToast(
      `${isAdd ? "Added" : "Deducted"} ${amount} credits for ${adjustCreditsUser.name}.`
    )
    setAdjustCreditsUser(null)
  }

  // Handle Subscription Plan Change
  const handleConfirmPlanChange = async () => {
    if (!changePlanUser) return
    try {
      const updatedUser = await makeRequest(`users/${changePlanUser.id}/subscription`, {
        method: "PATCH",
        body: JSON.stringify({ plan: targetPlan }),
      })
      replaceUser(updatedUser)
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to update the subscription.")
      return
    }
    showToast(`Updated ${changePlanUser.name}'s subscription to ${targetPlan}.`)
    setChangePlanUser(null)
  }

  // Handle Suspend / Activate
  const handleToggleSuspendUser = React.useCallback(async (user: ClerkUser) => {
    try {
      const updatedUser = await makeRequest(`users/${user.id}/status`, { method: "PATCH" })
      replaceUser(updatedUser)
      showToast(
        updatedUser.status === "suspended"
          ? `Account ${user.name} has been suspended.`
          : `Account ${user.name} has been reactivated.`
      )
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to update account status.")
    }
  }, [makeRequest, replaceUser, showToast])

  const handleDeleteUser = React.useCallback(async (user: ClerkUser) => {
    if (!window.confirm(`Delete ${user.name}'s account? This cannot be undone.`)) return
    try {
      await makeRequest(`users/${user.id}`, { method: "DELETE" })
      queryClient.setQueryData<ClerkUser[]>(["admin-users"], (prev = []) =>
        prev.filter((item) => item.id !== user.id)
      )
      if (inspectingUser?.id === user.id) setInspectingUser(null)
      showToast(`Deleted ${user.name}'s account.`)
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to delete the account.")
    }
  }, [inspectingUser, makeRequest, queryClient, showToast])

  // Filtered Users
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q) ||
        user.subscriptionPlan.toLowerCase().includes(q)

      if (!matchesSearch) return false

      if (selectedRoleFilter === "admin" && user.role !== "admin") return false
      if (selectedRoleFilter === "rider" && user.role !== "rider") return false
      if (selectedRoleFilter === "user" && user.role !== "user") return false
      if (
        selectedRoleFilter === "subscribers" &&
        (user.subscriptionPlan === "Free" ||
          user.subscriptionPlan === "None" ||
          user.role !== "user")
      )
        return false

      return true
    })
  }, [users, searchQuery, selectedRoleFilter])

  // KPI Metrics
  const totalUsersCount = users.length
  const adminUsersCount = users.filter((u) => u.role === "admin").length
  const riderUsersCount = users.filter((u) => u.role === "rider").length
  const regularUsersCount = users.filter((u) => u.role === "user").length
  const subscriberUsersCount = users.filter(
    (u) => u.subscriptionPlan !== "Free" && u.subscriptionPlan !== "None" && u.role === "user"
  ).length
  const totalCreditsInCirculation = users
    .filter((u) => u.role === "user")
    .reduce((sum, u) => sum + u.credits, 0)

  // TanStack Table setup
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.display({
          id: "select",
          header: ({ table }) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                indeterminate={
                  table.getIsSomePageRowsSelected() &&
                  !table.getIsAllPageRowsSelected()
                }
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
              />
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
        }),
        columnHelper.accessor("name", {
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 cursor-pointer font-bold uppercase text-xs tracking-wider"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>User / Name</span>
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ),
          cell: ({ row }) => {
            const user = row.original
            const initial = user.name ? user.name[0].toUpperCase() : "U"
            const isAdmin = user.role === "admin"
            const isRider = user.role === "rider"

            return (
              <div className="flex items-center gap-3 py-1">
                <div
                  className={`size-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                    isAdmin
                      ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300"
                      : isRider
                      ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
                  }`}
                >
                  {initial}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInspectingUser(user)}
                      className="font-bold text-sm text-foreground hover:text-blue-600 transition-colors text-left truncate cursor-pointer"
                    >
                      {user.name}
                    </button>
                    {user.status === "suspended" && (
                      <span className="text-[11px] font-semibold text-destructive">
                        (Suspended)
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono truncate">
                    {user.id}
                  </span>
                </div>
              </div>
            )
          },
        }),
        columnHelper.accessor("email", {
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 cursor-pointer font-bold uppercase text-xs tracking-wider"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>Email</span>
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ),
          cell: ({ row }) => (
            <span className="text-xs font-medium text-foreground truncate">
              {row.original.email}
            </span>
          ),
        }),
        columnHelper.accessor("subscriptionPlan", {
          header: "Subscription Plan",
          cell: ({ row }) => {
            const user = row.original
            if (user.role === "admin" || user.subscriptionPlan === "None") {
              return (
                <span className="text-xs text-muted-foreground font-medium italic">
                  —
                </span>
              )
            }
            const plan = user.subscriptionPlan

            let planBadgeClass =
              "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900"
            if (plan === "Gold") {
              planBadgeClass =
                "border-amber-300 bg-amber-100/80 text-amber-900 dark:border-amber-600/50 dark:bg-amber-950/60 dark:text-amber-300 font-bold"
            } else if (plan === "Silver") {
              planBadgeClass =
                "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 font-semibold"
            } else if (plan === "Bronze") {
              planBadgeClass =
                "border-amber-700/30 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-semibold"
            }

            return (
              <Badge
                variant="outline"
                className={`text-[11px] px-2.5 py-0.5 rounded-full ${planBadgeClass}`}
              >
                {plan === "Gold" && (
                  <Crown className="size-3 mr-1 text-amber-600 shrink-0" />
                )}
                {plan === "Silver" && (
                  <Sparkles className="size-3 mr-1 text-slate-500 shrink-0" />
                )}
                {plan}
              </Badge>
            )
          },
        }),
        columnHelper.accessor("role", {
          header: "Role",
          cell: ({ row }) => {
            const role = row.original.role
            if (role === "admin") {
              return (
                <Badge
                  variant="outline"
                  className="border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-300 font-semibold text-[11px] py-0.5 px-2.5 rounded-full"
                >
                  Admin
                </Badge>
              )
            }
            if (role === "rider") {
              return (
                <Badge
                  variant="outline"
                  className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300 font-semibold text-[11px] py-0.5 px-2.5 rounded-full"
                >
                  Rider
                </Badge>
              )
            }
            return (
              <Badge
                variant="outline"
                className="border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 font-medium text-[11px] py-0.5 px-2.5 rounded-full"
              >
                User
              </Badge>
            )
          },
        }),
        columnHelper.accessor("credits", {
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 cursor-pointer font-bold uppercase text-xs tracking-wider"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>Credits</span>
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ),
          cell: ({ row }) => {
            const user = row.original
            if (user.role === "admin" || user.role === "rider") {
              return (
                <span className="text-xs text-muted-foreground font-medium italic">
                  —
                </span>
              )
            }
            return (
              <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                <FigmaStar />
                <span>{user.credits}</span>
              </div>
            )
          },
        }),
        columnHelper.accessor("joinedAt", {
          header: "Joined",
          cell: ({ row }) => (
            <span className="text-xs text-muted-foreground font-medium">
              {row.original.joinedAt}
            </span>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: () => (
            <span className="font-bold uppercase text-xs tracking-wider text-muted-foreground">
              Actions
            </span>
          ),
          cell: ({ row }) => {
            const user = row.original
            const isUser = user.role === "user"

            return (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-8 cursor-pointer"
                    />
                  }
                >
                  <span className="sr-only">Open actions</span>
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>User Management</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => setInspectingUser(user)}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Eye className="size-4 text-muted-foreground" />
                      View Full Details
                    </DropdownMenuItem>
                    {user.role !== "admin" && (
                      <DropdownMenuItem
                        onClick={() => {
                          setRoleChangeUser({
                            user,
                            targetRole: "admin",
                          })
                        }}
                        className="cursor-pointer flex items-center gap-2 font-semibold text-purple-700 dark:text-purple-400"
                      >
                        <Crown className="size-4 text-purple-600" />
                        Promote to Admin
                      </DropdownMenuItem>
                    )}
                    {user.role !== "rider" && (
                      <DropdownMenuItem
                        onClick={() => {
                          setRoleChangeUser({
                            user,
                            targetRole: "rider",
                          })
                        }}
                        className="cursor-pointer flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400"
                      >
                        <Bike className="size-4 text-amber-600" />
                        Set as Rider
                      </DropdownMenuItem>
                    )}
                    {user.role !== "user" && (
                      <DropdownMenuItem
                        onClick={() => {
                          setRoleChangeUser({
                            user,
                            targetRole: "user",
                          })
                        }}
                        className="cursor-pointer flex items-center gap-2 font-semibold text-zinc-700 dark:text-zinc-400"
                      >
                        <UserMinus className="size-4" />
                        Set as User
                      </DropdownMenuItem>
                    )}
                    {user.role !== "admin" && (
                      <DropdownMenuItem
                        onClick={() => {
                          setChangePlanUser(user)
                          setTargetPlan(user.subscriptionPlan === "None" ? "Free" : user.subscriptionPlan)
                        }}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <CreditCard className="size-4 text-muted-foreground" />
                        Change Subscription
                      </DropdownMenuItem>
                    )}
                    {isUser && (
                      <DropdownMenuItem
                        onClick={() => {
                          setAdjustCreditsUser(user)
                          setCreditAmountInput("10")
                        }}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <Coins className="size-4 text-muted-foreground" />
                        Adjust Credits
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() =>
                        navigator.clipboard.writeText(user.email)
                      }
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Copy className="size-4 text-muted-foreground" />
                      Copy Email
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => handleToggleSuspendUser(user)}
                      className="cursor-pointer flex items-center gap-2 text-amber-700"
                    >
                      {user.status === "active" ? (
                        <>
                          <ShieldAlert className="size-4" />
                          Suspend Account
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="size-4" />
                          Reactivate Account
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleDeleteUser(user)}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Trash2 className="size-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          },
        }),
      ]),
    [handleToggleSuspendUser, handleDeleteUser]
  )

  const table = useTable({
    features,
    data: filteredUsers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <section className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-[#1B1B1B]">
            User & Access Management
          </h1>
          <p className="text-sm text-[#4C4546] mt-0.5">
            Manage authenticated Clerk users, assign roles, and oversee Bronze, Silver, and Gold subscriptions.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
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

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div
          onClick={() => setSelectedRoleFilter("all")}
          className={`flex flex-col justify-between p-5 rounded-xl border transition-all cursor-pointer ${
            selectedRoleFilter === "all"
              ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600/30"
              : "border-[#E2E2E2] bg-white hover:border-zinc-300"
          }`}
        >
          <div className="flex justify-between items-start pb-3">
            <span className="text-xs font-bold tracking-wider text-[#4C4546] uppercase">
              Total Accounts
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-[#1B1B1B]">
              {totalUsersCount} Accounts
            </p>
            <p className="text-xs font-medium text-blue-600 mt-0.5">
              Syncing from Clerk
            </p>
          </div>
        </div>

        {/* Admins */}
        <div
          onClick={() => setSelectedRoleFilter("admin")}
          className={`flex flex-col justify-between p-5 rounded-xl border transition-all cursor-pointer ${
            selectedRoleFilter === "admin"
              ? "border-purple-600 bg-purple-50/40 ring-1 ring-purple-600/30"
              : "border-[#E2E2E2] bg-white hover:border-zinc-300"
          }`}
        >
          <div className="flex justify-between items-start pb-3">
            <span className="text-xs font-bold tracking-wider text-[#4C4546] uppercase">
              Administrators
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-[#1B1B1B]">
              {adminUsersCount} Admins
            </p>
            <p className="text-xs font-medium text-purple-600 mt-0.5">
              Full portal access
            </p>
          </div>
        </div>

        {/* Riders */}
        <div
          onClick={() => setSelectedRoleFilter("rider")}
          className={`flex flex-col justify-between p-5 rounded-xl border transition-all cursor-pointer ${
            selectedRoleFilter === "rider"
              ? "border-amber-600 bg-amber-50/40 ring-1 ring-amber-600/30"
              : "border-[#E2E2E2] bg-white hover:border-zinc-300"
          }`}
        >
          <div className="flex justify-between items-start pb-3">
            <span className="text-xs font-bold tracking-wider text-[#4C4546] uppercase">
              Riders
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Bike size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-[#1B1B1B]">
              {riderUsersCount} Riders
            </p>
            <p className="text-xs font-medium text-amber-600 mt-0.5">
              Fulfillment couriers
            </p>
          </div>
        </div>

        {/* Total Credits */}
        <div className="flex flex-col justify-between p-5 rounded-xl border border-[#E2E2E2] bg-white">
          <div className="flex justify-between items-start pb-3">
            <span className="text-xs font-bold tracking-wider text-[#4C4546] uppercase">
              User Credits
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Coins size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-[#1B1B1B] flex items-center gap-1.5">
              <FigmaStar />
              <span>{totalCreditsInCirculation} Credits</span>
            </p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">
              In {regularUsersCount} user balances
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
            placeholder="Search name, email, Clerk ID, role..."
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

        {/* Filter Segmented Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <ButtonGroup className="flex flex-wrap">
            <Button
              variant={selectedRoleFilter === "all" ? "default" : "outline"}
              onClick={() => setSelectedRoleFilter("all")}
              className="cursor-pointer text-xs"
            >
              All ({users.length})
            </Button>
            <Button
              variant={selectedRoleFilter === "admin" ? "default" : "outline"}
              onClick={() => setSelectedRoleFilter("admin")}
              className="cursor-pointer text-xs"
            >
              Admins ({adminUsersCount})
            </Button>
            <Button
              variant={selectedRoleFilter === "rider" ? "default" : "outline"}
              onClick={() => setSelectedRoleFilter("rider")}
              className="cursor-pointer text-xs"
            >
              Riders ({riderUsersCount})
            </Button>
            <Button
              variant={selectedRoleFilter === "user" ? "default" : "outline"}
              onClick={() => setSelectedRoleFilter("user")}
              className="cursor-pointer text-xs"
            >
              Users ({regularUsersCount})
            </Button>
            <Button
              variant={
                selectedRoleFilter === "subscribers" ? "default" : "outline"
              }
              onClick={() => setSelectedRoleFilter("subscribers")}
              className="cursor-pointer text-xs"
            >
              Subscribers ({subscriberUsersCount})
            </Button>
          </ButtonGroup>

          {/* Columns Toggle Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer gap-2 bg-white"
                />
              }
            >
              <SlidersHorizontal className="size-3.5" />
              Columns
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const labelMap: Record<string, string> = {
                      name: "User / Name",
                      email: "Email",
                      subscriptionPlan: "Subscription",
                      role: "Role",
                      credits: "Credits",
                      joinedAt: "Joined Date",
                    }
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize cursor-pointer"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {labelMap[column.id] ?? column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="w-full space-y-4">
        <div className="overflow-hidden rounded-xl border border-[rgba(174,174,178,0.5)] bg-white dark:bg-zinc-950 shadow-xs">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/30">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3">
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-28 text-center text-muted-foreground text-sm"
                  >
                    No accounts found matching the search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Pagination Bar */}
        <div className="flex items-center justify-between py-2 text-sm text-muted-foreground">
          <div>
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} account(s) selected.
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* User Details Slide-over Drawer (Sheet) */}
      <Sheet
        open={!!inspectingUser}
        onOpenChange={(open) => {
          if (!open) setInspectingUser(null)
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-6 flex flex-col gap-6">
          {inspectingUser && (
            <>
              {/* Drawer Header */}
              <SheetHeader className="p-0 border-b border-[#E2E2E2] pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-12 rounded-full flex items-center justify-center font-bold text-base shrink-0 border ${
                      inspectingUser.role === "admin"
                        ? "bg-purple-100 text-purple-700 border-purple-200"
                        : inspectingUser.role === "rider"
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-blue-100 text-blue-700 border-blue-200"
                    }`}
                  >
                    {inspectingUser.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
                        {inspectingUser.name}
                      </SheetTitle>
                      {inspectingUser.role === "admin" && (
                        <Badge
                          variant="outline"
                          className="border-purple-200 bg-purple-50 text-purple-800 text-xs font-semibold"
                        >
                          Admin
                        </Badge>
                      )}
                      {inspectingUser.role === "rider" && (
                        <Badge
                          variant="outline"
                          className="border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold"
                        >
                          Rider
                        </Badge>
                      )}
                    </div>
                    <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                      {inspectingUser.email}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Quick Actions Bar */}
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-purple-900">
                    Role & Permissions
                  </p>
                  <p className="text-[11px] text-purple-700 mt-0.5">
                    Current Role: <strong className="capitalize">{inspectingUser.role}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {inspectingUser.role !== "admin" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setRoleChangeUser({
                          user: inspectingUser,
                          targetRole: "admin",
                        })
                      }}
                      className="cursor-pointer text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Crown size={13} className="mr-1" />
                      Set Admin
                    </Button>
                  )}
                  {inspectingUser.role !== "rider" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRoleChangeUser({
                          user: inspectingUser,
                          targetRole: "rider",
                        })
                      }}
                      className="cursor-pointer text-xs font-semibold text-amber-700 border-amber-300 hover:bg-amber-50"
                    >
                      <Bike size={13} className="mr-1" />
                      Set Rider
                    </Button>
                  )}
                  {inspectingUser.role !== "user" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRoleChangeUser({
                          user: inspectingUser,
                          targetRole: "user",
                        })
                      }}
                      className="cursor-pointer text-xs font-semibold"
                    >
                      <UserCheck size={13} className="mr-1" />
                      Set User
                    </Button>
                  )}
                </div>
              </div>

              {/* Clerk Account Overview */}
              <div className="p-4 rounded-xl border border-[#E2E2E2] bg-white space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Clerk Identity & Metadata
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                    <span className="text-muted-foreground">Clerk User ID</span>
                    <span className="font-mono text-foreground font-medium text-[11px]">
                      {inspectingUser.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                    <span className="text-muted-foreground">Joined Date</span>
                    <span className="font-semibold text-foreground">
                      {inspectingUser.joinedAt}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                    <span className="text-muted-foreground">Last Activity</span>
                    <span className="font-semibold text-foreground">
                      {inspectingUser.lastActiveAt}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Lifetime Orders</span>
                    <span className="font-bold text-foreground">
                      {inspectingUser.ordersCount} Orders
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscription & Credit Balance */}
              <div className="p-4 rounded-xl border border-[#E2E2E2] bg-white space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Subscription & Credits
                  </h4>
                  {inspectingUser.role !== "admin" && (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        setChangePlanUser(inspectingUser)
                        setTargetPlan(inspectingUser.subscriptionPlan === "None" ? "Free" : inspectingUser.subscriptionPlan)
                      }}
                      className="cursor-pointer text-xs font-semibold text-blue-600 border-blue-200"
                    >
                      Change Plan
                    </Button>
                  )}
                </div>

                {inspectingUser.role === "admin" ? (
                  <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200 text-xs text-purple-900 flex items-center gap-2 font-medium">
                    <Crown className="size-4 text-purple-600 shrink-0" />
                    <span>Administrators have full portal management access and do not hold customer subscriptions or credits.</span>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground font-medium">
                          Active Plan
                        </span>
                        <Badge variant="outline" className="font-bold text-xs bg-white">
                          {inspectingUser.subscriptionPlan}
                        </Badge>
                      </div>
                    </div>

                    {/* Credit balance with quick adjustment for regular users */}
                    {inspectingUser.role === "user" ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-200">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                            <Coins size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground flex items-center gap-1">
                              <FigmaStar />
                              <span>{inspectingUser.credits} Credits</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Available meal prep balance
                            </p>
                          </div>
                        </div>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            setAdjustCreditsUser(inspectingUser)
                            setCreditAmountInput("10")
                          }}
                          className="cursor-pointer text-xs font-semibold bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
                        >
                          Adjust
                        </Button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200 text-xs text-muted-foreground flex items-center gap-2">
                        <span>Delivery riders do not use personal meal credits.</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog: Change Role */}
      <Dialog
        open={!!roleChangeUser}
        onOpenChange={(open) => {
          if (!open) setRoleChangeUser(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="size-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-2 border border-purple-200">
              {roleChangeUser?.targetRole === "admin" ? (
                <Crown size={20} />
              ) : roleChangeUser?.targetRole === "rider" ? (
                <Bike size={20} />
              ) : (
                <Users size={20} />
              )}
            </div>
            <DialogTitle>
              {roleChangeUser?.targetRole === "admin"
                ? "Promote to Administrator"
                : roleChangeUser?.targetRole === "rider"
                ? "Assign Rider Role"
                : "Set as Standard User"}
            </DialogTitle>
            <DialogDescription>
              {roleChangeUser?.targetRole === "admin"
                ? `Are you sure you want to promote ${roleChangeUser?.user.name} (${roleChangeUser?.user.email}) to Administrator? They will have full access to meal and order management, dispatch operations, and user records.`
                : roleChangeUser?.targetRole === "rider"
                ? `Assign ${roleChangeUser?.user.name} as a Delivery Rider for order fulfillment and courier dispatch.`
                : `Set ${roleChangeUser?.user.name} to standard user role.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRoleChangeUser(null)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRoleChange}
              className={`cursor-pointer font-semibold ${
                roleChangeUser?.targetRole === "admin"
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : roleChangeUser?.targetRole === "rider"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-zinc-800 hover:bg-zinc-900 text-white"
              }`}
            >
              Confirm Role Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Adjust Credits */}
      <Dialog
        open={!!adjustCreditsUser}
        onOpenChange={(open) => {
          if (!open) setAdjustCreditsUser(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Meal Credits</DialogTitle>
            <DialogDescription>
              Grant or deduct meal credits for {adjustCreditsUser?.name}. Current balance:{" "}
              <strong>{adjustCreditsUser?.credits} Credits</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Credit Amount
              </label>
              <Input
                type="number"
                min="1"
                value={creditAmountInput}
                onChange={(e) => setCreditAmountInput(e.target.value)}
                placeholder="Enter credit amount (e.g. 10)"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setAdjustCreditsUser(null)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleConfirmAdjustCredits(false)}
              className="cursor-pointer text-amber-700 border-amber-300 hover:bg-amber-50"
            >
              Deduct Credits
            </Button>
            <Button
              onClick={() => handleConfirmAdjustCredits(true)}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Add Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Change Subscription Plan */}
      <Dialog
        open={!!changePlanUser}
        onOpenChange={(open) => {
          if (!open) setChangePlanUser(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Subscription Plan</DialogTitle>
            <DialogDescription>
              Select a new subscription tier for {changePlanUser?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            {(
              [
                {
                  id: "Bronze",
                  title: "Bronze Tier",
                  desc: "20 monthly meal credits with standard delivery.",
                },
                {
                  id: "Silver",
                  title: "Silver Tier",
                  desc: "40 monthly meal credits with priority courier dispatch.",
                },
                {
                  id: "Gold",
                  title: "Gold Tier",
                  desc: "80 monthly meal credits with all-access VIP delivery.",
                },
                {
                  id: "Free",
                  title: "Free",
                  desc: "Pay-as-you-go credit top-ups without active monthly renewal.",
                },
              ] as const
            ).map((plan) => (
              <div
                key={plan.id}
                onClick={() => setTargetPlan(plan.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                  targetPlan === plan.id
                    ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/30"
                    : "border-[#E2E2E2] hover:border-zinc-300 bg-white"
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {plan.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {plan.desc}
                  </p>
                </div>
                {targetPlan === plan.id && (
                  <Check className="size-4 text-blue-600 shrink-0 mt-0.5" />
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setChangePlanUser(null)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPlanChange}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Save Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
