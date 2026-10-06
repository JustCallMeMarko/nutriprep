import * as React from "react"
import { Bell, Clock, Megaphone, Package, Navigation, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface RiderNotificationItem {
  id: string
  title: string
  message: string
  type: "dispatch" | "route" | "announcement"
  time: string
  isUrgent?: boolean
  read: boolean
}

export function RiderNotificationBell() {
  const { makeRequest } = useApi()
  const [notifications, setNotifications] = React.useState<RiderNotificationItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const loadNotifications = React.useCallback(async () => {
    try {
      const response = await makeRequest("notifications")
      setNotifications(response as RiderNotificationItem[])
    } finally {
      setIsLoading(false)
    }
  }, [makeRequest])

  React.useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = async () => {
    const unread = notifications.filter((notification) => !notification.read)
    await Promise.all(unread.map((notification) =>
      makeRequest(`notifications/${notification.id}/read`, { method: "PATCH" })
    ))
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await makeRequest(`notifications/${id}`, { method: "DELETE" })
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const markAsRead = async (id: string) => {
    const notification = notifications.find((item) => item.id === id)
    if (!notification || notification.read) return
    await makeRequest(`notifications/${id}/read`, { method: "PATCH" })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="relative size-9 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
            aria-label="Open notifications"
          />
        }
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 size-4 bg-amber-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 shadow-lg border border-slate-200 bg-white rounded-xl">
        <DropdownMenuGroup>
          <div className="p-3.5 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2">
              <DropdownMenuLabel className="font-bold text-sm text-foreground p-0">
                Rider Alerts
              </DropdownMenuLabel>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 font-semibold border-amber-200">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 h-6 px-2 cursor-pointer"
              >
                Mark all as read
              </Button>
            )}
          </div>

          <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading rider alerts...</div>
            ) : notifications.length ? (
              notifications.map((item) => {
                const typeIcon = {
                  dispatch: <Package size={14} />,
                  route: <Navigation size={14} />,
                  announcement: <Megaphone size={14} />,
                }[item.type]

                return (
                  <div
                    key={item.id}
                    onClick={() => markAsRead(item.id)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                      !item.read ? "bg-amber-50/40 hover:bg-amber-50/70" : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`size-8 rounded-full flex items-center justify-center shrink-0 text-xs ${
                        item.isUrgent
                          ? "bg-red-100 text-red-600"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.isUrgent ? <Bell size={14} /> : typeIcon}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs truncate ${!item.read ? "font-bold text-foreground" : "font-medium text-slate-800"}`}>
                          {item.title}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => deleteNotification(item.id, e)}
                          className="text-slate-400 hover:text-destructive shrink-0 cursor-pointer p-0.5"
                          title="Dismiss"
                        >
                          <X size={13} />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {item.time}
                        </span>
                        {item.isUrgent && (
                          <span className="text-red-600 font-semibold uppercase text-[9px]">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs space-y-1.5">
                <Bell className="size-6 mx-auto opacity-40" />
                <p className="font-medium text-slate-600">All caught up!</p>
                <p>No new rider alerts at this time.</p>
              </div>
            )}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
