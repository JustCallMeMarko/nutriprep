import { NavLink } from "react-router-dom"
import { Bell } from "lucide-react"

const navItems = [
  { label: "Meals", to: "/client/meals" },
  { label: "Plans", to: "/client/plans" },
  { label: "Cart", to: "/client/cart" },
]

function ClientNavbar() {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b bg-white">
      <div className="text-xl font-bold tracking-wide">NUTRIPREP</div>

      <nav className="flex items-center gap-10">
        {navItems.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `text-lg font-bold ${isActive ? "text-black" : "text-black/40 hover:text-black/70"}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell className="w-6 h-6 text-black" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
        </button>
        <img src="/avatar-placeholder.png" alt="Customer avatar" className="w-10 h-10 rounded-full object-cover" />
      </div>
    </header>
  )
}

export default ClientNavbar