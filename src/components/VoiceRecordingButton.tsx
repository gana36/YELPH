import { useState } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { useVoiceRecording, formatDuration } from '@/hooks/useVoiceRecording'
import { yelpAiService } from '@/services/yelpAi'

interface VoiceRecordingButtonProps {
    onTranscription?: (transcription: string) => void
    onSearchQuery?: (query: string) => void
    onError?: (error: string) => void
    className?: string
}

export const VoiceRecordingButton = ({
    onTranscription,
    onSearchQuery,
    onError,
    className = ''
}: VoiceRecordingButtonProps) => {
    const {
        isRecording,
        isProcesing,
        recordingDuration,
        error: recordingError,
        startRecording,
        stopRecording,
        cancelRecording,
        isSupported
    } = useVoiceRecording()

    const [isAnalyzing, setIsAnalyzing] = useState(false)

    /**
     * Handle recording button click
     */
    const handleClick = async () => {
        if (isRecording) {
            // Stop recording and process
            await handleStopRecording()
        } else {
            // Start recording
            await startRecording()
        }
    }

    /**
     * Stop recording and process with Gemini
     */
    const handleStopRecording = async () => {
        try {
            const audioFile = await stopRecording()
            if (!audioFile) return

            setIsAnalyzing(true)

            // Process with Gemini
            const result = await yelpAiService.processAudio(audioFile)
            const analysis = JSON.parse(result.result)

            // Callback with transcription
            if (onTranscription && analysis.transcription) {
                onTranscription(analysis.transcription)
            }

            // Callback with search query
            if (onSearchQuery && analysis.search_query) {
                onSearchQuery(analysis.search_query)
            }

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to process audio'
            console.error('Voice processing error:', err)
            if (onError) {
                onError(errorMsg)
            }
        } finally {
            setIsAnalyzing(false)
        }
    }

    /**
     * Handle cancel (on escape key, etc.)
     */
    const handleCancel = () => {
        cancelRecording()
    }

    if (!isSupported) {
        return (
            <div className="text-sm text-gray-500">
                Voice recording not supported in this browser
            </div>
        )
    }

    if (recordingError) {
        return (
            <div className="text-sm text-red-500">
                {recordingError}
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handleClick}
                disabled={isProcesing || isAnalyzing}
                className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full
                    transition-all duration-200
                    ${isRecording
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-primary-600 hover:bg-primary-700'
                    }
                    ${(isProcesing || isAnalyzing) ? 'opacity-50 cursor-not-allowed' : ''}
                    text-white shadow-lg hover:shadow-xl
                    ${className}
                `}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
                {isProcesing || isAnalyzing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : isRecording ? (
                    <Square className="w-5 h-5" />
                ) : (
                    <Mic className="w-5 h-5" />
                )}

                {/* Recording indicator ring */}
                {isRecording && (
                    <span className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
                )}
            </button>

            {/* Recording duration */}
            {isRecording && (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-mono text-gray-700">
                        {formatDuration(recordingDuration)}
                    </span>
                    <button
                        onClick={handleCancel}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Processing state */}
            {isAnalyzing && (
                <span className="text-sm text-gray-600">
                    Analyzing...
                </span>
            )}
        </div>
    )
}
