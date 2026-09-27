import * as React from "react"
import { Bell, Clock, Megaphone, Package, Navigation, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

const INITIAL_RIDER_NOTIFICATIONS: RiderNotificationItem[] = [
  {
    id: "rn-1",
    title: "Severe Weather & Delivery Delay Advisory",
    message: "Tropical storm conditions are currently impacting Metro Manila routes. Drive with extreme caution and follow dispatch protocols.",
    type: "announcement",
    time: "15m ago",
    isUrgent: true,
    read: false,
  },
  {
    id: "rn-2",
    title: "BGC & Makati Hub Route Re-Optimization",
    message: "New designated pickup points for high-density business hubs are now active in the rider app. Review updated route sequences before lunch runs.",
    type: "route",
    time: "1h ago",
    read: false,
  },
  {
    id: "rn-3",
    title: "Batch 2 Lunch Dispatch Ready for Pickup",
    message: "12 meal prep boxes packed and tagged at Central Kitchen Hub (Bay 4). Pickup deadline is 11:30 AM.",
    type: "dispatch",
    time: "2h ago",
    read: true,
  },
  {
    id: "rn-4",
    title: "Rider Incentive Bonus Active Today",
    message: "Complete 8 on-time deliveries during today's lunch window to qualify for the ₱300 peak-hour incentive bonus.",
    type: "announcement",
    time: "Yesterday",
    read: true,
  },
]

export function RiderNotificationBell() {
  const [notifications, setNotifications] = React.useState<RiderNotificationItem[]>(INITIAL_RIDER_NOTIFICATIONS)

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
            {notifications.length ? (
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
