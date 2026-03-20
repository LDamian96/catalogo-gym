import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neutral-200/60 dark:bg-white/[0.08]", className)}
      {...props}
    />
  )
}

export { Skeleton }
