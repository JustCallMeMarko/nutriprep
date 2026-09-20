import React from "react"
import { Link } from "react-router-dom"
import { Bell, ShoppingBag, Search } from "lucide-react"
import logo from "../assets/icons/logo.png"
import { ROUTES } from "@/lib/routes"

export default function NutriHeader({
  type = "client", // "client" | "admin"
  title = "Order Dispatch",
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {type === "client" ? (
          /* Client Header (Image 1) */
          <>
            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center gap-2.5 shrink-0">
              <img src={logo} alt="NutriPrep" className="h-8 w-auto object-contain" />
              <span className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                NutriPrep
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to={ROUTES.USER_MEALS}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Meals
              </Link>
              <Link
                to={ROUTES.USER_PLANS}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Plans
              </Link>
              <Link
                to={ROUTES.USER_ONBOARDING}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Profile
              </Link>
              <Link
                to={ROUTES.USER_FAVORITES}
                className="relative text-sm font-bold text-slate-900 pb-1"
              >
                Favorites
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {/* Notification Bell with '1' badge */}
              <button
                type="button"
                className="relative p-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="size-5" />
                <span className="absolute top-1 right-1 size-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  1
                </span>
              </button>

              {/* User Avatar */}
              <div className="size-9 rounded-full overflow-hidden border border-slate-200 shadow-xs ring-2 ring-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </>
        ) : (
          /* Admin Header (Image 2 & Image 3) */
          <>
            {/* Title / Brand */}
            <div className="flex items-center gap-3">
              <Link to={ROUTES.ADMIN} className="flex items-center gap-2">
                <img src={logo} alt="NutriPrep" className="h-7 w-auto object-contain" />
              </Link>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {title}
              </h1>
            </div>

            {/* Search and Right icons */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end max-w-lg">
              {onSearchChange && (
                <div className="relative flex-1 max-w-xs hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              )}

              {/* Notification Bell with '1' badge */}
              <button
                type="button"
                className="relative p-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="size-5" />
                <span className="absolute top-1 right-1 size-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  1
                </span>
              </button>

              {/* Shopping bag icon */}
              <button
                type="button"
                className="p-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="size-5" />
              </button>

              {/* User Avatar */}
              <div className="size-9 rounded-full overflow-hidden border border-slate-200 shadow-xs ring-2 ring-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
