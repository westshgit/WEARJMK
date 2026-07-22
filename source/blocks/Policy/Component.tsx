'use client'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import type { PolicyBlock as PolicyBlockProps } from '@/payload-types'
import { RotateCcw, ShieldCheck, Truck, RefreshCw, Clock, Package, CreditCard, MessageCircle, Info, CheckCircle, AlertCircle } from 'lucide-react'
import { AnimatePresence, motion, easeOut, type Variants } from 'motion/react'

import type { DefaultDocumentIDType } from 'payload'
import type React from 'react'

const iconMap: Record<string, React.ElementType> = {
  RotateCcw,
  ShieldCheck,
  Truck,
  RefreshCw,
  Clock,
  Package,
  CreditCard,
  MessageCircle,
  Info,
  CheckCircle,
  AlertCircle,
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut, staggerChildren: 0.12, delayChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    y: -24,
    transition: { duration: 0.3, ease: easeOut, staggerChildren: 0.05, staggerDirection: -1 },
  },
}

// Each policy item animates alongside its siblings (staggered by the parent).
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25, ease: easeOut } },
}

export const PolicyBlock: React.FC<
  PolicyBlockProps & {
    id?: DefaultDocumentIDType
  }
> = ({ policyTitle, policyDescription, policies }) => {
  if (!policies?.length) return null

  return (
    <AnimatePresence mode="wait">
      <motion.section key="policy-block" variants={sectionVariants} initial="hidden" animate="visible" exit="exit" className="space-y-9">
        <motion.div variants={itemVariants} className="header-description">
          <h2>{policyTitle}</h2>
          <p>{policyDescription}</p>
        </motion.div>
        <ul className="space-y-4">
          {policies.map(({ description, title, icon, id }, index) => {
            if (!icon) return null
            const Icon = iconMap[icon] || Info
            const variant = index % 2 === 0 ? 'outline' : 'default'

            return (
              <motion.li key={id} variants={itemVariants} className="list-none">
                <Item variant={variant} size="xs" className="max-w-xl">
                  <ItemMedia
                    variant="icon"
                    className="size-9 bg-muted text-muted-foreground border border-border transition-colors duration-300 group-hover:text-primary group-hover:border-primary"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 22% 100%, 0 78%)' }}
                  >
                    <Icon className="size-4" strokeWidth={1.5} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="uppercase font-mono font-medium text-base">{title}</ItemTitle>
                    <ItemDescription>{description}</ItemDescription>
                  </ItemContent>
                </Item>
              </motion.li>
            )
          })}
        </ul>
      </motion.section>
    </AnimatePresence>
  )
}
