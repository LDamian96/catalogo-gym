import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border border-black/[0.06] dark:border-white/[0.06] bg-transparent text-neutral-700 dark:text-neutral-200 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:border-violet-500/30 dark:hover:border-violet-500/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost:
          "text-neutral-700 dark:text-neutral-200 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400",
        link:
          "text-violet-600 dark:text-violet-400 underline-offset-4 hover:underline",
        // V0 Soft Style Variants - Violet/Purple/Pink
        "v0-primary":
          "bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:from-violet-600 hover:to-pink-600 hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] active:scale-[0.98]",
        "v0-secondary":
          "bg-transparent text-white border border-white/[0.1] hover:border-violet-500/50 hover:bg-violet-500/10 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
        "v0-ghost":
          "bg-transparent text-white/70 hover:text-white hover:bg-violet-500/10",
        "v0-gradient":
          "bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] active:scale-[0.98]",
        "v0-outline-gradient":
          "relative bg-transparent text-white overflow-hidden before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-gradient-to-r before:from-violet-500 before:via-purple-500 before:to-pink-500 before:-z-10 hover:before:opacity-100 before:opacity-60 before:transition-opacity hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]",
        "v0-soft":
          "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-500/30 border border-violet-200/50 dark:border-violet-500/30",
        "v0-soft-pink":
          "bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-500/30 border border-pink-200/50 dark:border-pink-500/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
        xl: "h-12 rounded-xl px-10 text-base font-semibold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-lg",
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
