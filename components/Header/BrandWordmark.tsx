export function BrandWordmark() {
  return (
    <span aria-hidden="true" className="inline-flex items-end gap-2 text-foreground">
      <span className="flex flex-col items-center leading-none">
        <span className="text-xs font-mono font-black uppercase tracking-[0.5em] text-muted-foreground transition-colors duration-300 group-hover/brand:text-foreground">
          Wear
        </span>
        <span className="font-brand text-2xl font-black uppercase leading-[0.82] tracking-[0.08em]">JMK</span>
      </span>
      <span className="mb-0.5 h-8 w-px origin-bottom scale-y-75 bg-primary transition-transform duration-300 group-hover/brand:scale-y-100" />
      <span className="mb-0.5 size-1.5 rounded-full bg-primary transition-transform duration-300 group-hover/brand:scale-125" />
    </span>
  )
}
