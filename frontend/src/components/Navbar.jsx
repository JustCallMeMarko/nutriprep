import { Link, NavLink } from "react-router-dom";
import { Bell, Utensils } from "lucide-react";
import { UserButton } from "@clerk/react";

const linkClass = ({ isActive }) =>
  "text-[14px] font-bold text-black transition " +
  (isActive ? "underline underline-offset-4" : "opacity-60 hover:opacity-100");

export function Navbar() {
  return (
    <header className="border-b border-black/10 bg-white">
      <nav className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between px-6">
        <Link to="/user" className="flex items-center gap-2">
          <Utensils size={20} className="text-black" />
          <span className="text-[18px] font-extrabold leading-none text-black">
            Nutri<span className="text-[#306FE6]">Prep</span>
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <NavLink to="/user/meals" className={linkClass}>Meals</NavLink>
          <NavLink to="/user/plans" className={linkClass}>Plans</NavLink>
          <NavLink to="/user/cart" className={linkClass}>Cart</NavLink>
        </div>

        <div className="flex items-center gap-4">
          <button type="button" aria-label="Notifications" className="relative">
            <Bell size={20} className="text-black" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#306FE6] text-[9px] font-bold text-white">
              0
            </span>
          </button>
          <UserButton />
        </div>
      </nav>
    </header>
  );
}