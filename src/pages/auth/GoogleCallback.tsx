import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { calendarService } from '@/services/calendarService'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export function GoogleCallback() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('Connecting to Google Calendar...')

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code')
            const state = searchParams.get('state')

            if (!code || !state) {
                setStatus('error')
                setMessage('Invalid callback parameters')
                return
            }

            try {
                const success = await calendarService.handleCallback(code, state)

                if (success) {
                    setStatus('success')
                    setMessage('Successfully connected to Google Calendar!')

                    // Redirect back to poll results after 2 seconds
                    setTimeout(() => {
                        const returnUrl = sessionStorage.getItem('calendar_return_url') || '/'
                        sessionStorage.removeItem('calendar_return_url')
                        navigate(returnUrl)
                    }, 2000)
                } else {
                    setStatus('error')
                    setMessage('Failed to connect to Google Calendar')
                }
            } catch (error) {
                setStatus('error')
                setMessage('An error occurred during authentication')
                console.error(error)
            }
        }

        handleCallback()
    }, [searchParams, navigate])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Connecting...
                        </h2>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="h-16 w-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Success!
                        </h2>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="h-16 w-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Error
                        </h2>
                    </>
                )}

                <p className="text-gray-600">{message}</p>

                {status === 'error' && (
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                        Go Back
                    </button>
                )}
            </div>
        </div>
    )
}
