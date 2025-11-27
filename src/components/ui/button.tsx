import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Note: I'm not using class-variance-authority yet as I haven't installed it.
// I will implement a simpler version or install it.
// Actually, for a robust design system, cva is great.
// I'll implement it with standard props for now to avoid extra deps if not needed,
// but cva is standard in shadcn-like systems which this resembles.
// I'll use standard switch/map for now to keep it simple without cva dependency if I didn't install it.
// Wait, I didn't install cva. I'll stick to simple props.

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            primary: "bg-primary text-white hover:bg-primary-dark",
            secondary: "bg-secondary text-white hover:bg-secondary/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            ghost: "hover:bg-gray-100 hover:text-gray-900",
            destructive: "bg-error text-white hover:bg-error/90",
        }

        const sizes = {
            sm: "h-9 rounded-md px-3",
            md: "h-10 px-4 py-2",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        }

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
