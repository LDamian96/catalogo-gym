import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#12121a] px-4 py-3 text-sm transition-all duration-300 ease-out",
        "text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
        "focus-visible:outline-none focus-visible:border-cyan-500/50 dark:focus-visible:border-cyan-400/50",
        "focus-visible:shadow-[0_0_0_3px_rgba(34,211,238,0.1)] dark:focus-visible:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]",
        "hover:border-cyan-500/30 dark:hover:border-cyan-400/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
