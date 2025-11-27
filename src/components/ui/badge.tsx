import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-primary text-white hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-white hover:bg-secondary/80",
        destructive: "border-transparent bg-error text-white hover:bg-error/80",
        outline: "text-foreground",
        success: "border-transparent bg-emerald-500 text-white",
        warning: "border-transparent bg-amber-500 text-white",
    }

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}

export { Badge }
