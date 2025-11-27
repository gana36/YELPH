import { X } from "lucide-react"
import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Button } from "./button"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        document.addEventListener("keydown", handleEscape)
        return () => document.removeEventListener("keydown", handleEscape)
    }, [onClose])

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                ref={overlayRef}
                className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="p-0 overflow-y-auto max-h-[80vh]">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}
