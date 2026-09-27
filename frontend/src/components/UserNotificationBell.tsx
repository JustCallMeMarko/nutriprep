import * as React from "react"
import { Bell, Clock, Megaphone, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface UserNotification {
  id: string
  title: string
  message: string
  time: string
  isUrgent?: boolean
  read: boolean
}

const INITIAL_USER_NOTIFICATIONS: UserNotification[] = [
  {
    id: "un-1",
    title: "Severe Weather & Delivery Delay Advisory",
    message: "Tropical storm conditions are impacting dispatch. Afternoon delivery slots may experience an estimated 30-45 min delay.",
    time: "15m ago",
    isUrgent: true,
    read: false,
  },
  {
    id: "un-2",
    title: "Weekend Meal Prep Menu Drop is LIVE!",
    message: "High-Protein & Low-Carb special selections have been updated for next week. Lock in your weekly meals before Friday 8 PM.",
    time: "2h ago",
    read: false,
  },
  {
    id: "un-3",
    title: "Subscription Renewal Confirmed",
    message: "Your Gold Tier subscription has successfully renewed. 80 fresh meal credits are ready in your balance.",
    time: "Yesterday",
    read: true,
  },
]

export function UserNotificationBell() {
  const [notifications, setNotifications] = React.useState<UserNotification[]>(INITIAL_USER_NOTIFICATIONS)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const markAsRead = (id: string) => {
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
          <span className="absolute -top-1 -right-1 size-4 bg-red-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 shadow-lg border border-slate-200 bg-white rounded-xl">
        <DropdownMenuGroup>
          <div className="p-3.5 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2">
              <DropdownMenuLabel className="font-bold text-sm text-foreground p-0">
                Notifications
              </DropdownMenuLabel>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 font-semibold">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 h-6 px-2 cursor-pointer"
              >
                Mark all as read
              </Button>
            )}
          </div>

          <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
            {notifications.length ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                    !item.read ? "bg-blue-50/40 hover:bg-blue-50/70" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`size-8 rounded-full flex items-center justify-center shrink-0 text-xs ${
                      item.isUrgent
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {item.isUrgent ? <Bell size={14} /> : <Megaphone size={14} />}
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
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs space-y-1.5">
                <Bell className="size-6 mx-auto opacity-40" />
                <p className="font-medium text-slate-600">All caught up!</p>
                <p>No new notifications at this time.</p>
              </div>
            )}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
