import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Utensils, Plane, Calendar, Wrench, Check, MapPin, Clock, Users, ArrowRight, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { pollStore } from "@/services/pollStore"

export function CreatePoll() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [selectedType, setSelectedType] = useState<string | null>(null)
    const [title, setTitle] = useState("")
    const [location, setLocation] = useState("")

    const nextStep = () => setStep(step + 1)
    const prevStep = () => setStep(step - 1)

    const handleCreatePoll = () => {
        if (!selectedType || !title) return

        const newPoll = pollStore.createPoll({
            title: title,
            type: selectedType as any,
            status: 'active',
            participants: [
                { name: 'You', voted: false },
                { name: 'Alice', voted: false },
                { name: 'Bob', voted: false }
            ]
        })

        navigate(`/poll/${newPoll.id}`)
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8 flex items-center justify-center gap-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step >= s ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                            }`}>
                            {s}
                        </div>
                        {s < 3 && <div className={`h-1 w-12 rounded-full ${step > s ? "bg-primary" : "bg-gray-100"}`} />}
                    </div>
                ))}
            </div>

            <Card className="border-none shadow-xl">
                <CardContent className="p-8">
                    {/* Step 1: Poll Type */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900">What are you deciding?</h2>
                                <p className="text-gray-500">Choose a category to get started</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'restaurant', icon: Utensils, label: 'Restaurant', color: 'bg-indigo-100 text-indigo-600' },
                                    { id: 'trip', icon: Plane, label: 'Trip Planning', color: 'bg-emerald-100 text-emerald-600' },
                                    { id: 'activity', icon: Calendar, label: 'Activity', color: 'bg-amber-100 text-amber-600' },
                                    { id: 'service', icon: Wrench, label: 'Service', color: 'bg-purple-100 text-purple-600' },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 p-8 transition-all hover:border-primary/50 hover:bg-gray-50 ${selectedType === type.id ? 'border-primary bg-indigo-50/50' : 'border-gray-100'
                                            }`}
                                    >
                                        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${type.color}`}>
                                            <type.icon className="h-8 w-8" />
                                        </div>
                                        <span className="font-semibold text-gray-900">{type.label}</span>
                                        {selectedType === type.id && (
                                            <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900">Tell us about your poll</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Poll Title</label>
                                    <Input
                                        placeholder="e.g., Friday Night Dinner"
                                        className="text-lg"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Where are you looking?"
                                            className="pl-9"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Budget per person</label>
                                        <Input type="number" placeholder="$50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Duration</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                                <option>4 hours</option>
                                                <option>12 hours</option>
                                                <option>1 day</option>
                                                <option>Custom</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Dietary Restrictions</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal'].map((tag) => (
                                            <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-gray-200">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Invite */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900">Who's deciding with you?</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input placeholder="Search friends..." className="pl-9" />
                                </div>

                                <div className="space-y-2">
                                    {['Alice', 'Bob', 'Carol', 'David'].map((friend) => (
                                        <div key={friend} className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{friend[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-gray-900">{friend}</p>
                                                    <p className="text-xs text-gray-500">Last voted 2 days ago</p>
                                                </div>
                                            </div>
                                            <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
                                        </div>
                                    ))}
                                </div>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-muted-foreground">Or share link</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Input value="https://groupconsensus.app/poll/123" readOnly />
                                    <Button variant="outline">Copy</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="mt-8 flex justify-between">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={step === 1}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>

                        {step < 3 ? (
                            <Button onClick={nextStep} disabled={step === 1 && !selectedType} className="gap-2">
                                Next <ArrowRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleCreatePoll} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                                Create Poll <Check className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
