'use client'
import { useRef } from 'react'
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function PageClient() {
  return (
    <div className="space-y-16">
      <div className="size-full min-h-[calc(100vh-180px)] flex flex-col gap-6">
        <div className="flex-1" />
        <ScrollTrack>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 size-32 rounded-2xl bg-black" />
          ))}
        </ScrollTrack>
      </div>

      <CardSlide header="Adire Wears" />
      <CardSlide header="Ready to Wear" />
    </div>
  )
}

function CardSlide({ header }: { header: string }) {
  return (
    <div className="space-y-6 p-4">
      <h2 className="text-3xl font-medium">{header}</h2>
      <ScrollTrack>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="shrink-0 w-72 h-96 rounded-2xl bg-black" />
        ))}
      </ScrollTrack>
    </div>
  )
}

function ScrollTrack({ children, className }: { children: React.ReactNode; className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!trackRef.current) return
    const amount = trackRef.current.clientWidth * 0.75
    trackRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative group">
      {/* Prev button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => scroll('left')}
        className={cn(
          'absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        )}
        aria-label="Scroll left"
      >
        <RiArrowLeftSLine className="size-5" />
      </Button>

      {/* Track */}
      <div
        ref={trackRef}
        className={cn(
          'flex gap-4 p-4 overflow-x-auto scroll-smooth',
          '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
          className,
        )}
      >
        {children}
      </div>

      {/* Next button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => scroll('right')}
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        )}
        aria-label="Scroll right"
      >
        <RiArrowRightSLine className="size-5" />
      </Button>
    </div>
  )
}
