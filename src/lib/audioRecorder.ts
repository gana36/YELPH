/**
 * Audio Recording Utility
 * Uses Web Audio API and MediaRecorder for browser-based voice recording
 */

export class AudioRecorder {
    private mediaRecorder: MediaRecorder | null = null
    private audioChunks: Blob[] = []
    private stream: MediaStream | null = null

    /**
     * Check if browser supports audio recording
     */
    static isSupported(): boolean {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    }

    /**
     * Request microphone permission and start recording
     */
    async startRecording(): Promise<void> {
        try {
            // Request microphone access
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000, // Good for speech recognition
                }
            })

            // Create MediaRecorder
            const mimeType = this.getSupportedMimeType()
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType,
                audioBitsPerSecond: 128000 // 128 kbps
            })

            // Clear previous chunks
            this.audioChunks = []

            // Collect audio data
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data)
                }
            }

            // Start recording
            this.mediaRecorder.start(100) // Collect data every 100ms

        } catch (error) {
            console.error('Error starting recording:', error)
            throw new Error('Failed to access microphone. Please grant permission.')
        }
    }

    /**
     * Stop recording and return audio file
     */
    async stopRecording(): Promise<File> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject(new Error('No active recording'))
                return
            }

            this.mediaRecorder.onstop = () => {
                // Create blob from chunks
                const mimeType = this.mediaRecorder?.mimeType || 'audio/webm'
                const audioBlob = new Blob(this.audioChunks, { type: mimeType })

                // Convert to File
                const extension = this.getFileExtension(mimeType)
                const audioFile = new File(
                    [audioBlob],
                    `recording-${Date.now()}.${extension}`,
                    { type: mimeType }
                )

                // Cleanup
                this.cleanup()

                resolve(audioFile)
            }

            this.mediaRecorder.onerror = (error) => {
                this.cleanup()
                reject(error)
            }

            // Stop recording
            this.mediaRecorder.stop()
        })
    }

    /**
     * Cancel recording without returning file
     */
    cancelRecording(): void {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop()
        }
        this.cleanup()
    }

    /**
     * Check if currently recording
     */
    isRecording(): boolean {
        return this.mediaRecorder?.state === 'recording'
    }

    /**
     * Get supported MIME type for audio recording
     */
    private getSupportedMimeType(): string {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/ogg',
            'audio/mp4',
            'audio/wav'
        ]

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type
            }
        }

        return 'audio/webm' // fallback
    }

    /**
     * Get file extension from MIME type
     */
    private getFileExtension(mimeType: string): string {
        if (mimeType.includes('webm')) return 'webm'
        if (mimeType.includes('ogg')) return 'ogg'
        if (mimeType.includes('mp4')) return 'mp4'
        if (mimeType.includes('wav')) return 'wav'
        return 'webm'
    }

    /**
     * Cleanup resources
     */
    private cleanup(): void {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop())
            this.stream = null
        }
        this.audioChunks = []
        this.mediaRecorder = null
    }

    /**
     * Get recording duration in milliseconds
     */
    getRecordingDuration(): number {
        if (!this.mediaRecorder) return 0

        // Approximate based on chunks collected
        const chunkSize = this.audioChunks.reduce((total, chunk) => total + chunk.size, 0)
        const bitrate = 128000 / 8 // Convert bits to bytes
        return (chunkSize / bitrate) * 1000 // Convert to ms
    }
}

/**
 * Hook-style API for React components
 */
export const useAudioRecorder = () => {
    let recorder: AudioRecorder | null = null

    const startRecording = async () => {
        if (!AudioRecorder.isSupported()) {
            throw new Error('Audio recording not supported in this browser')
        }

        recorder = new AudioRecorder()
        await recorder.startRecording()
        return recorder
    }

    const stopRecording = async (): Promise<File> => {
        if (!recorder) {
            throw new Error('No active recording')
        }
        const file = await recorder.stopRecording()
        recorder = null
        return file
    }

    const cancelRecording = () => {
        if (recorder) {
            recorder.cancelRecording()
            recorder = null
        }
    }

    const isRecording = (): boolean => {
        return recorder?.isRecording() ?? false
    }

    return {
        startRecording,
        stopRecording,
        cancelRecording,
        isRecording,
        isSupported: AudioRecorder.isSupported()
    }
}
