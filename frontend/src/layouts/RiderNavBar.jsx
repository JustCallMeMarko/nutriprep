import { NavLink } from "react-router-dom"
import ActiveButtonLogo from "../assets/ActiveButtonLogo.svg"
import EarningsButtonLogo from "../assets/EarningsButtonLogo.svg"
import DeliveriesButtonLogo from "../assets/DeliveriesButtonLogo.svg"
import NutriprepLogo from "../assets/NutriprepLogo.svg"

const navItems = [
    { label: "Deliveries", to: "/rider/deliveries", icon: DeliveriesButtonLogo },
    { label: "Earnings", to: "/rider/earnings", icon: EarningsButtonLogo },
    { label: "Active Orders", to: "/rider/active-orders", icon: ActiveButtonLogo },
]

function RiderNavBar() {
    return (
        <>
            <header className="flex items-center justify-between px-6 py-3 border-b bg-white">
                <img src={NutriprepLogo} alt="Nutriprep Logo" className="h-6" />
                <nav className="flex items-center gap-4">
                    {navItems.map(({ label, to, icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex flex-col items-center text-xs gap-1 px-4 py-2 rounded-lg transition-colors ${isActive ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-800"}`
                            }
                        >
                            <img src={icon} alt="" className="w-5 h-5" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <button className="relative">
                        <span className="text-lg">🔔</span>
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                    <img src="https://via.placeholder.com/40" alt="Profile" className="w-10 h-10 rounded-full" />
                </div>
            </header>
        </>
    )
}
export default RiderNavBar;