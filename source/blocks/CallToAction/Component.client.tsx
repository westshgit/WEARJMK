'use client'
import { easeOut, type Variants } from 'motion/react'

import { motion } from 'motion/react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { RiAddBoxLine, RiWhatsappFill } from '@remixicon/react'
import { SubscribeForm } from './SubscribeForm'

import type { CallToActionBlock as CTABlockProps, User } from '@/payload-types'

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const item = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: easeOut,
    },
  },
} satisfies Variants

export function CallToActionBlockClient({ heading, subheading, email, whatsapp, user, className }: CTABlockProps & { className?: string; user: User | null }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={`bg-background md:border md:shadow-sm dark:md:shadow-2xl px-6 py-32 md:py-40 space-y-9 ${className ?? ''}`}
    >
      <motion.div variants={item} className="text-center space-y-6">
        <h4 className="mx-auto max-w-xl text-3xl md:text-5xl">{heading}</h4>

        <p className="text-foreground/50 text-lg">{subheading}</p>
      </motion.div>

      <motion.div variants={container} className="mx-auto grid w-full max-w-xl grid-cols-1 gap-3 md:grid-cols-2">
        {user ? (
          <motion.div variants={item}>
            <Button className="w-full" variant="outline">
              Subscribe to our Email List
            </Button>
          </motion.div>
        ) : (
          <motion.div variants={item}>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <RiAddBoxLine />
                  {email.emailHeading}
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{email.emailHeading}</DialogTitle>

                  <DialogDescription>{email.emailSubheading}</DialogDescription>
                </DialogHeader>

                <SubscribeForm />
              </DialogContent>
            </Dialog>
          </motion.div>
        )}

        {whatsapp?.links?.map(({ link: { url, label }, id }) => {
          if (!url || !label) return null

          return (
            <motion.div key={id} variants={item}>
              <Link href={url} target="_blank" className="block">
                <Button className="w-full" variant="outline">
                  <RiWhatsappFill />
                  {label}
                </Button>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
