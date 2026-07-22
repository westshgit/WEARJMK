'use client'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

// Easing shared with the Header dropdowns for a consistent motion feel.
const ease = [0.16, 1, 0.3, 1] as const

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease } },
}

/**
 * Persistent wrapper that animates its children in/out on route change.
 *
 * Lives in the layout (which does not remount) so AnimatePresence retains the
 * previous page long enough to play its exit animation before mounting the next.
 * Keyed on `usePathname()` so each route is treated as a distinct subtree.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={pathname}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  )
}
