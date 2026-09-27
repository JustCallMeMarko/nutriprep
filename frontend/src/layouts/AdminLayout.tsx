import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
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
            <SidebarInset className="min-w-0">
                <div className="sticky top-4 z-40 w-fit px-4 -mb-10">
                    <SidebarTrigger className="cursor-pointer" />
                </div>
                <main className="flex-1 pt-12 px-4 md:px-16 pb-12">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}