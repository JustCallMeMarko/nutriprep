import * as React from "react"
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Megaphone,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { useApi } from "@/lib/api"

export type BroadcastAudience = "all" | "users" | "riders" | "admins"
export type BroadcastPriority = "normal" | "urgent"

export interface NotificationItem {
  id: string
  title: string
  message: string
  audience: BroadcastAudience
  priority: BroadcastPriority
  sentAt: string
  sentBy: string
  recipientCount: number
  readCount: number
}

export default function AdminNotification() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [audienceFilter, setAudienceFilter] = React.useState<"all" | BroadcastAudience>("all")
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)
  const { makeRequest } = useApi()

  const loadNotifications = React.useCallback(() => {
    let active = true
    void makeRequest("broadcasts")
      .then((data) => {
        if (active) setNotifications(data as NotificationItem[])
      })
      .catch((error: Error) => {
        if (active) setToastMessage(error.message)
      })
    return () => {
      active = false
    }
  }, [makeRequest])

  React.useEffect(() => {
    const cleanup = loadNotifications()
    const handleBroadcastCreated = () => {
      cleanup?.()
      loadNotifications()
    }
    window.addEventListener("broadcast-created", handleBroadcastCreated)
    return () => {
      cleanup?.()
      window.removeEventListener("broadcast-created", handleBroadcastCreated)
    }
  }, [loadNotifications])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleDeleteNotification = (id: string) => {
    void makeRequest(`broadcasts/${id}`, { method: "DELETE" })
      .then(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        showToast("Notification removed.")
      })
      .catch((error: Error) => showToast(error.message))
  }

  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((n) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.sentBy.toLowerCase().includes(q)

      if (!matchesSearch) return false
      if (audienceFilter !== "all" && n.audience !== audienceFilter) return false
      return true
    })
  }, [notifications, searchQuery, audienceFilter])

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-[#1B1B1B]">
          Notifications
        </h1>
        <p className="text-sm text-[#4C4546] mt-0.5">
          View broadcast notifications and announcements.
        </p>
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

      {/* Toolbar & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div className="relative flex items-center w-full lg:w-80">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search notifications..."
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
            variant={audienceFilter === "all" ? "default" : "outline"}
            onClick={() => setAudienceFilter("all")}
            className="cursor-pointer text-xs"
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={audienceFilter === "users" ? "default" : "outline"}
            onClick={() => setAudienceFilter("users")}
            className="cursor-pointer text-xs"
          >
            Users ({notifications.filter((n) => n.audience === "users").length})
          </Button>
          <Button
            variant={audienceFilter === "riders" ? "default" : "outline"}
            onClick={() => setAudienceFilter("riders")}
            className="cursor-pointer text-xs"
          >
            Riders ({notifications.filter((n) => n.audience === "riders").length})
          </Button>
          <Button
            variant={audienceFilter === "admins" ? "default" : "outline"}
            onClick={() => setAudienceFilter("admins")}
            className="cursor-pointer text-xs"
          >
            Admins ({notifications.filter((n) => n.audience === "admins").length})
          </Button>
        </ButtonGroup>
      </div>

      {/* Notifications List */}
      <div className="space-y-3.5">
        {filteredNotifications.length ? (
          filteredNotifications.map((item) => {
            const isUrgent = item.priority === "urgent"
            const audienceBadge = {
              all: { label: "Everyone", class: "border-zinc-300 bg-zinc-100 text-zinc-800" },
              users: { label: "Users", class: "border-blue-200 bg-blue-50 text-blue-700" },
              riders: { label: "Riders", class: "border-amber-200 bg-amber-50 text-amber-800" },
              admins: { label: "Admins", class: "border-purple-200 bg-purple-50 text-purple-800" },
            }[item.audience]

            return (
              <div
                key={item.id}
                className={`p-5 rounded-xl border bg-white transition-all hover:shadow-xs flex flex-col md:flex-row justify-between gap-4 ${
                  isUrgent ? "border-red-300 ring-1 ring-red-200/60" : "border-[#E2E2E2]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center shrink-0 border ${
                      isUrgent
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-blue-50 text-blue-600 border-blue-200"
                    }`}
                  >
                    {isUrgent ? <Bell size={18} /> : <Megaphone size={18} />}
                  </div>

                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">
                        {item.title}
                      </h3>
                      {isUrgent && (
                        <Badge variant="destructive" className="text-[10px] px-2 py-0">
                          Urgent
                        </Badge>
                      )}
                      <Badge variant="outline" className={`text-[10px] px-2 py-0 ${audienceBadge.class}`}>
                        Target: {audienceBadge.label}
                      </Badge>
                    </div>

                    <p className="text-xs text-[#4C4546] leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {item.sentAt}
                      </span>
                      <span>•</span>
                      <span>By <strong>{item.sentBy}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CheckCheck size={12} className="text-blue-600" />
                        {item.recipientCount.toLocaleString()} Delivered
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col justify-end md:justify-between items-end shrink-0 gap-2">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDeleteNotification(item.id)}
                    className="cursor-pointer text-muted-foreground hover:text-destructive size-8"
                    title="Delete Notification"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-12 text-center border border-dashed rounded-xl bg-white text-muted-foreground space-y-2">
            <Bell className="size-8 mx-auto text-muted-foreground/50" />
            <p className="text-sm font-medium">No notifications found.</p>
            <p className="text-xs">Notifications will appear here when broadcasted.</p>
          </div>
        )}
      </div>
    </section>
  )
}
