import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Clock, Phone, Star, Share2, Calendar, CheckCircle2, Navigation, Loader2 } from "lucide-react"
import { useParams, useLocation } from "react-router-dom"
import { pollStore, type Poll } from "@/services/pollStore"
import { useState, useEffect } from "react"
import { type Business } from "@/services/yelpAi"
import { openDirectionsFromCurrentLocation, openDirections, getGoogleMapsDirectionsUrl } from "@/lib/directionsHelper"
import { calendarService } from "@/services/calendarService"

export function PollResult() {
    const { id } = useParams()
    const location = useLocation()
    const [poll, setPoll] = useState<Poll | undefined>(undefined)
    const [winner, setWinner] = useState<Business | undefined>(undefined)
    const [isBooked, setIsBooked] = useState(false)
    const [isAddingToCalendar, setIsAddingToCalendar] = useState(false)

    useEffect(() => {
        const currentPoll = pollStore.getPoll(id || '1')
        setPoll(currentPoll)

        if (currentPoll && currentPoll.candidates.length > 0) {
            // Simple winner logic: highest votes
            const sorted = [...currentPoll.candidates].sort((a, b) => b.votes - a.votes)
            setWinner(sorted[0])
        }
    }, [id])

    const handleGetDirections = async () => {
        if (!winner?.coordinates) {
            alert('Location coordinates not available for this restaurant')
            return
        }

        try {
            await openDirectionsFromCurrentLocation({
                latitude: winner.coordinates.latitude,
                longitude: winner.coordinates.longitude,
                name: winner.name
            })
        } catch (error) {
            console.error('Failed to open directions:', error)
            alert('Failed to open directions. Please try again.')
        }
    }

    const getDisplayAddress = (): string => {
        if (winner?.location?.display_address && winner.location.display_address.length > 0) {
            return winner.location.display_address.join(', ')
        }
        // Fallback address
        return '123 Culinary Ave, Flavor Town, CA 90210'
    }

    const handleGetDirectionsForParticipant = (participantName: string) => {
        if (!winner?.coordinates) {
            alert('Location coordinates not available for this restaurant')
            return
        }

        const participant = poll?.participants.find(p => p.name === participantName)

        if (participant?.location) {
            // Use participant's stored location
            openDirections({
                origin: {
                    latitude: participant.location.lat,
                    longitude: participant.location.lng
                },
                destination: {
                    latitude: winner.coordinates.latitude,
                    longitude: winner.coordinates.longitude,
                    name: winner.name
                }
            })
        } else {
            // Fallback to current location
            openDirectionsFromCurrentLocation({
                latitude: winner.coordinates.latitude,
                longitude: winner.coordinates.longitude,
                name: winner.name
            })
        }
    }

    const handleAddToCalendar = async () => {
        if (!winner || !poll) return

        setIsAddingToCalendar(true)

        try {
            // Check if user is authenticated
            if (!calendarService.isAuthenticated()) {
                // Store current URL to return after auth
                sessionStorage.setItem('calendar_return_url', location.pathname)

                // Start OAuth flow
                await calendarService.startAuth(poll.owner)
                return
            }

            // Get directions URL
            const directionsUrl = winner.coordinates
                ? getGoogleMapsDirectionsUrl({
                      destination: {
                          latitude: winner.coordinates.latitude,
                          longitude: winner.coordinates.longitude,
                          name: winner.name
                      }
                  })
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(winner.name)}`

            // Create calendar event
            const result = await calendarService.createRestaurantEvent(
                winner.name,
                getDisplayAddress(),
                directionsUrl,
                poll.participants.map(p => p.name)
            )

            setIsAddingToCalendar(false)

            if (result.success) {
                alert('✅ Event added to your Google Calendar!\n\nYou\'ll receive notifications before the event.')
                if (result.event_link) {
                    window.open(result.event_link, '_blank')
                }
            } else {
                alert(`❌ Failed to add event: ${result.error}`)
            }
        } catch (error) {
            setIsAddingToCalendar(false)
            console.error('Error adding to calendar:', error)
            alert('❌ An error occurred. Please try again.')
        }
    }

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
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{getDisplayAddress()}</p>
                                        {winner.distance && (
                                            <p className="text-sm text-gray-500 mt-1">{winner.distance} away</p>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="ml-auto gap-2"
                                        onClick={handleGetDirections}
                                    >
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
                                {winner.phone && (
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-5 w-5 text-gray-400 mt-1" />
                                        <a href={`tel:${winner.phone}`} className="text-gray-900 hover:text-primary">
                                            {winner.phone}
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Next Steps */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Next Steps</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <Button
                                    className="h-auto py-4 flex flex-col items-center gap-2"
                                    variant="outline"
                                    onClick={handleAddToCalendar}
                                    disabled={isAddingToCalendar}
                                >
                                    {isAddingToCalendar ? (
                                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                    ) : (
                                        <Calendar className="h-6 w-6 text-primary" />
                                    )}
                                    <span>{isAddingToCalendar ? 'Adding...' : 'Add to Calendar'}</span>
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
                                        <div key={i} className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <Avatar className="h-8 w-8 flex-shrink-0">
                                                    <AvatarFallback>{p.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-medium text-gray-900 truncate">{p.name}</span>
                                                    {p.location && (
                                                        <span className="text-xs text-gray-500">
                                                            📍 Location saved
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex-shrink-0 h-8 w-8 p-0"
                                                onClick={() => handleGetDirectionsForParticipant(p.name)}
                                                title={`Get directions for ${p.name}`}
                                            >
                                                <Navigation className="h-4 w-4 text-blue-600" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Group Directions */}
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-900">
                                    <Navigation className="h-5 w-5" />
                                    Get Directions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-blue-800 mb-3">
                                    Everyone can get personalized directions to {winner.name}
                                </p>
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={handleGetDirections}
                                >
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Open in Maps
                                </Button>
                                <p className="text-xs text-blue-600 mt-2 text-center">
                                    Opens in your preferred maps app
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
