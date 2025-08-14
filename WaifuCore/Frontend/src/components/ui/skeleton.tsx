// Simple className utility function`nconst cn = (...classes: (string | undefined | null | boolean)[]): string => {`n  return classes.filter(Boolean).join(`' ``').trim();`n}

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
