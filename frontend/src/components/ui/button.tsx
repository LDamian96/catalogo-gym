import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 ease-v0 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border border-black/[0.08] dark:border-white/[0.08] bg-transparent text-neutral-700 dark:text-neutral-200 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-500/40 dark:hover:border-red-500/40",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost:
          "text-neutral-700 dark:text-neutral-200 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400",
        link:
          "text-red-600 dark:text-red-400 underline-offset-4 hover:underline",
        // V0 Style Variants - Cyan/Blue
        "v0-primary":
          "bg-white dark:bg-white text-black hover:bg-neutral-100 dark:hover:bg-neutral-100 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-[0.98]",
        "v0-secondary":
          "bg-transparent text-neutral-800 dark:text-white border border-black/[0.08] dark:border-white/[0.1] hover:border-red-500/50 hover:bg-red-500/5 dark:hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]",
        "v0-ghost":
          "bg-transparent text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-red-500/5 dark:hover:bg-red-500/10",
        "v0-gradient":
          "bg-gradient-to-r from-red-500 via-sky-500 to-orange-500 text-white hover:from-red-600 hover:via-sky-600 hover:to-orange-600 hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] active:scale-[0.98]",
        "v0-outline-gradient":
          "relative bg-transparent text-neutral-800 dark:text-white overflow-hidden before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-r before:from-red-500 before:via-sky-500 before:to-orange-500 before:-z-10 hover:before:opacity-100 before:opacity-60 before:transition-opacity hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]",
        "v0-soft":
          "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/25 border border-red-200/50 dark:border-red-500/20",
        "v0-soft-orange":
          "bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-500/25 border border-orange-200/50 dark:border-orange-500/20",
        "v0-glass":
          "bg-white/10 dark:bg-white/5 backdrop-blur-xl text-neutral-800 dark:text-white border border-white/20 dark:border-white/[0.08] hover:bg-white/20 dark:hover:bg-white/10 hover:border-red-500/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        xl: "h-12 rounded-lg px-10 text-base font-semibold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
