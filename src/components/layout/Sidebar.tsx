import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, BarChart2, History, Users, Settings, Plus } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const location = useLocation()

    const navItems = [
        { icon: Home, label: "Home", href: "/dashboard" },
        { icon: BarChart2, label: "Active Polls", href: "/dashboard/polls", badge: "3" },
        { icon: History, label: "Poll History", href: "/dashboard/history" },
        { icon: Users, label: "Friend Groups", href: "/dashboard/groups" },
        { icon: BarChart2, label: "Analytics", href: "/dashboard/analytics" },
        { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ]

    return (
        <div className={cn("pb-12 w-64 border-r bg-gray-50/50 hidden md:block", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <Link key={item.href} to={item.href}>
                                <Button
                                    variant={location.pathname === item.href ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start gap-2",
                                        location.pathname === item.href && "bg-indigo-50 text-primary hover:bg-indigo-100 hover:text-primary-dark"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                    {item.badge && (
                                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                                            {item.badge}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="px-3 py-2">
                    <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white">
                        <h3 className="font-semibold">Upgrade to Pro</h3>
                        <p className="text-xs text-indigo-100 mt-1 mb-3">Get unlimited polls and AI insights.</p>
                        <Button size="sm" variant="secondary" className="w-full bg-white text-indigo-600 hover:bg-indigo-50">
                            Upgrade
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
