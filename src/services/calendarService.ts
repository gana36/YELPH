/**
 * Google Calendar Integration Service
 * Handles OAuth flow and event creation
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

interface CalendarTokens {
    access_token: string
    refresh_token?: string
    expiry?: string
}

interface EventDetails {
    title: string
    location: string
    description: string
    start_time: string  // ISO 8601 format
    end_time: string    // ISO 8601 format
    timezone?: string
    attendees?: string[]
}

class CalendarService {
    private readonly STORAGE_KEY = 'google_calendar_tokens'

    /**
     * Check if user is authenticated with Google Calendar
     */
    isAuthenticated(): boolean {
        const tokens = this.getStoredTokens()
        return tokens !== null && !!tokens.access_token
    }

    /**
     * Get stored calendar tokens from localStorage
     */
    private getStoredTokens(): CalendarTokens | null {
        const stored = localStorage.getItem(this.STORAGE_KEY)
        if (!stored) return null
        try {
            return JSON.parse(stored)
        } catch {
            return null
        }
    }

    /**
     * Store calendar tokens in localStorage
     */
    private storeTokens(tokens: CalendarTokens): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokens))
    }

    /**
     * Clear stored tokens
     */
    clearTokens(): void {
        localStorage.removeItem(this.STORAGE_KEY)
    }

    /**
     * Start OAuth flow - redirects user to Google sign-in
     */
    async startAuth(userId: string): Promise<void> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/calendar/auth/start?user_id=${encodeURIComponent(userId)}`
            )

            if (!response.ok) {
                throw new Error('Failed to start calendar authentication')
            }

            const data = await response.json()

            // Store state for verification after redirect
            sessionStorage.setItem('calendar_auth_state', data.state)

            // Redirect to Google sign-in
            window.location.href = data.auth_url
        } catch (error) {
            console.error('Error starting calendar auth:', error)
            throw error
        }
    }

    /**
     * Handle OAuth callback - extract tokens from URL
     * Call this from your callback route component
     */
    async handleCallback(code: string, state: string): Promise<boolean> {
        try {
            // Verify state matches what we stored
            const storedState = sessionStorage.getItem('calendar_auth_state')
            if (state !== storedState) {
                throw new Error('Invalid state parameter - possible CSRF attack')
            }

            // Exchange code for tokens
            const response = await fetch(
                `${API_BASE_URL}/api/calendar/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
            )

            if (!response.ok) {
                throw new Error('Failed to complete calendar authentication')
            }

            const data = await response.json()

            // Store tokens
            this.storeTokens(data.tokens)

            // Clear state
            sessionStorage.removeItem('calendar_auth_state')

            return true
        } catch (error) {
            console.error('Error handling calendar callback:', error)
            return false
        }
    }

    /**
     * Create a calendar event
     */
    async createEvent(eventDetails: EventDetails): Promise<{ success: boolean; event_link?: string; error?: string }> {
        try {
            const tokens = this.getStoredTokens()

            if (!tokens) {
                throw new Error('Not authenticated. Please sign in with Google Calendar first.')
            }

            const response = await fetch(`${API_BASE_URL}/api/calendar/create-event`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    event_details: eventDetails
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || 'Failed to create calendar event')
            }

            const result = await response.json()

            return {
                success: true,
                event_link: result.event_link
            }
        } catch (error) {
            console.error('Error creating calendar event:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    /**
     * Create event for restaurant visit
     * Convenience method with sensible defaults
     */
    async createRestaurantEvent(
        restaurantName: string,
        address: string,
        directionsUrl: string,
        participants: string[],
        dateTime?: Date
    ): Promise<{ success: boolean; event_link?: string; error?: string }> {
        // Default to 7 PM tonight if no date provided
        const eventStart = dateTime || new Date()
        if (!dateTime) {
            eventStart.setHours(19, 0, 0, 0)
            // If it's already past 7 PM, schedule for tomorrow
            if (new Date() > eventStart) {
                eventStart.setDate(eventStart.getDate() + 1)
            }
        }

        // Event ends 2 hours after start
        const eventEnd = new Date(eventStart)
        eventEnd.setHours(eventEnd.getHours() + 2)

        const eventDetails: EventDetails = {
            title: `Dinner at ${restaurantName}`,
            location: address,
            description: `
🍽️ Group dinner at ${restaurantName}

📍 Location: ${address}

🗺️ Directions: ${directionsUrl}

👥 Attending: ${participants.join(', ')}

✨ Event created by Group Consensus
            `.trim(),
            start_time: eventStart.toISOString(),
            end_time: eventEnd.toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }

        return this.createEvent(eventDetails)
    }
}

export const calendarService = new CalendarService()
