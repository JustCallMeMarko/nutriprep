import { useEffect, useState } from 'react'
import { Menu, X, Home, Pizza, CircleDollarSign, NotebookPen, Heart, Flame } from 'lucide-react'
import logo from '../assets/icons/logo.svg'
import { Navigate, useNavigate, useLocation, Link, Outlet } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { UserButton, useUser } from '@clerk/react'
import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import { useSubscription } from '@clerk/react/experimental'
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptions'
import ChatBot from '@/components/ChatBot'
import { UserNotificationBell } from '@/components/UserNotificationBell'
import { useApi } from '@/lib/api'

function StarIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M5.5 0L6.9855 4.37946L11 6L6.9855 7.62054L5.5 12L4.0145 7.62054L0 6L4.0145 4.37946L5.5 0Z"
                fill="white"
            />
        </svg>
    )
}

function CreditsPill({ credits }: { credits: number | null }) {
    return (
        <Link
            to={ROUTES.USER_SUBSCRIPTION}
            title="Credit balance — tap to top up"
            className="flex h-10 items-center gap-2 rounded-full border border-slate-300 bg-white px-3 shadow-xs shrink-0"
        >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black">
                <StarIcon />
            </span>
            <span className="text-xs font-bold text-slate-900">{credits ?? '—'}</span>
        </Link>
    )
}

export default function UserLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { isLoaded, user } = useUser()
    const role = user?.publicMetadata?.role
    const onboarded = user?.publicMetadata?.onboarded
    const closeMenu = () => setIsMenuOpen(false)
    const navigate = useNavigate()
    const location = useLocation()
    const { data } = useSubscription()
    const { makeRequest } = useApi()
    const [credits, setCredits] = useState<number | null>(null)

    useEffect(() => {
        if (!isLoaded || role !== 'user' || !onboarded) return
        makeRequest('profile')
            .then((profile: { credits?: number }) => setCredits(profile?.credits ?? 0))
            .catch(() => setCredits(null))
    }, [isLoaded, role, onboarded, makeRequest, location.pathname])

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

    const isProfilePage = location.pathname === ROUTES.USER_PROFILE

    if (!onboarded && !isProfilePage) {
        return <Navigate to={ROUTES.USER_PROFILE} replace />
    }

    const NavLinks = [
        { name: 'Home', href: ROUTES.USER_DASHBOARD, icon: Home },
        { name: 'Plan', href: ROUTES.USER_PLAN, icon: NotebookPen },
        { name: 'Meal', href: ROUTES.USER_MEAL, icon: Pizza },
        { name: 'Favorite', href: ROUTES.USER_FAVORITE, icon: Heart },
        { name: 'Subscription', href: ROUTES.USER_SUBSCRIPTION, icon: CircleDollarSign },
    ]

    const firstItem = data?.subscriptionItems?.[0]
    const planName = (firstItem?.plan?.name || "Free").trim().toLowerCase()

    const isAIEnabled = !isProfilePage && (
        planName === SUBSCRIPTION_PLANS.SILVER.toLowerCase()
        || planName === SUBSCRIPTION_PLANS.GOLD.toLowerCase()
    )


    return (
        <>
            <header className="bg-white border-b-2 border-slate-800 px-4 md:px-[clamp(2rem,calc(29.4vw-194px),14.5rem)] py-2.5 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
                <div className="flex shrink-0 items-center gap-2 cursor-pointer" onClick={() => navigate(ROUTES.USER_DASHBOARD)} role="button">
                    <img src={logo} alt="NutriPrep Logo" className="w-10 h-10 invert" />
                    <p className="text-2xl md:text-2xl font-bold uppercase">NutriPrep</p>
                </div>

                <ButtonGroup className="hidden md:flex">
                    {NavLinks.map((link) => (
                        <Button key={link.name} variant="outline" onClick={() => navigate(link.href)} className={`flex gap-1 items-center whitespace-nowrap text-sm hover:text-slate-600 transition-colors ease-in font-semibold cursor-pointer ${location.pathname === link.href ? 'text-blue-600 hover:bg-transparent hover:text-blue-600' : ''}`}>

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
                    {onboarded === true && <CreditsPill credits={credits} />}
                    <UserNotificationBell />
                    <UserButton>
                        <UserButton.MenuItems>
                            <UserButton.Action
                                label="NutriPrep Info"
                                labelIcon={<Flame className="size-4" />}
                                onClick={() => navigate(ROUTES.USER_PROFILE)}
                            />
                        </UserButton.MenuItems>
                    </UserButton>
                </div>
                {isMenuOpen && (


                    <nav className="absolute top-full left-0 right-0 border-b-2 border-slate-800 bg-white px-4 py-4 shadow-lg md:hidden">
                        <div className="flex flex-col gap-1">
                            {NavLinks.map((link) => (
                                <Link key={link.name} to={link.href} onClick={closeMenu} className={`flex gap-1 items-center px-3 py-2 font-semibold hover:bg-zinc-100 ${location.pathname === link.href ? 'text-blue-600 hover:bg-transparent' : ''}`}>
                                    <link.icon className="size-4.5" />
                                    {link.name}
                                </Link>
                            ))}
                            <div className="px-3 py-2 flex items-center justify-between border-t border-slate-100 mt-2 pt-3">
                                <span className="text-xs font-semibold text-slate-600">Account & Alerts</span>
                                <div className="flex items-center gap-2">
                                    {onboarded === true && <CreditsPill credits={credits} />}
                                    <UserNotificationBell />
                                    <UserButton />
                                </div>
                            </div>
                        </div>
                    </nav>

                )}
            </header>
            <main className="pt-23 px-4 md:px-[clamp(2rem,calc(29.4vw-194px),14.5rem)]">
                <Outlet />
            </main>
            {isAIEnabled && (
                <ChatBot />
            )}
        </>
    )
}
