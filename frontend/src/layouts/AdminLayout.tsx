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
            <main className="relative flex-1 bg-background pt-12 px-4 md:px-16">
                <SidebarTrigger className="cursor-pointer absolute top-4 left-4" />
                <Outlet />
            </main>
        </SidebarProvider>
    )
}