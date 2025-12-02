// Yelp AI Service with FastAPI Backend Integration

export interface Coordinates {
    latitude: number
    longitude: number
}

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
    coordinates?: Coordinates
    location?: {
        address1?: string
        city?: string
        state?: string
        zip_code?: string
        country?: string
        display_address?: string[]
    }
    phone?: string
    url?: string
}

interface UserContext {
    locale?: string
    latitude?: number
    longitude?: number
}

interface ChatRequest {
    query: string
    user_context?: UserContext
    chat_id?: string
}

interface ChatResponse {
    response_text: string
    chat_id?: string
    businesses: Business[]
    types?: string[]
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export const yelpAiService = {
    /**
     * Search for businesses using Yelp AI
     * @param query - Natural language search query
     * @param latitude - Optional user latitude
     * @param longitude - Optional user longitude
     * @returns Array of businesses
     */
    async search(
        query: string,
        latitude?: number,
        longitude?: number
    ): Promise<Business[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/yelp/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    latitude,
                    longitude,
                    locale: 'en_US'
                })
            })

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
                throw new Error(error.detail || `API error: ${response.status}`)
            }

            const businesses: Business[] = await response.json()
            return businesses
        } catch (error) {
            console.error('Error searching businesses:', error)
            throw error
        }
    },

    /**
     * Chat with Yelp AI (supports multi-turn conversations)
     * @param query - Natural language query
     * @param userContext - Optional user context with location
     * @param chatId - Optional chat ID for conversation continuity
     * @returns Chat response with AI text and businesses
     */
    async chat(
        query: string,
        userContext?: UserContext,
        chatId?: string
    ): Promise<ChatResponse> {
        try {
            const requestBody: ChatRequest = {
                query,
                user_context: userContext,
                chat_id: chatId
            }

            const response = await fetch(`${API_BASE_URL}/api/yelp/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            })

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
                throw new Error(error.detail || `API error: ${response.status}`)
            }

            const chatResponse: ChatResponse = await response.json()
            return chatResponse
        } catch (error) {
            console.error('Error chatting with Yelp AI:', error)
            throw error
        }
    },

    /**
     * Analyze intent of text (for backward compatibility)
     * @param text - Text to analyze
     * @returns Intent and entities
     */
    async analyzeIntent(text: string): Promise<{ intent: string, entities: any }> {
        // Simple client-side intent analysis
        return {
            intent: "find_restaurant",
            entities: { query: text }
        }
    },

    /**
     * Get user's geolocation
     * @returns Promise with latitude and longitude
     */
    async getUserLocation(): Promise<{ latitude: number, longitude: number } | null> {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                console.warn('Geolocation is not supported by this browser.')
                resolve(null)
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    })
                },
                (error) => {
                    console.warn('Error getting location:', error.message)
                    resolve(null)
                }
            )
        })
    },

    /**
     * Process audio file and extract search intent
     * @param audioFile - Audio file to process
     * @returns Analysis with transcription and search query
     */
    async processAudio(audioFile: File): Promise<any> {
        try {
            // Convert audio file to base64
            const base64Audio = await this.fileToBase64(audioFile)

            const response = await fetch(`${API_BASE_URL}/api/gemini/process-audio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    audio_base64: base64Audio,
                    mime_type: audioFile.type || 'audio/mp3'
                })
            })

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
                throw new Error(error.detail || `API error: ${response.status}`)
            }

            const result = await response.json()
            return result
        } catch (error) {
            console.error('Error processing audio:', error)
            throw error
        }
    },

    /**
     * Process image file and extract food/restaurant information
     * @param imageFile - Image file to process
     * @returns Analysis with identified food items and search suggestions
     */
    async processImage(imageFile: File): Promise<any> {
        try {
            // Convert image file to base64
            const base64Image = await this.fileToBase64(imageFile)

            const response = await fetch(`${API_BASE_URL}/api/gemini/process-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_base64: base64Image,
                    mime_type: imageFile.type || 'image/jpeg'
                })
            })

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
                throw new Error(error.detail || `API error: ${response.status}`)
            }

            const result = await response.json()
            return result
        } catch (error) {
            console.error('Error processing image:', error)
            throw error
        }
    },

    /**
     * Multimodal search combining text, audio, and/or image
     * @param options - Search options with text/audio/image
     * @returns Combined analysis and business results
     */
    async multimodalSearch(options: {
        textQuery?: string
        audioFile?: File
        imageFile?: File
        latitude?: number
        longitude?: number
    }): Promise<any> {
        try {
            const body: any = {
                text_query: options.textQuery,
                latitude: options.latitude,
                longitude: options.longitude,
                locale: 'en_US'
            }

            // Convert audio to base64 if provided
            if (options.audioFile) {
                body.audio_base64 = await this.fileToBase64(options.audioFile)
                body.audio_mime_type = options.audioFile.type || 'audio/mp3'
            }

            // Convert image to base64 if provided
            if (options.imageFile) {
                body.image_base64 = await this.fileToBase64(options.imageFile)
                body.image_mime_type = options.imageFile.type || 'image/jpeg'
            }

            const response = await fetch(`${API_BASE_URL}/api/gemini/multimodal-search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            })

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
                throw new Error(error.detail || `API error: ${response.status}`)
            }

            const result = await response.json()
            return result
        } catch (error) {
            console.error('Error in multimodal search:', error)
            throw error
        }
    },

    /**
     * Simple audio transcription
     * @param audioFile - Audio file to transcribe
     * @returns Transcribed text
     */
    async transcribeAudio(audioFile: File): Promise<string> {
        try {
            const base64Audio = await this.fileToBase64(audioFile)

            const response = await fetch(`${API_BASE_URL}/api/gemini/transcribe-audio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    audio_base64: base64Audio,
                    mime_type: audioFile.type || 'audio/mp3'
                })
            })

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
                throw new Error(error.detail || `API error: ${response.status}`)
            }

            const result = await response.json()
            return result.transcription
        } catch (error) {
            console.error('Error transcribing audio:', error)
            throw error
        }
    },

    /**
     * Helper function to convert File to base64
     * @param file - File to convert
     * @returns Base64 encoded string (without data:mime prefix)
     */
    async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
                const result = reader.result as string
                // Remove the data:mime;base64, prefix
                const base64 = result.split(',')[1]
                resolve(base64)
            }
            reader.onerror = error => reject(error)
        })
    }
}
