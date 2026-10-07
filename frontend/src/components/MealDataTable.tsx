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
  sortFn_basic,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type SortingState,
} from "@tanstack/react-table"
import {
  ArrowUpDown,
  ChevronDown,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  SlidersHorizontal,
  Trash2,
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
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type Meal = {
  id: string | number
  title: string
  description: string
  status?: "active" | "archived"
  image_url: string
  calories: number
  protein: number
  carb: number
  fat: number
  tags?: string[]
  stocks: number
  credits: number
  isFavorite?: boolean
}

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
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, basic: sortFn_basic },
})

const columnHelper = createColumnHelper<typeof features, Meal>()

const defaultColumns = columnHelper.columns([
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("title", {
    id: "meal",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 cursor-pointer font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Meal</span>
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const meal = row.original
      return (
        <div className="flex items-center gap-3 py-1">
          {meal.image_url ? (
            <img
              src={meal.image_url}
              alt={meal.title}
              className="h-12 w-12 rounded-lg object-cover border border-border/50 shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-xs shrink-0 text-muted-foreground font-semibold">
              Meal
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-foreground truncate max-w-[200px] md:max-w-[240px]">
              {meal.title}
            </span>
            {meal.tags && meal.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {meal.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block text-[11px] font-bold text-[#306FE6]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {meal.description && (
              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[240px]">
                {meal.description}
              </span>
            )}
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status ?? "active"
      const isArchived = status === "archived"
      return (
        <Badge
          variant={isArchived ? "secondary" : "outline"}
          className={
            isArchived
              ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 font-medium"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          }
        >
          {isArchived ? "Archived" : "Active"}
        </Badge>
      )
    },
  }),
  columnHelper.accessor("calories", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 cursor-pointer font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Calories</span>
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium text-sm">
        {row.original.calories}{" "}
        <span className="text-xs text-muted-foreground">kcal</span>
      </span>
    ),
  }),
  columnHelper.accessor("protein", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 cursor-pointer font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Protein</span>
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="inline-flex h-5.5 px-2 items-center justify-center rounded-[7px] border border-[rgba(174,174,178,0.5)] bg-white dark:bg-zinc-900 text-xs font-bold opacity-75">
        {row.original.protein}g
      </span>
    ),
  }),
  columnHelper.accessor("carb", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 cursor-pointer font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Carbs</span>
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="inline-flex h-5.5 px-2 items-center justify-center rounded-[7px] border border-[rgba(174,174,178,0.5)] bg-white dark:bg-zinc-900 text-xs font-bold opacity-75">
        {row.original.carb}g
      </span>
    ),
  }),
  columnHelper.accessor("fat", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 cursor-pointer font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Fat</span>
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="inline-flex h-5.5 px-2 items-center justify-center rounded-[7px] border border-[rgba(174,174,178,0.5)] bg-white dark:bg-zinc-900 text-xs font-bold opacity-75">
        {row.original.fat}g
      </span>
    ),
  }),
  columnHelper.accessor("stocks", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 cursor-pointer font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Stocks</span>
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const stocks = row.original.stocks
      const isLow = stocks <= 5
      return (
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm">{stocks} Qty</span>
          {isLow && (
            <span className="inline-flex items-center rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/30">
              Low
            </span>
          )}
        </div>
      )
    },
  }),
  columnHelper.accessor("credits", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 cursor-pointer font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Credits</span>
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const credits = row.original.credits
      return (
        <div className="flex items-center gap-1.5 font-semibold text-sm">
          <FigmaStar />
          <span>{credits}</span>
        </div>
      )
    },
  }),
  columnHelper.display({
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const meal = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="h-8 w-8 cursor-pointer"
              />
            }
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(String(meal.id))}
                className="cursor-pointer flex items-center gap-2"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Meal ID
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                <ExternalLink className="h-3.5 w-3.5" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                <Pencil className="h-3.5 w-3.5" />
                Edit Meal
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Meal
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }),
])

export interface MealDataTableProps {
  data?: Meal[]
  onMealClick?: (meal: Meal) => void
  columns?: ColumnDef<typeof features, Meal>[]
  searchQuery?: string
  showSearch?: boolean
  showToolbar?: boolean
}

export default function MealDataTable({
  data = [],
  onMealClick,
  columns = defaultColumns,
  searchQuery,
  showSearch = false,
  showToolbar = true,
}: MealDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Compute effective column filters without cascading setState
  const effectiveColumnFilters = React.useMemo(() => {
    if (searchQuery !== undefined) {
      const otherFilters = columnFilters.filter((f) => f.id !== "meal")
      return searchQuery
        ? [...otherFilters, { id: "meal", value: searchQuery }]
        : otherFilters
    }
    return columnFilters
  }, [columnFilters, searchQuery])

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
      columnFilters: effectiveColumnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full space-y-4">
      {showToolbar && (
        <div className="flex items-center justify-between gap-2">
          {showSearch ? (
            <Input
              placeholder="Filter meals by title..."
              value={
                (table.getColumn("meal")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("meal")?.setFilterValue(event.target.value)
              }
              className="max-w-xs"
            />
          ) : (
            <div className="text-sm text-muted-foreground font-medium">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {table.getFilteredRowModel().rows.length}
              </span>{" "}
              meal(s)
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto cursor-pointer gap-2"
                />
              }
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Columns
              <ChevronDown className="h-3.5 w-3.5" />
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
                      meal: "Meal",
                      status: "Status",
                      calories: "Calories",
                      protein_g: "Protein",
                      carbs_g: "Carbs",
                      fat_g: "Fat",
                      stocks: "Stocks",
                      credits: "Credits",
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
      )}

      <div className="overflow-hidden rounded-xl border border-[rgba(174,174,178,0.5)] bg-white dark:bg-zinc-950 shadow-xs">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/30">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`hover:bg-muted/40 transition-colors ${onMealClick ? "cursor-pointer" : ""}`}
                  onClick={() => onMealClick?.(row.original)}
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
                  No meals found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-2 text-sm text-muted-foreground">
        <div>
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
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
  )
}
