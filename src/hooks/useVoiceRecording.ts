import { useState, useRef, useCallback } from 'react'
import { AudioRecorder } from '@/lib/audioRecorder'

export interface UseVoiceRecordingReturn {
    isRecording: boolean
    isProcesing: boolean
    recordingDuration: number
    error: string | null
    startRecording: () => Promise<void>
    stopRecording: () => Promise<File | null>
    cancelRecording: () => void
    isSupported: boolean
}

/**
 * React hook for voice recording
 */
export const useVoiceRecording = (): UseVoiceRecordingReturn => {
    const [isRecording, setIsRecording] = useState(false)
    const [isProcesing, setIsProcessing] = useState(false)
    const [recordingDuration, setRecordingDuration] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const recorderRef = useRef<AudioRecorder | null>(null)
    const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

    /**
     * Start recording
     */
    const startRecording = useCallback(async () => {
        try {
            setError(null)
            setRecordingDuration(0)

            // Create and start recorder
            const recorder = new AudioRecorder()
            await recorder.startRecording()

            recorderRef.current = recorder
            setIsRecording(true)

            // Update duration every 100ms
            const startTime = Date.now()
            durationIntervalRef.current = setInterval(() => {
                const duration = Date.now() - startTime
                setRecordingDuration(duration)
            }, 100)

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start recording'
            setError(errorMessage)
            console.error('Recording error:', err)
        }
    }, [])

    /**
     * Stop recording and return audio file
     */
    const stopRecording = useCallback(async (): Promise<File | null> => {
        if (!recorderRef.current) {
            setError('No active recording')
            return null
        }

        try {
            setIsProcessing(true)

            // Stop interval
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current)
                durationIntervalRef.current = null
            }

            // Stop recording
            const audioFile = await recorderRef.current.stopRecording()

            recorderRef.current = null
            setIsRecording(false)
            setIsProcessing(false)

            return audioFile

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording'
            setError(errorMessage)
            setIsRecording(false)
            setIsProcessing(false)
            console.error('Stop recording error:', err)
            return null
        }
    }, [])

    /**
     * Cancel recording
     */
    const cancelRecording = useCallback(() => {
        if (recorderRef.current) {
            recorderRef.current.cancelRecording()
            recorderRef.current = null
        }

        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current)
            durationIntervalRef.current = null
        }

        setIsRecording(false)
        setIsProcessing(false)
        setRecordingDuration(0)
    }, [])

    return {
        isRecording,
        isProcesing,
        recordingDuration,
        error,
        startRecording,
        stopRecording,
        cancelRecording,
        isSupported: AudioRecorder.isSupported()
    }
}

/**
 * Format duration in mm:ss format
 */
export const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
