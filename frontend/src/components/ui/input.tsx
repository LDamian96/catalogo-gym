import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#0a0a0a] px-4 py-2 text-sm transition-all duration-300 ease-v0",
          "text-neutral-900 dark:text-white",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
          "focus-visible:outline-none focus-visible:border-red-500/50 dark:focus-visible:border-red-400/50",
          "focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.1)] dark:focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]",
          "hover:border-red-500/30 dark:hover:border-red-400/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
