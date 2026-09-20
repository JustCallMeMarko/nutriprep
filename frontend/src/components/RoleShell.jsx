import { Bell, Menu, Utensils, X } from "lucide-react"
import { UserButton } from "@clerk/react"
import { useEffect, useRef, useState } from "react"
import { Link, NavLink, Outlet } from "react-router-dom"
import { ROLE_NAVIGATION } from "@/lib/navigation"

const linkClass = ({ isActive }) =>
  `whitespace-nowrap px-3 py-2 text-sm font-semibold transition-colors ${
    isActive
      ? "bg-blue-600 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`

export function RoleNavigation({ role }) {
  const navigation = ROLE_NAVIGATION[role]
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef(null)
  const firstLinkRef = useRef(null)

  useEffect(() => {
    if (!isMenuOpen) return undefined

    const menuButton = menuButtonRef.current
    firstLinkRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      menuButton?.focus()
    }
  }, [isMenuOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <Link to={navigation.home} className="flex shrink-0 items-center gap-2">
          <Utensils className="size-5 text-blue-600" aria-hidden="true" />
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Nutri<span className="text-blue-600">Prep</span>
          </span>
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="role-navigation-links"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="order-2 ml-auto rounded-md p-2 text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 md:hidden"
        >
          {isMenuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>

        <nav
          id="role-navigation-links"
          aria-label={`${role} navigation`}
          className={`${isMenuOpen ? "flex" : "hidden"} order-3 w-full flex-col gap-1 md:order-0 md:flex md:w-auto md:flex-1 md:flex-row md:justify-center`}
        >
          {navigation.links.map((link, index) => (
            <NavLink
              key={link.to}
              ref={index === 0 ? firstLinkRef : undefined}
              to={link.to}
              end={link.to === navigation.home}
              onClick={() => setIsMenuOpen(false)}
              className={linkClass}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100"
          >
            <Bell className="size-5" />
            <span className="absolute right-1 top-1 flex size-3 items-center justify-center rounded-full bg-blue-600 text-[8px] font-bold text-white">
              0
            </span>
          </button>
          <UserButton />
        </div>
      </div>
    </header>
  )
}

export default function RoleShell({ role }) {
  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
      <RoleNavigation role={role} />
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  )
}