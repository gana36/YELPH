import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Clock, Phone, Star, Share2, Calendar, CheckCircle2, Navigation } from "lucide-react"
import { useParams } from "react-router-dom"
import { pollStore, type Poll } from "@/services/pollStore"
import { useState, useEffect } from "react"
import { type Business } from "@/services/yelpAi"

export function PollResult() {
    const { id } = useParams()
    const [poll, setPoll] = useState<Poll | undefined>(undefined)
    const [winner, setWinner] = useState<Business | undefined>(undefined)
    const [isBooked, setIsBooked] = useState(false)

    useEffect(() => {
        const currentPoll = pollStore.getPoll(id || '1')
        setPoll(currentPoll)

        if (currentPoll && currentPoll.candidates.length > 0) {
            // Simple winner logic: highest votes
            const sorted = [...currentPoll.candidates].sort((a, b) => b.votes - a.votes)
            setWinner(sorted[0])
        }
    }, [id])

    if (!poll) return <div className="p-8 text-center">Loading poll...</div>
    if (!winner) return <div className="p-8 text-center">No votes yet! Go vote first.</div>

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section with Winner */}
            <div className="relative h-[40vh] w-full bg-gray-900">
                <img
                    src={winner.image}
                    alt={winner.name}
                    className="h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                    <div className="mx-auto max-w-5xl">
                        <Badge className="mb-4 bg-emerald-500 hover:bg-emerald-600 text-white border-none text-lg px-4 py-1">
                            🎉 It's Decided!
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{winner.name}</h1>
                        <div className="flex items-center gap-4 text-white/90 text-lg">
                            <span className="flex items-center gap-1"><Star className="h-5 w-5 text-yellow-400 fill-yellow-400" /> {winner.rating} ({winner.reviews} reviews)</span>
                            <span>•</span>
                            <span>{winner.price}</span>
                            <span>•</span>
                            <span>{winner.tags.join(", ")}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-6 -mt-10 relative z-10">
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Why it won */}
                        <Card className="shadow-lg border-emerald-100 bg-emerald-50/50">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" /> Why it won
                                </h2>
                                <p className="text-gray-700 mb-4">
                                    This place was the clear favorite! It received <span className="font-bold text-emerald-700">{winner.votes} votes</span> (that's {(winner.votes / poll.participants.length * 100).toFixed(0)}% of the group).
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {poll.participants.filter(p => p.voted).slice(0, 5).map((p, i) => (
                                            <Avatar key={i} className="h-8 w-8 border-2 border-white">
                                                <AvatarFallback>{p.name[0]}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500">and others voted for this.</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location & Hours */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Location & Hours</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="font-medium text-gray-900">123 Culinary Ave, Flavor Town, CA 90210</p>
                                        <p className="text-sm text-gray-500 mt-1">{winner.distance} away</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="ml-auto gap-2">
                                        <Navigation className="h-4 w-4" /> Directions
                                    </Button>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="font-medium text-green-600">Open Now</p>
                                        <p className="text-sm text-gray-500">Closes at 10:00 PM</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-gray-400 mt-1" />
                                    <p className="text-gray-900">(555) 123-4567</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Next Steps */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Next Steps</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <Button className="h-auto py-4 flex flex-col items-center gap-2" variant="outline">
                                    <Calendar className="h-6 w-6 text-primary" />
                                    <span>Add to Calendar</span>
                                </Button>
                                <Button className="h-auto py-4 flex flex-col items-center gap-2" variant="outline">
                                    <Share2 className="h-6 w-6 text-primary" />
                                    <span>Share Results</span>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar: Orchestration */}
                    <div className="space-y-6">
                        <Card className="bg-primary text-white border-none shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-white">Orchestration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <p className="text-sm font-medium text-white/80 mb-1">Reservation</p>
                                    <p className="font-bold">{isBooked ? 'Confirmed ✅' : 'Not booked yet'}</p>
                                    <Button
                                        size="sm"
                                        className={`w-full mt-2 ${isBooked ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-white text-primary hover:bg-gray-100'}`}
                                        onClick={() => setIsBooked(true)}
                                        disabled={isBooked}
                                    >
                                        {isBooked ? 'Table Reserved' : `Book Table for ${poll.participants.length}`}
                                    </Button>
                                </div>

                                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <p className="text-sm font-medium text-white/80 mb-1">Ride Sharing</p>
                                    <p className="font-bold">2 cars needed</p>
                                    <Button size="sm" variant="ghost" className="w-full mt-2 text-white hover:bg-white/20">
                                        Coordinate Rides
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Confirmed Going</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {poll.participants.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{p.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-gray-900">{p.name}</span>
                                            </div>
                                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                                Confirmed
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
