import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import logo from '../assets/icons/logo.svg'
import { Link, Outlet } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { UserButton } from '@clerk/react'

export default function UserLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const closeMenu = () => setIsMenuOpen(false)

    const NavLinks = [
        { name: 'Home', href: ROUTES.USER_DASHBOARD },
        { name: 'Meal', href: ROUTES.USER_MEAL },
        { name: 'Calendar', href: ROUTES.USER_CALENDAR },
        { name: 'Plans', href: ROUTES.USER_PLANS },
        { name: 'Favorite', href: ROUTES.USER_FAVORITE }
    ]

    return (
        <>
            <header className="bg-white border-b-2 border-slate-800 px-4 md:px-[clamp(2rem,calc(29.4vw-194px),14.5rem)] py-2.5 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
                <div className="flex shrink-0 items-center gap-2">
                    <img src={logo} alt="NutriPrep Logo" className="w-10 h-10 invert" />
                    <p className="text-2xl md:text-2xl font-bold uppercase">NutriPrep</p>
                </div>

                <nav className="hidden items-center justify-center gap-3 md:flex">
                    {NavLinks.map((link) => (
                        <Link key={link.name} to={link.href} className="whitespace-nowrap text-sm hover:text-slate-600 transition-colors ease-in font-semibold">
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <button
                    type="button"
                    aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((open) => !open)}
                    className={`flex size-10 items-center justify-center rounded-lg text-zinc-900 hover:bg-zinc-100 md:hidden`}
                >
                    {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </button>
                <div className="hidden md:flex items-center justify-center gap-3">
                    <UserButton />
                </div>
                {isMenuOpen && (


                    <nav className="absolute top-full left-0 right-0 border-b-2 border-slate-800 bg-white px-4 py-4 shadow-lg md:hidden">
                        <div className="flex flex-col gap-1">
                            {NavLinks.map((link) => (
                                <Link key={link.name} to={link.href} onClick={closeMenu} className="px-3 py-2 font-semibold hover:bg-zinc-100">
                                    {link.name}
                                </Link>
                            ))}
                            <div className="px-3 py-2">
                                <UserButton />
                            </div>
                        </div>
                    </nav>

                )}
            </header>
            <main className="pt-15">
                <Outlet />
            </main>
        </>
    )
}
