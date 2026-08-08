import { cn } from "@/lib/utils"

export function PhoneFrame({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative w-full max-w-[280px] overflow-hidden rounded-[2rem] bg-foreground p-2 ring-1 ring-foreground/10",
        className
      )}
    >
      <div className="relative overflow-hidden rounded-[1.5rem]">
        <img src={src} alt={alt} className="block w-full" />
        <div className="absolute top-0 left-1/2 h-5 w-28 -translate-x-1/2 rounded-b-xl bg-foreground" />
      </div>
    </div>
  )
}
