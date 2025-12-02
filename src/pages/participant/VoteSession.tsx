import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Image as ImageIcon, Plus, ThumbsUp, Star, MapPin, Phone, ArrowRight, X, Search, Sparkles, RotateCcw, Heart, XCircle, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { yelpAiService, type Business } from "@/services/yelpAi"
import { pollStore, type Poll } from "@/services/pollStore"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { Modal } from "@/components/ui/modal"
import { cn } from "@/lib/utils"
import { useVoiceRecording, formatDuration } from "@/hooks/useVoiceRecording"

type SwipeAction = {
    businessId: string
    action: 'like' | 'pass'
    userId: string
}

export function VoteSession() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [poll, setPoll] = useState<Poll | undefined>(undefined)
    const [currentUser, setCurrentUser] = useState<string>("You")

    const [chatInput, setChatInput] = useState<string>("")
    const [searchResults, setSearchResults] = useState<Business[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)

    // Voice recording
    const {
        isRecording,
        isProcesing: isProcessingVoice,
        recordingDuration,
        startRecording,
        stopRecording,
        cancelRecording,
        isSupported: isVoiceSupported
    } = useVoiceRecording()

    // Image upload
    const [isProcessingImage, setIsProcessingImage] = useState(false)
    const imageInputRef = useRef<HTMLInputElement>(null)

    // Swipe state
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [swipeActions, setSwipeActions] = useState<SwipeAction[]>([])
    const [activeTab, setActiveTab] = useState<'deck' | 'liked' | 'passed'>('deck')
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)

    // Initialize User Identity and capture location
    useEffect(() => {
        const userParam = searchParams.get('user')
        if (userParam) {
            setCurrentUser(userParam)

            // Capture user's location when they join the session
            if ('geolocation' in navigator && id) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        pollStore.updateParticipantLocation(id, userParam, {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        })
                        console.log(`Location captured for ${userParam}`)
                    },
                    (error) => {
                        console.warn('Could not capture user location:', error)
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000 // 5 minutes
                    }
                )
            }
        }
    }, [searchParams, id])

    // Load poll data
    useEffect(() => {
        const currentPoll = pollStore.getPoll(id || '1')
        setPoll(currentPoll)

        const interval = setInterval(() => {
            setPoll(pollStore.getPoll(id || '1'))
        }, 2000)
        return () => clearInterval(interval)
    }, [id])

    const handleSearch = async () => {
        if (!chatInput.trim()) return

        setIsSearching(true)
        setShowResults(true)

        try {
            // Get user's location for better results
            let location = await yelpAiService.getUserLocation()

            // If location permission denied, use default location (San Francisco)
            if (!location) {
                console.warn('Location not available, using default location (San Francisco)')
                location = {
                    latitude: 37.7749,
                    longitude: -122.4194
                }
            }

            // Use multimodal search endpoint for text queries
            const result = await yelpAiService.multimodalSearch({
                textQuery: chatInput,
                latitude: location.latitude,
                longitude: location.longitude
            })

            setSearchResults(result.businesses || [])
        } catch (error) {
            console.error("Search failed", error)
        } finally {
            setIsSearching(false)
        }
    }

    const handleAddCandidate = (business: Business) => {
        if (!poll) return
        pollStore.addCandidate(poll.id, business)
        setPoll(pollStore.getPoll(poll.id))
    }

    const handleSwipe = (direction: 'like' | 'pass') => {
        if (!poll || currentCardIndex >= poll.candidates.length) return

        const currentCard = poll.candidates[currentCardIndex]

        // Animate swipe
        setDragOffset({ x: direction === 'like' ? 1000 : -1000, y: 0 })

        setTimeout(() => {
            // Record action
            const newAction: SwipeAction = {
                businessId: currentCard.id,
                action: direction,
                userId: currentUser
            }
            setSwipeActions(prev => [...prev, newAction])

            // If liked, vote for it
            if (direction === 'like') {
                pollStore.vote(poll.id, currentCard.id, currentUser)
                setPoll(pollStore.getPoll(poll.id))
            }

            // Move to next card
            setCurrentCardIndex(prev => prev + 1)
            setDragOffset({ x: 0, y: 0 })
        }, 300)
    }

    const handleMouseDown = () => {
        setIsDragging(true)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        setDragOffset({ x: e.movementX + dragOffset.x, y: e.movementY + dragOffset.y })
    }

    const handleMouseUp = () => {
        if (!isDragging) return
        setIsDragging(false)

        // If dragged far enough, trigger swipe
        if (Math.abs(dragOffset.x) > 150) {
            handleSwipe(dragOffset.x > 0 ? 'like' : 'pass')
        } else {
            // Snap back
            setDragOffset({ x: 0, y: 0 })
        }
    }

    const handleTouchStart = () => {
        setIsDragging(true)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || !cardRef.current) return
        const touch = e.touches[0]
        const rect = cardRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const offsetX = touch.clientX - centerX
        setDragOffset({ x: offsetX, y: 0 })
    }

    const handleTouchEnd = () => {
        if (!isDragging) return
        setIsDragging(false)

        // If dragged far enough, trigger swipe
        if (Math.abs(dragOffset.x) > 100) {
            handleSwipe(dragOffset.x > 0 ? 'like' : 'pass')
        } else {
            // Snap back
            setDragOffset({ x: 0, y: 0 })
        }
    }

    const handleEndPoll = () => {
        if (!poll) return
        navigate(`/poll/${poll.id}/result`)
    }

    const handleVoiceInput = async () => {
        if (isRecording) {
            // Stop recording and process
            try {
                const audioFile = await stopRecording()
                if (!audioFile) return

                setIsSearching(true)
                setShowResults(true)

                // Get user location with fallback
                let location = await yelpAiService.getUserLocation()
                if (!location) {
                    location = { latitude: 37.7749, longitude: -122.4194 } // San Francisco default
                }

                // Use multimodal search - combines Gemini + Yelp in one call
                const result = await yelpAiService.multimodalSearch({
                    audioFile: audioFile,
                    latitude: location.latitude,
                    longitude: location.longitude
                })

                // Update UI with results
                setChatInput(result.analysis?.transcription || result.search_query || "")
                setSearchResults(result.businesses || [])
                setIsSearching(false)

            } catch (error) {
                console.error('Voice processing error:', error)
                setIsSearching(false)
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
                alert(`Failed to process voice input: ${errorMessage}. Please try again.`)
            }
        } else {
            // Start recording
            try {
                await startRecording()
            } catch (error) {
                console.error('Failed to start recording:', error)
                alert('Microphone access denied. Please allow microphone access in your browser settings.')
            }
        }
    }

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setIsProcessingImage(true)
            setIsSearching(true)
            setShowResults(true)

            // Get user location with fallback
            let location = await yelpAiService.getUserLocation()
            if (!location) {
                location = { latitude: 37.7749, longitude: -122.4194 } // San Francisco default
            }

            // Use multimodal search - combines Gemini + Yelp in one call
            const result = await yelpAiService.multimodalSearch({
                imageFile: file,
                latitude: location.latitude,
                longitude: location.longitude
            })

            // Update UI with results
            const description = result.analysis?.description?.substring(0, 50) || result.search_query
            setChatInput(`Looking for: ${description}` || "")
            setSearchResults(result.businesses || [])
            setIsSearching(false)
            setIsProcessingImage(false)

        } catch (error) {
            console.error('Image processing error:', error)
            setIsSearching(false)
            setIsProcessingImage(false)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
            alert(`Failed to process image: ${errorMessage}. Please try again.`)
        }

        // Reset input
        if (imageInputRef.current) {
            imageInputRef.current.value = ''
        }
    }

    const triggerImageUpload = () => {
        imageInputRef.current?.click()
    }

    if (!poll) return <div className="flex items-center justify-center h-screen">Loading poll...</div>

    const isOwner = currentUser === poll.owner
    const remainingCards = poll.candidates.slice(currentCardIndex)
    const likedCards = poll.candidates.filter(c =>
        swipeActions.some(a => a.businessId === c.id && a.action === 'like' && a.userId === currentUser)
    )
    const passedCards = poll.candidates.filter(c =>
        swipeActions.some(a => a.businessId === c.id && a.action === 'pass' && a.userId === currentUser)
    )

    const currentCard = remainingCards[0]
    const rotation = dragOffset.x / 20

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col overflow-hidden">
            {/* Top Navigation Bar */}
            <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/60 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-gray-100 rounded-xl">
                        <ArrowRight className="h-4 w-4 rotate-180" />
                    </Button>
                    <div>
                        <h1 className="font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{poll.title}</h1>
                        <p className="text-xs text-gray-500">{currentUser}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Filter Chips */}
                    <Button
                        size="sm"
                        variant={activeTab === 'deck' ? 'secondary' : 'outline'}
                        className={cn("rounded-full text-xs", activeTab === 'deck' && "bg-indigo-600 text-white")}
                        onClick={() => setActiveTab('deck')}
                    >
                        <Sparkles className="h-3 w-3 mr-1" />
                        {remainingCards.length}
                    </Button>
                    <Button
                        size="sm"
                        variant={activeTab === 'liked' ? 'secondary' : 'outline'}
                        className={cn("rounded-full text-xs", activeTab === 'liked' && "bg-green-600 text-white")}
                        onClick={() => setActiveTab('liked')}
                    >
                        <Heart className="h-3 w-3 mr-1" />
                        {likedCards.length}
                    </Button>
                    <Button
                        size="sm"
                        variant={activeTab === 'passed' ? 'secondary' : 'outline'}
                        className={cn("rounded-full text-xs", activeTab === 'passed' && "bg-gray-600 text-white")}
                        onClick={() => setActiveTab('passed')}
                    >
                        <XCircle className="h-3 w-3 mr-1" />
                        {passedCards.length}
                    </Button>

                    {isOwner && (
                        <Button onClick={handleEndPoll} size="sm" className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl ml-2">
                            End
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Swipe Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 pb-32 relative overflow-hidden">
                {activeTab === 'deck' && (
                    <>
                        {currentCard ? (
                            <div className="relative w-full max-w-sm h-[600px] flex items-center justify-center">
                                {/* Card Stack */}
                                {remainingCards.slice(0, 3).map((card, index) => (
                                    <div
                                        key={card.id}
                                        ref={index === 0 ? cardRef : null}
                                        className={cn(
                                            "absolute w-full transition-all duration-300 cursor-grab active:cursor-grabbing",
                                            index > 0 && "pointer-events-none"
                                        )}
                                        style={{
                                            transform: index === 0
                                                ? `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg) scale(1)`
                                                : `translateY(${index * 10}px) scale(${1 - index * 0.05})`,
                                            zIndex: 10 - index,
                                            opacity: index === 0 ? 1 : 1 - index * 0.2
                                        }}
                                        onMouseDown={index === 0 ? handleMouseDown : undefined}
                                        onMouseMove={index === 0 ? handleMouseMove : undefined}
                                        onMouseUp={index === 0 ? handleMouseUp : undefined}
                                        onMouseLeave={index === 0 ? handleMouseUp : undefined}
                                        onTouchStart={index === 0 ? handleTouchStart : undefined}
                                        onTouchMove={index === 0 ? handleTouchMove : undefined}
                                        onTouchEnd={index === 0 ? handleTouchEnd : undefined}
                                    >
                                        {index === 0 && (
                                            <Card className="overflow-hidden shadow-2xl border-0 rounded-3xl">
                                                <div className="relative h-[500px] overflow-hidden">
                                                    <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                                    {/* Swipe Indicators */}
                                                    <div className={cn(
                                                        "absolute top-8 left-8 bg-green-500 text-white px-6 py-3 rounded-2xl font-bold text-2xl rotate-12 transition-opacity border-4 border-white shadow-xl",
                                                        dragOffset.x > 50 ? "opacity-100" : "opacity-0"
                                                    )}>
                                                        LIKE
                                                    </div>
                                                    <div className={cn(
                                                        "absolute top-8 right-8 bg-red-500 text-white px-6 py-3 rounded-2xl font-bold text-2xl -rotate-12 transition-opacity border-4 border-white shadow-xl",
                                                        dragOffset.x < -50 ? "opacity-100" : "opacity-0"
                                                    )}>
                                                        PASS
                                                    </div>

                                                    <div className="absolute bottom-6 left-6 right-6 text-white">
                                                        <h2 className="font-bold text-3xl leading-tight drop-shadow-lg mb-3">{card.name}</h2>
                                                        <div className="flex items-center gap-3 text-sm flex-wrap">
                                                            <div className="flex items-center gap-1 bg-yellow-400/90 text-yellow-900 px-3 py-1.5 rounded-full font-bold">
                                                                <Star className="h-4 w-4 fill-current" />
                                                                <span>{card.rating}</span>
                                                            </div>
                                                            <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full font-semibold">{card.price}</span>
                                                            <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full font-semibold flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" /> {card.distance}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                                            {card.tags.slice(0, 4).map(tag => (
                                                                <Badge key={tag} className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs">{tag}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md text-gray-900 px-3 py-1.5 rounded-full text-sm font-bold shadow-xl flex items-center gap-1.5">
                                                        <ThumbsUp className="h-4 w-4 text-indigo-600" />
                                                        <span className="text-indigo-600">{card.votes}</span>
                                                    </div>
                                                </div>
                                                <CardContent className="p-4 bg-white">
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={() => setSelectedBusiness(card)}
                                                    >
                                                        View Details
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
                                    <Sparkles className="h-14 w-14 text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">All done!</h3>
                                <p className="text-gray-500">You've reviewed all options. Check your liked choices!</p>
                            </div>
                        )}
                    </>
                )}

                {/* Liked Tab */}
                {activeTab === 'liked' && (
                    <div className="w-full max-w-2xl space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Liked Choices</h2>
                        {likedCards.length > 0 ? (
                            likedCards.map(card => (
                                <Card key={card.id} className="flex gap-4 p-4 hover:shadow-lg transition-all group">
                                    <img src={card.image} className="w-24 h-24 rounded-lg object-cover" alt={card.name} />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{card.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                            <span>{card.rating}</span>
                                            <span>•</span>
                                            <span>{card.price}</span>
                                            <span>•</span>
                                            <span className="text-indigo-600 font-semibold">{card.votes} votes</span>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs"
                                                onClick={() => {
                                                    // Move back to deck
                                                    setSwipeActions(prev => prev.filter(a => a.businessId !== card.id || a.userId !== currentUser))
                                                    const cardIndex = poll?.candidates.findIndex(c => c.id === card.id) || 0
                                                    if (cardIndex >= 0 && cardIndex < currentCardIndex) {
                                                        setCurrentCardIndex(cardIndex)
                                                    }
                                                    setActiveTab('deck')
                                                }}
                                            >
                                                <RotateCcw className="h-3 w-3 mr-1" />
                                                Back to Deck
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs text-red-600 hover:text-red-700"
                                                onClick={() => {
                                                    // Change to passed
                                                    setSwipeActions(prev => prev.map(a =>
                                                        a.businessId === card.id && a.userId === currentUser
                                                            ? { ...a, action: 'pass' }
                                                            : a
                                                    ))
                                                }}
                                            >
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Move to Passed
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Heart className="h-10 w-10 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">No liked choices yet</p>
                                <p className="text-sm text-gray-400 mt-1">Swipe right on cards you like!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Passed Tab */}
                {activeTab === 'passed' && (
                    <div className="w-full max-w-2xl space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Passed Options</h2>
                        {passedCards.length > 0 ? (
                            passedCards.map(card => (
                                <Card key={card.id} className="flex gap-4 p-4 opacity-60 hover:opacity-100 transition-all group">
                                    <img src={card.image} className="w-24 h-24 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" alt={card.name} />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{card.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                            <Star className="h-4 w-4 text-gray-400" />
                                            <span>{card.rating}</span>
                                            <span>•</span>
                                            <span>{card.price}</span>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs"
                                                onClick={() => {
                                                    // Move back to deck
                                                    setSwipeActions(prev => prev.filter(a => a.businessId !== card.id || a.userId !== currentUser))
                                                    const cardIndex = poll?.candidates.findIndex(c => c.id === card.id) || 0
                                                    if (cardIndex >= 0 && cardIndex < currentCardIndex) {
                                                        setCurrentCardIndex(cardIndex)
                                                    }
                                                    setActiveTab('deck')
                                                }}
                                            >
                                                <RotateCcw className="h-3 w-3 mr-1" />
                                                Reconsider
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs text-green-600 hover:text-green-700"
                                                onClick={() => {
                                                    // Change to liked
                                                    setSwipeActions(prev => prev.map(a =>
                                                        a.businessId === card.id && a.userId === currentUser
                                                            ? { ...a, action: 'like' }
                                                            : a
                                                    ))
                                                    // Add vote
                                                    if (poll) {
                                                        pollStore.vote(poll.id, card.id, currentUser)
                                                        setPoll(pollStore.getPoll(poll.id))
                                                    }
                                                }}
                                            >
                                                <Heart className="h-3 w-3 mr-1" />
                                                Actually, I Like This
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="h-10 w-10 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">No passed options yet</p>
                                <p className="text-sm text-gray-400 mt-1">Swipe left on cards you want to skip</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Recording Indicator Overlay */}
            {isRecording && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center">
                        <div className="w-20 h-20 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center relative">
                            <Mic className="h-10 w-10 text-white" />
                            <span className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Listening...</h3>
                        <p className="text-gray-600 mb-4">Speak your restaurant preferences</p>
                        <div className="text-2xl font-mono text-red-600 mb-6">
                            {formatDuration(recordingDuration)}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => cancelRecording()}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-red-500 hover:bg-red-600"
                                onClick={handleVoiceInput}
                            >
                                Stop & Search
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Command Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent pt-16 z-30">
                <div className="max-w-3xl mx-auto relative">
                    {/* Search Results Drawer */}
                    {showResults && (
                        <div className="absolute bottom-full left-0 right-0 mb-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[60vh] flex flex-col">
                            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between sticky top-0 z-10">
                                <h3 className="font-bold text-sm text-gray-800">
                                    {isSearching ? "Searching..." : `Found ${searchResults.length} results`}
                                </h3>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-gray-100" onClick={() => setShowResults(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="overflow-y-auto p-3 space-y-2">
                                {isSearching ? (
                                    <div className="p-12 text-center text-gray-400">
                                        <div className="animate-spin h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
                                        <p className="font-medium">Searching Yelp...</p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(result => (
                                        <div key={result.id} className="flex gap-3 p-3 hover:bg-gray-50 rounded-xl group transition-all border border-transparent hover:border-gray-200 hover:shadow-sm">
                                            <img src={result.image} className="w-20 h-20 rounded-lg object-cover bg-gray-200 shadow-sm" alt={result.name} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-semibold text-gray-900 truncate">{result.name}</h4>
                                                    <span className="text-xs text-gray-500 font-medium">{result.rating} ⭐</span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate mb-2">{result.tags.join(", ")} • {result.price}</p>
                                                <Button size="sm" variant="secondary" className="h-8 text-xs w-full bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 border-indigo-200 font-semibold" onClick={() => handleAddCandidate(result)}>
                                                    Add to Deck
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center text-gray-500 text-sm">
                                        <p className="font-medium">No results found.</p>
                                        <p className="text-xs mt-1">Try "Sushi" or "Italian".</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Input Bar */}
                    <div className="bg-white rounded-full shadow-2xl border border-gray-200 p-2 flex items-center gap-2 ring-1 ring-gray-100">
                        <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" onClick={() => setShowResults(!showResults)}>
                            <Plus className="h-5 w-5" />
                        </Button>
                        <Input
                            className="border-0 shadow-none focus-visible:ring-0 bg-transparent px-2 font-medium text-gray-700 placeholder:text-gray-400"
                            placeholder="Suggest a place (e.g., 'Best tacos nearby')..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            onFocus={() => {
                                if (searchResults.length > 0) setShowResults(true)
                            }}
                        />
                        <div className="flex items-center gap-1 pr-1">
                            {/* Voice Recording Button */}
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "rounded-full transition-all",
                                        isRecording
                                            ? "text-red-500 bg-red-50 hover:bg-red-100 animate-pulse"
                                            : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                                    )}
                                    onClick={handleVoiceInput}
                                    disabled={isProcessingVoice || isSearching}
                                >
                                    {isProcessingVoice ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Mic className="h-4 w-4" />
                                    )}
                                </Button>
                                {isRecording && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                )}
                            </div>

                            {/* Image Upload Button */}
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                onClick={triggerImageUpload}
                                disabled={isProcessingImage || isSearching}
                            >
                                {isProcessingImage ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ImageIcon className="h-4 w-4" />
                                )}
                            </Button>

                            {/* Search Button */}
                            <Button
                                size="icon"
                                className="rounded-full h-9 w-9 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                                onClick={handleSearch}
                                disabled={isSearching || isProcessingVoice || isProcessingImage}
                            >
                                {isSearching ? (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Business Detail Modal */}
            <Modal isOpen={!!selectedBusiness} onClose={() => setSelectedBusiness(null)} title={selectedBusiness?.name}>
                {selectedBusiness && (
                    <div className="space-y-6">
                        <img src={selectedBusiness.image} alt={selectedBusiness.name} className="w-full h-64 object-cover rounded-2xl shadow-lg" />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="bg-gradient-to-br from-yellow-400 to-orange-400 text-yellow-900 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow-md">
                                    <Star className="h-4 w-4 fill-current" /> {selectedBusiness.rating}
                                </div>
                                <span className="text-gray-500 text-sm font-medium">({selectedBusiness.reviews} reviews)</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{selectedBusiness.price}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {selectedBusiness.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100">{tag}</Badge>
                            ))}
                        </div>

                        <div className="space-y-3 text-sm text-gray-600 bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-indigo-500" />
                                <span className="font-medium">{selectedBusiness.distance} away</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-indigo-500" />
                                <span className="font-medium">(555) 123-4567</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
