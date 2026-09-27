import * as React from "react"
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
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Eye,
  MapPin,
  MoreHorizontal,
  Package,
  SlidersHorizontal,
  Truck,
  UserCheck,
  UserPlus,
  Utensils,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function FigmaStar() {
  return (
    <svg
      width="11"
      height="12"
      viewBox="0 0 11 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
    >
      <path
        d="M5.5 0L6.9855 4.37946L11 6L6.9855 7.62054L5.5 12L4.0145 7.62054L0 6L4.0145 4.37946L5.5 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

export type OrderStatus =
  | "Upcoming"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered"
  | "Ready"
  | "Cancelled"

export type OrderItem = {
  title: string
  quantity: number
  calories: number
  protein_g: number
  price?: number
  credits?: number
  image_url?: string
}

export type OrderRider = {
  id: string
  name: string
  vehicle: string
  phone: string
  rating: string
  activeLoads: number
}

export type Order = {
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string
  items: OrderItem[]
  totalAmount: number
  deliveryWave: "Morning Wave" | "Lunch Wave" | "Dinner Wave"
  deliverySlot: string
  address: string
  city: string
  deliveryNotes?: string
  status: OrderStatus
  rider: OrderRider | null
  placedAt: string
  paymentMethod: string
  paymentStatus: "Paid" | "Pending"
}

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

const columnHelper = createColumnHelper<typeof features, Order>()

interface OrderDataTableProps {
  data: Order[]
  onViewOrder: (order: Order) => void
  onAssignRider: (order: Order) => void
  onUpdateStatus: (order: Order, newStatus: OrderStatus) => void
  onBatchUpdateStatus?: (orders: Order[], newStatus: OrderStatus) => void
  onBatchAssignRider?: (orders: Order[]) => void
}

export default function OrderDataTable({
  data = [],
  onViewOrder,
  onAssignRider,
  onUpdateStatus,
  onBatchUpdateStatus,
  onBatchAssignRider,
}: OrderDataTableProps) {
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
        columnHelper.accessor("id", {
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 cursor-pointer font-bold uppercase text-xs tracking-wider"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>Order #</span>
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ),
          cell: ({ row }) => {
            const order = row.original
            return (
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => onViewOrder(order)}
                  className="font-bold text-sm tracking-tight text-foreground hover:text-blue-600 transition-colors text-left flex items-center gap-1.5 group cursor-pointer"
                >
                  <span>{order.id}</span>
                  <Eye className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <span className="text-[11px] text-muted-foreground">
                  Placed at {order.placedAt}
                </span>
              </div>
            )
          },
        }),
        columnHelper.accessor("customerName", {
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 cursor-pointer font-bold uppercase text-xs tracking-wider"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <span>Customer</span>
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ),
          cell: ({ row }) => {
            const name = row.original.customerName
            const phone = row.original.customerPhone
            const initial = name ? name[0].toUpperCase() : "U"
            return (
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                  {initial}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm text-foreground truncate">
                    {name}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate">
                    {phone}
                  </span>
                </div>
              </div>
            )
          },
        }),
        columnHelper.display({
          id: "items",
          header: () => (
            <span className="font-bold uppercase text-xs tracking-wider text-muted-foreground">
              Meals & Nutrition
            </span>
          ),
          cell: ({ row }) => {
            const items = row.original.items
            const firstItem = items[0]
            const remainingCount = items.length - 1
            const totalCalories = items.reduce(
              (sum, item) => sum + item.calories * item.quantity,
              0
            )

            return (
              <div className="flex flex-col gap-1 max-w-[220px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-xs text-foreground truncate">
                    {firstItem.title}
                  </span>
                  {firstItem.quantity > 1 && (
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      ×{firstItem.quantity}
                    </span>
                  )}
                  {remainingCount > 0 && (
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                      +{remainingCount} more
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <Utensils className="size-3 text-muted-foreground/70" />
                  {totalCalories} kcal total
                </span>
              </div>
            )
          },
        }),
        columnHelper.accessor("deliverySlot", {
          header: () => (
            <span className="font-bold uppercase text-xs tracking-wider text-muted-foreground">
              Window
            </span>
          ),
          cell: ({ row }) => (
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-xs text-foreground flex items-center gap-1">
                <Clock className="size-3 text-blue-600 shrink-0" />
                {row.original.deliveryWave}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {row.original.deliverySlot}
              </span>
            </div>
          ),
        }),
        columnHelper.accessor("address", {
          header: () => (
            <span className="font-bold uppercase text-xs tracking-wider text-muted-foreground">
              Delivery Address
            </span>
          ),
          cell: ({ row }) => (
            <div className="flex flex-col gap-0.5 max-w-[210px]">
              <span
                className="text-xs text-foreground truncate flex items-center gap-1"
                title={row.original.address}
              >
                <MapPin className="size-3 text-muted-foreground shrink-0" />
                {row.original.address}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {row.original.city}
              </span>
            </div>
          ),
        }),
        columnHelper.accessor("totalAmount", {
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
          cell: ({ row }) => (
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground flex items-center gap-1">
                <FigmaStar />
                {row.original.totalAmount} Credits
              </span>
              <span className="text-[11px] font-medium text-emerald-600">
                {row.original.paymentStatus} • {row.original.paymentMethod}
              </span>
            </div>
          ),
        }),
        columnHelper.accessor("status", {
          header: "Status",
          cell: ({ row }) => {
            const status = row.original.status
            let badgeStyle =
              "border-zinc-200 bg-zinc-50 text-zinc-700"
            let dotStyle = "bg-zinc-400"

            if (status === "Upcoming") {
              badgeStyle = "border-blue-200 bg-blue-50 text-blue-700"
              dotStyle = "bg-blue-600"
            } else if (status === "Preparing") {
              badgeStyle = "border-amber-200 bg-amber-50 text-amber-800"
              dotStyle = "bg-amber-500 animate-pulse"
            } else if (status === "Ready") {
              badgeStyle = "border-sky-200 bg-sky-50 text-sky-700"
              dotStyle = "bg-sky-600"
            } else if (status === "Out for Delivery") {
              badgeStyle = "border-indigo-200 bg-indigo-50 text-indigo-700"
              dotStyle = "bg-indigo-600"
            } else if (status === "Delivered") {
              badgeStyle = "border-emerald-200 bg-emerald-50 text-emerald-700"
              dotStyle = "bg-emerald-600"
            } else if (status === "Cancelled") {
              badgeStyle = "border-destructive/30 bg-destructive/10 text-destructive"
              dotStyle = "bg-destructive"
            }

            return (
              <Badge
                variant="outline"
                className={`py-1 px-2.5 rounded-full font-semibold text-[11px] gap-1.5 inline-flex items-center ${badgeStyle}`}
              >
                <span className={`size-1.5 rounded-full shrink-0 ${dotStyle}`} />
                {status}
              </Badge>
            )
          },
        }),
        columnHelper.accessor("rider", {
          header: "Courier",
          cell: ({ row }) => {
            const order = row.original
            if (order.rider) {
              return (
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    <Bike className="size-3 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground">
                      {order.rider.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {order.rider.vehicle}
                    </span>
                  </div>
                </div>
              )
            }
            return (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => onAssignRider(order)}
                className="cursor-pointer gap-1 text-[11px] font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
              >
                <UserPlus className="size-3" />
                Assign
              </Button>
            )
          },
        }),
        columnHelper.display({
          id: "actions",
          enableHiding: false,
          cell: ({ row }) => {
            const order = row.original
            return (
              <div className="flex items-center gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onViewOrder(order)}
                  title="View details"
                  className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <Eye className="size-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                      />
                    }
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Order {order.id}</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onViewOrder(order)}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-600" />
                        View Full Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(order.id)
                        }}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy Order ID
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onAssignRider(order)}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        {order.rider ? "Reassign Courier" : "Assign Courier"}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Quick Status</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(order, "Preparing")}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <Package className="h-3.5 w-3.5 text-amber-600" />
                        In Kitchen Prep
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(order, "Ready")}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                        Ready for Courier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(order, "Out for Delivery")}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <Truck className="h-3.5 w-3.5 text-purple-600" />
                        Out for Delivery
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(order, "Delivered")}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Delivered
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onUpdateStatus(order, "Cancelled")}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancel Order
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          },
        }),
      ]),
    [onViewOrder, onAssignRider, onUpdateStatus]
  )

  const table = useTable({
    features,
    data,
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

  // Selected orders array
  const selectedRows = table.getSelectedRowModel().rows
  const selectedOrders = React.useMemo(
    () => selectedRows.map((r) => r.original),
    [selectedRows]
  )

  return (
    <div className="w-full space-y-3">
      {/* Table Toolbar & Bulk Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          Showing{" "}
          <span className="font-bold text-foreground">
            {table.getFilteredRowModel().rows.length}
          </span>{" "}
          order(s)
          {selectedOrders.length > 0 && (
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full ml-1">
              {selectedOrders.length} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Column Visibility Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer gap-2"
                />
              }
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              Customize Columns
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const labelMap: Record<string, string> = {
                      id: "Order #",
                      customerName: "Customer",
                      items: "Meals & Nutrition",
                      deliverySlot: "Delivery Window",
                      address: "Address",
                      totalAmount: "Total",
                      status: "Status",
                      rider: "Courier",
                    }
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="cursor-pointer"
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

      {/* Floating Bulk Actions Bar when rows are selected */}
      {selectedOrders.length > 0 && (
        <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-xs transition-all animate-in fade-in">
          <div className="flex items-center gap-2 text-xs text-blue-900 font-semibold">
            <CheckCircle2 className="size-4 text-blue-600" />
            <span>
              {selectedOrders.length} order{selectedOrders.length > 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              className="bg-white hover:bg-zinc-50 border-blue-200 text-blue-700 text-xs cursor-pointer"
              onClick={() => onBatchUpdateStatus?.(selectedOrders, "Ready")}
            >
              Mark as Ready
            </Button>
            <Button
              size="xs"
              variant="outline"
              className="bg-white hover:bg-zinc-50 border-blue-200 text-purple-700 text-xs cursor-pointer"
              onClick={() =>
                onBatchUpdateStatus?.(selectedOrders, "Out for Delivery")
              }
            >
              Dispatch / Out for Delivery
            </Button>
            <Button
              size="xs"
              variant="outline"
              className="bg-white hover:bg-zinc-50 border-blue-200 text-emerald-700 text-xs cursor-pointer"
              onClick={() =>
                onBatchUpdateStatus?.(selectedOrders, "Delivered")
              }
            >
              Mark Delivered
            </Button>
            {onBatchAssignRider && (
              <Button
                size="xs"
                variant="outline"
                className="bg-white hover:bg-zinc-50 border-blue-200 text-blue-700 text-xs cursor-pointer"
                onClick={() => onBatchAssignRider(selectedOrders)}
              >
                Assign Courier
              </Button>
            )}
            <Button
              size="xs"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground text-xs cursor-pointer"
              onClick={() => setRowSelection({})}
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-xl border border-[#E2E2E2] bg-white shadow-xs">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-zinc-50/70 border-b border-[#E2E2E2]">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="whitespace-nowrap px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground"
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
                  className="hover:bg-blue-50/20 transition-colors border-b border-[#E2E2E2]/60 last:border-b-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3 text-xs">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground text-sm"
                >
                  <div className="flex flex-col items-center justify-center gap-1.5 py-6">
                    <Package className="size-8 text-muted-foreground/50" />
                    <p className="font-semibold text-foreground">No orders found</p>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your search or active filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Table Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2 text-xs text-muted-foreground">
        <div>
          Showing {table.getRowModel().rows.length} of {data.length} total orders
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="cursor-pointer h-8 text-xs font-medium"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="cursor-pointer h-8 text-xs font-medium"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
