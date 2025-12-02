/**
 * Google Maps Directions Integration
 * Provides utilities for generating directions URLs and opening native maps apps
 */

export interface DirectionsConfig {
  origin?: {
    latitude: number
    longitude: number
  }
  destination: {
    latitude: number
    longitude: number
    name?: string
    address?: string
  }
  travelMode?: 'driving' | 'walking' | 'bicycling' | 'transit'
}

/**
 * Generates a Google Maps directions URL
 * Opens in user's preferred maps app (Google Maps on Android, Apple Maps on iOS)
 */
export const getGoogleMapsDirectionsUrl = (config: DirectionsConfig): string => {
  const { origin, destination, travelMode = 'driving' } = config

  // Base URL for Google Maps Directions
  let url = 'https://www.google.com/maps/dir/?api=1'

  // Origin (user's location)
  if (origin) {
    url += `&origin=${origin.latitude},${origin.longitude}`
  } else {
    // If no origin, Google Maps will use device location
    url += '&origin=Current+Location'
  }

  // Destination (restaurant)
  const destCoords = `${destination.latitude},${destination.longitude}`
  url += `&destination=${encodeURIComponent(destCoords)}`

  // Destination name (optional but helpful for better UX)
  if (destination.name) {
    url += `&destination_place_id=${encodeURIComponent(destination.name)}`
  }

  // Travel mode
  url += `&travelmode=${travelMode}`

  return url
}

/**
 * Opens directions in a new window/tab
 */
export const openDirections = (config: DirectionsConfig): void => {
  const url = getGoogleMapsDirectionsUrl(config)
  window.open(url, '_blank')
}

/**
 * Opens directions with user's current location
 */
export const openDirectionsFromCurrentLocation = async (
  destination: {
    latitude: number
    longitude: number
    name?: string
  },
  travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          openDirections({
            origin: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            },
            destination,
            travelMode
          })
          resolve()
        },
        (error) => {
          console.warn('Geolocation error, falling back to device location:', error)
          // Fallback: open without origin (Google Maps will use device location)
          openDirections({
            destination,
            travelMode
          })
          resolve()
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
    } else {
      // Browser doesn't support geolocation, use fallback
      openDirections({
        destination,
        travelMode
      })
      resolve()
    }
  })
}

/**
 * Get directions URLs for multiple participants
 */
export const getDirectionsForParticipants = (
  participants: Array<{
    name: string
    location?: { lat: number; lng: number }
  }>,
  restaurantLocation: {
    latitude: number
    longitude: number
    name: string
  }
): Map<string, string> => {
  const directionsMap = new Map<string, string>()

  participants.forEach(participant => {
    const url = getGoogleMapsDirectionsUrl({
      origin: participant.location
        ? {
            latitude: participant.location.lat,
            longitude: participant.location.lng
          }
        : undefined,
      destination: restaurantLocation
    })
    directionsMap.set(participant.name, url)
  })

  return directionsMap
}
