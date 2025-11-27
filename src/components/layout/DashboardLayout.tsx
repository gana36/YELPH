import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"
import { Outlet } from "react-router-dom"

export function DashboardLayout() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex h-[calc(100vh-4rem)]">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
