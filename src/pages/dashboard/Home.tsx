import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Utensils, Plane, Calendar, ArrowRight, Clock, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { pollStore, type Poll } from "@/services/pollStore"
import { useState, useEffect } from "react"

export function DashboardHome() {
    const [activePolls, setActivePolls] = useState<Poll[]>([])

    useEffect(() => {
        setActivePolls(pollStore.getPolls().filter(p => p.status === 'active'))

        // Refresh on focus or interval
        const interval = setInterval(() => {
            setActivePolls(pollStore.getPolls().filter(p => p.status === 'active'))
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, Alex! 👋</h1>
                    <p className="text-gray-500">You have {activePolls.length} active polls and 2 pending decisions.</p>
                </div>
                <Link to="/dashboard/create">
                    <Button className="gap-2 bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4" /> Create New Poll
                    </Button>
                </Link>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Link to="/dashboard/create">
                    <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Utensils className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Plan a Meal</h3>
                                <p className="text-sm text-gray-500">Find a restaurant</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/dashboard/create">
                    <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Plane className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Plan a Trip</h3>
                                <p className="text-sm text-gray-500">Vacation voting</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/dashboard/create">
                    <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Plan Event</h3>
                                <p className="text-sm text-gray-500">Date & Time</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Active Polls */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Active Polls</h2>
                    <Button variant="ghost" className="text-primary">View All</Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {activePolls.map((poll) => (
                        <Link to={`/poll/${poll.id}`} key={poll.id}>
                            <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                                            {poll.type.charAt(0).toUpperCase() + poll.type.slice(1)}
                                        </Badge>
                                        <Badge variant="outline" className="flex gap-1 items-center">
                                            <Clock className="h-3 w-3" /> 2h left
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg mt-2 group-hover:text-primary transition-colors">{poll.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>{poll.participants.filter(p => p.voted).length}/{poll.participants.length} voted</span>
                                            </div>
                                            <span>68% Consensus</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                                            <div className="h-full bg-primary w-[68%] rounded-full" />
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex -space-x-2">
                                                {poll.participants.slice(0, 3).map((p, i) => (
                                                    <Avatar key={i} className="h-8 w-8 border-2 border-white">
                                                        <AvatarFallback>{p.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                                {poll.participants.length > 3 && (
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium text-gray-500">
                                                        +{poll.participants.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <Button size="sm" variant="ghost" className="gap-1 text-primary group-hover:translate-x-1 transition-transform">
                                                View <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}

                    {activePolls.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                            <p className="text-gray-500">No active polls. Create one to get started!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Decisions (Static for now) */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Decisions</h2>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="min-w-[300px] flex-shrink-0">
                            <CardContent className="p-4 flex gap-4 items-center">
                                <img
                                    src={`https://images.unsplash.com/photo-${i === 1 ? '1559314809-0d155014e29e' : i === 2 ? '1517248135467-4c7edcad34c4' : '1552566626-52f8b828add9'}?auto=format&fit=crop&w=100&q=80`}
                                    className="h-16 w-16 rounded-lg object-cover"
                                />
                                <div>
                                    <h4 className="font-bold text-gray-900">Team Lunch</h4>
                                    <p className="text-sm text-gray-500">Thai Palace • Oct 24</p>
                                    <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                        <Badge variant="success" className="h-5 px-1">Completed</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
