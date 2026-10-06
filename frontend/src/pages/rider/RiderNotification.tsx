import * as React from "react"
import {
  Bike,
  Bell,
  CheckCircle2,
  Clock,
  Megaphone,
  Navigation,
  Package,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { useApi } from "@/lib/api"

export interface RiderNotification {
  id: string
  title: string
  message: string
  type: "dispatch" | "route" | "announcement"
  time: string
  isUrgent?: boolean
  read: boolean
}

export default function RiderNotificationPage() {
  const { makeRequest } = useApi()
  const [notifications, setNotifications] = React.useState<RiderNotification[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<"all" | "dispatch" | "route" | "announcement">("all")

  const loadNotifications = React.useCallback(async () => {
    try {
      const response = await makeRequest("notifications")
      setNotifications(response as RiderNotification[])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load rider alerts.")
    } finally {
      setIsLoading(false)
    }
  }, [makeRequest])

  React.useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  const handleDelete = async (id: string) => {
    await makeRequest(`notifications/${id}`, { method: "DELETE" })
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const markAllAsRead = async () => {
    await Promise.all(
      notifications.filter((n) => !n.read).map((n) =>
        makeRequest(`notifications/${n.id}/read`, { method: "PATCH" })
      )
    )
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = async (id: string) => {
    const notification = notifications.find((n) => n.id === id)
    if (!notification || notification.read) return
    await makeRequest(`notifications/${id}/read`, { method: "PATCH" })
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const filtered = React.useMemo(() => {
    return notifications.filter((n) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q)

      if (!matchesSearch) return false
      if (typeFilter !== "all" && n.type !== typeFilter) return false
      return true
    })
  }, [notifications, searchQuery, typeFilter])

  const unreadCount = notifications.filter((n) => !n.read).length

  if (isLoading) {
    return <section className="flex min-h-[300px] items-center justify-center text-sm font-semibold text-slate-600">Loading rider alerts...</section>
  }

  if (error) {
    return (
      <section className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-sm text-rose-600">{error}</p>
        <Button onClick={() => void loadNotifications()} variant="outline">Try again</Button>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-[-0.02em] text-[#1B1B1B]">
              Rider Alerts & Broadcasts
            </h1>
            {unreadCount > 0 && (
              <Badge className="bg-amber-600 text-white font-bold text-xs">
                {unreadCount} New
              </Badge>
            )}
          </div>
          <p className="text-sm text-[#4C4546] mt-0.5">
            Operational route updates, kitchen dispatches, and emergency alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="cursor-pointer text-xs font-semibold"
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div className="relative flex items-center w-full lg:w-80">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search rider alerts..."
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

        <ButtonGroup className="flex flex-wrap">
          <Button
            variant={typeFilter === "all" ? "default" : "outline"}
            onClick={() => setTypeFilter("all")}
            className="cursor-pointer text-xs"
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={typeFilter === "dispatch" ? "default" : "outline"}
            onClick={() => setTypeFilter("dispatch")}
            className="cursor-pointer text-xs"
          >
            Dispatch ({notifications.filter((n) => n.type === "dispatch").length})
          </Button>
          <Button
            variant={typeFilter === "route" ? "default" : "outline"}
            onClick={() => setTypeFilter("route")}
            className="cursor-pointer text-xs"
          >
            Routes ({notifications.filter((n) => n.type === "route").length})
          </Button>
          <Button
            variant={typeFilter === "announcement" ? "default" : "outline"}
            onClick={() => setTypeFilter("announcement")}
            className="cursor-pointer text-xs"
          >
            Broadcasts ({notifications.filter((n) => n.type === "announcement").length})
          </Button>
        </ButtonGroup>
      </div>

      {/* Rider Notifications Feed */}
      <div className="space-y-3">
        {filtered.length ? (
          filtered.map((item) => {
            const isUrgent = item.isUrgent
            const typeBadge = {
              dispatch: { label: "Dispatch", class: "border-blue-200 bg-blue-50 text-blue-700", icon: Package },
              route: { label: "Route Update", class: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: Navigation },
              announcement: { label: "Broadcast", class: "border-amber-200 bg-amber-50 text-amber-700", icon: Megaphone },
            }[item.type]

            const TypeIcon = typeBadge.icon

            return (
              <div
                key={item.id}
                onClick={() => void markAsRead(item.id)}
                className={`p-4 sm:p-5 rounded-xl border bg-white transition-all hover:shadow-xs flex flex-col md:flex-row justify-between gap-4 ${
                  isUrgent
                    ? "border-red-300 ring-1 ring-red-200/70"
                    : !item.read
                    ? "border-amber-300 bg-amber-50/20"
                    : "border-[#E2E2E2]"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isUrgent
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-amber-50 text-amber-600 border-amber-200"
                    }`}
                  >
                    {isUrgent ? <Bell size={18} /> : <TypeIcon size={18} />}
                  </div>

                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-base font-bold ${!item.read ? "text-foreground" : "text-slate-800"}`}>
                        {item.title}
                      </h3>
                      {isUrgent && (
                        <Badge variant="destructive" className="text-[10px] px-2 py-0">
                          Urgent Alert
                        </Badge>
                      )}
                      <Badge variant="outline" className={`text-[10px] px-2 py-0 ${typeBadge.class}`}>
                        {typeBadge.label}
                      </Badge>
                    </div>

                    <p className="text-xs text-[#4C4546] leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {item.time}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        Live Broadcast
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col justify-end md:justify-between items-end shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDelete(item.id)}
                    className="cursor-pointer text-muted-foreground hover:text-destructive size-8"
                    title="Dismiss alert"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-12 text-center border border-dashed rounded-xl bg-white text-muted-foreground space-y-2">
            <Bike className="size-8 mx-auto text-muted-foreground/50" />
            <p className="text-sm font-medium">No alerts found.</p>
            <p className="text-xs">Dispatch broadcasts and route alerts will show up here.</p>
          </div>
        )}
      </div>
    </section>
  )
}
