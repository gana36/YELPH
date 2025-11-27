import { Button } from "@/components/ui/button"
import { Vote, Menu, X } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                            <Vote className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">Group Consensus</span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="#features" className="text-sm font-medium text-gray-600 hover:text-primary">Features</Link>
                    <Link to="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary">How It Works</Link>
                    <Link to="#pricing" className="text-sm font-medium text-gray-600 hover:text-primary">Pricing</Link>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost">Sign In</Button>
                    <Button>Get Started</Button>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden border-t bg-white p-4">
                    <div className="flex flex-col gap-4">
                        <Link to="#features" className="text-sm font-medium text-gray-600">Features</Link>
                        <Link to="#how-it-works" className="text-sm font-medium text-gray-600">How It Works</Link>
                        <Link to="#pricing" className="text-sm font-medium text-gray-600">Pricing</Link>
                        <div className="flex flex-col gap-2 pt-4 border-t">
                            <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                            <Button className="w-full">Get Started</Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
