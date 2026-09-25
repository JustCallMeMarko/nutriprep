import { useState } from 'react'
import { Menu, X, Home, Pizza, CalendarDays, NotebookPen, Heart } from 'lucide-react'
import logo from '../assets/icons/logo.svg'
import { Navigate, useNavigate, Link, Outlet } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { UserButton, useUser } from '@clerk/react'
import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'

export default function UserLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { isLoaded, user } = useUser()
    const role = user?.publicMetadata?.role
    const closeMenu = () => setIsMenuOpen(false)
    const navigate = useNavigate()

    if (!isLoaded) {
        return null
    }

    if (!role) {
        return <Navigate to={ROUTES.HOME} replace />
    }

    if (role !== 'user' && role !== 'admin' && role !== 'rider') {
        return <Navigate to={ROUTES.HOME} replace />
    }

    if (role !== 'user') {
        return <Navigate to={`/${role}`} replace />
    }

    const NavLinks = [
        { name: 'Home', href: ROUTES.USER_DASHBOARD, icon: Home },
        { name: 'Meal', href: ROUTES.USER_MEAL, icon: Pizza },
        { name: 'Calendar', href: ROUTES.USER_CALENDAR, icon: CalendarDays },
        { name: 'Plan', href: ROUTES.USER_PLANS, icon: NotebookPen },
        { name: 'Favorite', href: ROUTES.USER_FAVORITE, icon: Heart },
    ]

    return (
        <>
            <header className="bg-white border-b-2 border-slate-800 px-4 md:px-[clamp(2rem,calc(29.4vw-194px),14.5rem)] py-2.5 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
                <div className="flex shrink-0 items-center gap-2 cursor-pointer" onClick={() => navigate(ROUTES.USER_DASHBOARD)} role="button">
                    <img src={logo} alt="NutriPrep Logo" className="w-10 h-10 invert" />
                    <p className="text-2xl md:text-2xl font-bold uppercase">NutriPrep</p>
                </div>

                <ButtonGroup className="hidden md:flex">
                    {NavLinks.map((link) => (
                        <Button key={link.name} variant="outline" onClick={() => navigate(link.href)} className="flex gap-1 items-center whitespace-nowrap text-sm hover:text-slate-600 transition-colors ease-in font-semibold cursor-pointer">
                            
                            <link.icon className="size-4.5" />
                            {link.name}
                        </Button>
                    ))}
                </ButtonGroup>

                <button
                    type="button"
                    aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((open) => !open)}
                    className={`flex size-10 items-center justify-center rounded-lg text-zinc-900 hover:bg-zinc-100 md:hidden`}
                >
                    {isMenuOpen ? <X className="size-4.5" /> : <Menu className="size-5" />}
                </button>
                <div className="hidden md:flex items-center justify-center gap-3">
                    <UserButton />
                </div>
                {isMenuOpen && (


                    <nav className="absolute top-full left-0 right-0 border-b-2 border-slate-800 bg-white px-4 py-4 shadow-lg md:hidden">
                        <div className="flex flex-col gap-1">
                            {NavLinks.map((link) => (
                                <Link key={link.name} to={link.href} onClick={closeMenu} className="flex gap-1 items-center px-3 py-2 font-semibold hover:bg-zinc-100">
                                    <link.icon className="size-4.5" />
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
            <main className="pt-23 px-4 md:px-[clamp(2rem,calc(29.4vw-194px),14.5rem)]">
                <Outlet />
            </main>
        </>
    )
}
