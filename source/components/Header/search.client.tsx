'use client'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { RiCloseLine, RiFileListLine, RiSearchLine } from '@remixicon/react'
import { useForm } from '@tanstack/react-form'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

export function SearchToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <motion.button
      type="button"
      aria-label={open ? 'Close search' : 'Open search'}
      onClick={onToggle}
      whileTap={{ scale: 0.9 }}
      className="relative size-8 flex items-center justify-center rounded-xl text-foreground"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={open ? 'close' : 'search'}
          initial={{ opacity: 0, rotate: -45 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 45 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {open ? <RiCloseLine /> : <RiSearchLine />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

export function SearchInput({ autoFocus }: { autoFocus?: boolean }) {
  const results: unknown[] = []
  const [open, setOpen] = useState(false)

  const form = useForm({
    defaultValues: {
      query: '',
    },
  })

  return (
    <div className="w-full mb-2 md:mb-0">
      <Popover open={open} onOpenChange={setOpen}>
        <form.Field name="query">
          {(field) => (
            <>
              <PopoverAnchor asChild>
                <div className="w-full md:flex md:items-center md:justify-end">
                  <Input
                    autoFocus={autoFocus}
                    className="pl-3 pr-9 placeholder:text-xs placeholder:md:text-sm w-full md:max-w-sm xl:max-w-md!"
                    placeholder="Search products or track an order…"
                    aria-label="Search products or track an order"
                    value={field.state.value}
                    onChange={(e) => {
                      const val = e.currentTarget.value
                      field.handleChange(val)
                      setOpen(val.trim().length > 0)
                    }}
                    onFocus={() => {
                      if (field.state.value.trim().length > 0) setOpen(true)
                    }}
                  />
                </div>
              </PopoverAnchor>

              <AnimatePresence>
                {open && (
                  <PopoverContent forceMount asChild align="start" onOpenAutoFocus={(e) => e.preventDefault()} className="w-(--radix-popover-trigger-width)">
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="min-h-96 rounded-xl border bg-popover p-4 shadow-md"
                    >
                      <SearchResults results={results} />
                    </motion.div>
                  </PopoverContent>
                )}
              </AnimatePresence>
            </>
          )}
        </form.Field>
      </Popover>
    </div>
  )
}

function SearchResults({ results }: { results: unknown[] }) {
  if (results.length > 0) {
    return <div className="flex flex-col gap-2">{/* result items go here */}</div>
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <RiSearchLine className="size-8 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>
          <h1 className="text-xl md:text-3xl">Find anything, fast</h1>
        </EmptyTitle>
        <EmptyDescription>Search by product name, category, or paste your order number to get live tracking updates.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <RiSearchLine className="size-4 shrink-0" />
            <span>
              Try <span className="text-foreground font-medium">"oversized tee"</span> or <span className="text-foreground font-medium">"cargo pants"</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RiFileListLine className="size-4 shrink-0" />
            <span>
              Paste an order ID like <span className="text-foreground font-medium">#WJK-00412</span> to track it
            </span>
          </div>
        </div>
      </EmptyContent>
    </Empty>
  )
}
