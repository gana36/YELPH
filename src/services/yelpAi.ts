// Mock Yelp AI Service

export interface Business {
    id: string
    name: string
    rating: number
    reviews: number
    price: string
    distance: string
    image: string
    tags: string[]
    votes: number
}

const MOCK_BUSINESSES: Business[] = [
    {
        id: "1",
        name: "Thai Palace",
        rating: 4.8,
        reviews: 234,
        price: "$$",
        distance: "2.3 mi",
        image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=400&q=80",
        votes: 3,
        tags: ["Thai", "Spicy", "Noodles"]
    },
    {
        id: "2",
        name: "Olive Garden",
        rating: 4.2,
        reviews: 1200,
        price: "$$",
        distance: "3.4 mi",
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80",
        votes: 2,
        tags: ["Italian", "Chain", "Pasta"]
    },
    {
        id: "3",
        name: "Sushi Express",
        rating: 4.6,
        reviews: 89,
        price: "$$$",
        distance: "1.8 mi",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80",
        votes: 1,
        tags: ["Japanese", "Sushi", "Fresh"]
    },
    {
        id: "4",
        name: "Burger Joint",
        rating: 4.5,
        reviews: 500,
        price: "$",
        distance: "0.5 mi",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
        votes: 0,
        tags: ["American", "Burgers", "Fast Food"]
    },
    {
        id: "5",
        name: "Taco Fiesta",
        rating: 4.7,
        reviews: 320,
        price: "$",
        distance: "1.2 mi",
        image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80",
        votes: 0,
        tags: ["Mexican", "Tacos", "Spicy"]
    }
]

export const yelpAiService = {
    async search(query: string): Promise<Business[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        const lowerQuery = query.toLowerCase()

        // Simple mock filtering
        if (lowerQuery.includes("thai")) {
            return MOCK_BUSINESSES.filter(b => b.tags.some(t => t.toLowerCase().includes("thai")))
        }
        if (lowerQuery.includes("italian") || lowerQuery.includes("pasta")) {
            return MOCK_BUSINESSES.filter(b => b.tags.some(t => t.toLowerCase().includes("italian")))
        }
        if (lowerQuery.includes("sushi") || lowerQuery.includes("japanese")) {
            return MOCK_BUSINESSES.filter(b => b.tags.some(t => t.toLowerCase().includes("japanese")))
        }
        if (lowerQuery.includes("cheap") || lowerQuery.includes("under")) {
            return MOCK_BUSINESSES.filter(b => b.price === "$")
        }

        // Default: return a mix if no specific match
        return MOCK_BUSINESSES
    },

    async analyzeIntent(text: string): Promise<{ intent: string, entities: any }> {
        await new Promise(resolve => setTimeout(resolve, 500))
        return {
            intent: "find_restaurant",
            entities: { query: text }
        }
    }
}
