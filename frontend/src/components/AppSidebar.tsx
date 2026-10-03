import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useRef, type KeyboardEvent, type MouseEvent } from "react"
import { Bell, LayoutDashboard, ShoppingCart, User, Utensils } from "lucide-react"
import { UserButton, useUser } from "@clerk/react"
import { Link } from "react-router-dom"
import logo from "@/assets/icons/logo.svg"
import { ROUTES } from "@/constants/routes"

const navItems = [
    { title: "Dashboard", url: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
    { title: "Meal", url: ROUTES.ADMIN_MEAL, icon: Utensils },
    { title: "Order", url: ROUTES.ADMIN_ORDER, icon: ShoppingCart },
    { title: "User", url: ROUTES.ADMIN_USER, icon: User },
]

export function AppSidebar() {
    const { user } = useUser()
    const userMenuRef = useRef<HTMLLIElement>(null)

    const openUserMenu = () => {
        userMenuRef.current?.querySelector<HTMLButtonElement>("button")?.click()
    }

    const handleProfileClick = (event: MouseEvent<HTMLElement>) => {
        if (!(event.target as HTMLElement).closest("button")) {
            openUserMenu()
        }
    }

    const handleProfileKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            openUserMenu()
        }
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<Link to={ROUTES.ADMIN_DASHBOARD} />}>
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <img src={logo} alt="NutriPrep Logo" className="size-5" />
                            </div>
                            <span className="truncate font-semibold uppercase text-lg">
                                NutriPrep
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        render={<Link to={item.url} />}
                                        tooltip={item.title}
                                    >
                                        <item.icon />
                                        <span className="font-medium">{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    render={<Link to={ROUTES.ADMIN_NOTIFICATION} />}
                                    tooltip="Notifications"
                                >
                                    <Bell />
                                    <span className="font-medium">Notifications</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem ref={userMenuRef}>
                        <SidebarMenuButton
                            size="lg"
                            render={<div />}
                            className="cursor-pointer overflow-visible"
                            onClick={handleProfileClick}
                            onKeyDown={handleProfileKeyDown}
                            role="button"
                            tabIndex={0}
                            tooltip={user?.fullName ?? "User"}
                        >
                            <UserButton />
                            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                                <p className="truncate text-sm font-semibold uppercase">
                                    {user?.fullName ?? "User"}
                                </p>
                                <p className="truncate text-xs text-sidebar-foreground/70">
                                    {user?.primaryEmailAddress?.emailAddress}
                                </p>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}