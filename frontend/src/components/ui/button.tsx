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
          "border border-black/[0.08] dark:border-white/[0.08] bg-transparent text-neutral-700 dark:text-neutral-200 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:border-cyan-500/40 dark:hover:border-cyan-500/40",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost:
          "text-neutral-700 dark:text-neutral-200 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400",
        link:
          "text-cyan-600 dark:text-cyan-400 underline-offset-4 hover:underline",
        // V0 Style Variants - Cyan/Blue
        "v0-primary":
          "bg-white dark:bg-white text-black hover:bg-neutral-100 dark:hover:bg-neutral-100 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-[0.98]",
        "v0-secondary":
          "bg-transparent text-neutral-800 dark:text-white border border-black/[0.08] dark:border-white/[0.1] hover:border-cyan-500/50 hover:bg-cyan-500/5 dark:hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]",
        "v0-ghost":
          "bg-transparent text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white hover:bg-cyan-500/5 dark:hover:bg-cyan-500/10",
        "v0-gradient":
          "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 text-white hover:from-cyan-600 hover:via-sky-600 hover:to-blue-600 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] active:scale-[0.98]",
        "v0-outline-gradient":
          "relative bg-transparent text-neutral-800 dark:text-white overflow-hidden before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-r before:from-cyan-500 before:via-sky-500 before:to-blue-500 before:-z-10 hover:before:opacity-100 before:opacity-60 before:transition-opacity hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]",
        "v0-soft":
          "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-500/25 border border-cyan-200/50 dark:border-cyan-500/20",
        "v0-soft-blue":
          "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-500/25 border border-blue-200/50 dark:border-blue-500/20",
        "v0-glass":
          "bg-white/10 dark:bg-white/5 backdrop-blur-xl text-neutral-800 dark:text-white border border-white/20 dark:border-white/[0.08] hover:bg-white/20 dark:hover:bg-white/10 hover:border-cyan-500/30",
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
