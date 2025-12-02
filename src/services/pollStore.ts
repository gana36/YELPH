import { Business } from './yelpAi'

export interface Participant {
    name: string
    voted: boolean
    location?: {
        lat: number
        lng: number
    }
}

export interface Poll {
    id: string
    title: string
    type: 'restaurant' | 'trip' | 'activity' | 'service'
    status: 'active' | 'completed'
    createdAt: string
    owner: string // Name of the creator
    participants: Participant[]
    candidates: Business[]
    votes: Record<string, number> // businessId -> count
}

const INITIAL_POLLS: Poll[] = [
    {
        id: '1',
        title: 'Friday Night Dinner',
        type: 'restaurant',
        status: 'active',
        createdAt: new Date().toISOString(),
        owner: 'Alice',
        participants: [
            { name: 'Alice', voted: true },
            { name: 'Bob', voted: true },
            { name: 'Charlie', voted: false },
            { name: 'David', voted: false },
            { name: 'Eve', voted: false }
        ],
        candidates: [
            { id: "1", name: "Thai Palace", rating: 4.8, reviews: 234, price: "$$", distance: "2.3 mi", image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=400&q=80", votes: 3, tags: ["Thai", "Spicy"] },
            { id: "2", name: "Olive Garden", rating: 4.2, reviews: 1200, price: "$$", distance: "3.4 mi", image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80", votes: 2, tags: ["Italian", "Chain"] },
        ],
        votes: { "1": 3, "2": 2 }
    }
]

class PollStore {
    private polls: Poll[] = []

    constructor() {
        this.load()
    }

    private load() {
        const stored = localStorage.getItem('gc_polls')
        if (stored) {
            this.polls = JSON.parse(stored)
        } else {
            this.polls = INITIAL_POLLS
            this.save()
        }
    }

    private save() {
        localStorage.setItem('gc_polls', JSON.stringify(this.polls))
    }

    getPolls() {
        return this.polls
    }

    getPoll(id: string): Poll | undefined {
        const polls = this.getPolls()
        const poll = polls.find(p => p.id === id)

        // Patch for existing data without owner
        if (poll && !poll.owner) {
            poll.owner = 'Alice' // Default owner
            this.save()
        }

        return poll
    }

    createPoll(poll: Omit<Poll, 'id' | 'createdAt' | 'votes' | 'candidates'>) {
        const newPoll: Poll = {
            ...poll,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            votes: {},
            candidates: []
        }
        this.polls.push(newPoll)
        this.save()
        return newPoll
    }

    addCandidate(pollId: string, business: Business) {
        const poll = this.getPoll(pollId)
        if (!poll) return

        if (!poll.candidates.find(c => c.id === business.id)) {
            poll.candidates.push({ ...business, votes: 0 })
            this.save()
        }
    }

    vote(pollId: string, businessId: string, userName: string) {
        const poll = this.getPoll(pollId)
        if (!poll) return

        // Update participant status
        const participant = poll.participants.find(p => p.name === userName)
        if (participant) {
            if (participant.voted) return // Already voted
            participant.voted = true
        }

        if (!poll.votes[businessId]) poll.votes[businessId] = 0
        poll.votes[businessId]++

        // Update candidate vote count for UI convenience
        const candidate = poll.candidates.find(c => c.id === businessId)
        if (candidate) candidate.votes++

        this.save()
    }

    updateParticipantLocation(pollId: string, userName: string, location: { lat: number; lng: number }) {
        const poll = this.getPoll(pollId)
        if (!poll) return

        const participant = poll.participants.find(p => p.name === userName)
        if (participant) {
            participant.location = location
            this.save()
        }
    }

    getParticipantLocation(pollId: string, userName: string): { lat: number; lng: number } | undefined {
        const poll = this.getPoll(pollId)
        if (!poll) return undefined

        const participant = poll.participants.find(p => p.name === userName)
        return participant?.location
    }
}

export const pollStore = new PollStore()
