import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Navbar } from "@/components/layout/Navbar"
import { ArrowRight, Play, Mic, Camera, MessageSquare, Zap, Calendar, Users, Brain, Rocket } from "lucide-react"
import { Link } from "react-router-dom"

export function Landing() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-32 md:pt-24 md:pb-48">
                <div className="container mx-auto px-4 text-center">
                    <div className="mx-auto max-w-4xl">
                        <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
                            Make Group Decisions in <span className="text-primary">Minutes</span>, Not Hours
                        </h1>
                        <p className="mb-10 text-xl text-gray-600 md:text-2xl">
                            Stop endless group chats. Vote with voice, images, or text. Let AI handle the rest—from restaurants to reservations to split bills.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link to="/dashboard">
                                <Button size="lg" className="h-14 px-8 text-lg gap-2">
                                    Create Your First Poll <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg gap-2 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50">
                                <Play className="h-5 w-5 text-primary" /> Watch Demo
                            </Button>
                        </div>
                        <div className="mt-8 flex items-center justify-center gap-6 text-sm font-medium text-gray-500">
                            <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500"></span> No Credit Card Required
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500"></span> Free for 5 Friends
                            </span>
                        </div>
                    </div>
                </div>

                {/* Abstract Visual Background */}
                <div className="absolute top-1/2 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-30">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-300 to-purple-300 blur-3xl"></div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="bg-white py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Everything you need to decide</h2>
                        <p className="mt-4 text-lg text-gray-600">Powerful features to get everyone on the same page.</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <Card className="border-none shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                            <CardHeader>
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                    <div className="flex gap-1">
                                        <Mic className="h-4 w-4" />
                                        <Camera className="h-4 w-4" />
                                    </div>
                                </div>
                                <CardTitle>Multi-Modal Input</CardTitle>
                                <CardDescription className="text-base">
                                    Friends vote by voice, photo uploads, or text—whatever's easiest for them.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link to="#" className="text-sm font-semibold text-primary hover:underline">Learn More &rarr;</Link>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                            <CardHeader>
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <CardTitle>Real-Time Consensus</CardTitle>
                                <CardDescription className="text-base">
                                    Watch votes roll in live. AI determines winner based on preferences + constraints.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link to="#" className="text-sm font-semibold text-primary hover:underline">Learn More &rarr;</Link>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                            <CardHeader>
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <CardTitle>Auto-Orchestration</CardTitle>
                                <CardDescription className="text-base">
                                    Winner announced? We handle directions, reservations, calendar invites, and bill splits.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link to="#" className="text-sm font-semibold text-primary hover:underline">Learn More &rarr;</Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">How It Works</h2>
                    </div>

                    <div className="relative mx-auto max-w-4xl">
                        {/* Connecting Line */}
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 md:left-1/2 md:-ml-0.5"></div>

                        <div className="space-y-12">
                            {[
                                { icon: Plus, title: "Create Poll", desc: "Set the occasion, budget, and invite your friends." },
                                { icon: Users, title: "Friends Add Preferences", desc: "Everyone adds what they want via voice, text, or photos." },
                                { icon: Brain, title: "AI Finds Consensus", desc: "Our AI analyzes all inputs to find the perfect match." },
                                { icon: Rocket, title: "Everything Auto-Executes", desc: "Reservations made, invites sent, directions shared." }
                            ].map((step, index) => (
                                <div key={index} className={`relative flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-md ring-4 ring-indigo-50 z-10 md:absolute md:left-1/2 md:-ml-8">
                                        <step.icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="flex-1 md:text-center md:w-1/2">
                                        {/* Spacer for desktop layout alignment */}
                                    </div>
                                    <div className="flex-1 bg-white p-6 rounded-xl shadow-sm md:w-1/2">
                                        <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                                        <p className="mt-2 text-gray-600">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gray-900 py-24 text-center text-white">
                <div className="container mx-auto px-4">
                    <h2 className="mb-6 text-3xl font-bold md:text-5xl">Ready to Stop Arguing About Dinner?</h2>
                    <p className="mb-10 text-xl text-gray-400">Join 10,000+ friend groups making better decisions.</p>
                    <Link to="/dashboard">
                        <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary-dark">
                            Start for Free
                        </Button>
                    </Link>
                    <p className="mt-4 text-sm text-gray-500">Free forever for groups under 5. No credit card.</p>
                </div>
            </section>
        </div>
    )
}

// Helper for the icon in the map
import { Plus } from "lucide-react"
