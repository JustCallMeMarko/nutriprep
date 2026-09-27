import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useUser } from '@clerk/react'


export default function Layout() {
    const { isLoaded, user } = useUser()
    const role = user?.publicMetadata?.role

    if (!isLoaded) {
        return null
    }

    if (!role) {
        return <Navigate to={ROUTES.HOME} replace />
    }

    if (role !== 'user' && role !== 'admin' && role !== 'rider') {
        return <Navigate to={ROUTES.HOME} replace />
    }

    if (role !== 'admin') {
        return <Navigate to={`/${role}`} replace />
    }
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 bg-background">
                <SidebarTrigger className="cursor-pointer fixed" />
                <Outlet />
            </main>
        </SidebarProvider>
    )
}