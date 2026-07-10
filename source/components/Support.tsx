'use client'

import { Badge } from '@/components/ui/badge'
import { MailIcon, MessageCircle } from 'lucide-react'
import { motion } from 'motion/react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { RiWhatsappFill } from '@remixicon/react'

type Support = {
  email: string
  showLabel?: boolean
  mode: 'error' | 'warm'
  whatsapp: string
}

type ComposeMessageOptions = {
  mode: 'error' | 'warm'
  email?: string
  whatsapp: string
}

type ComposeMessageResult = {
  heading: string
  description: string
  emailHref?: string
  whatsappHref?: string
}

const messages = {
  error: {
    heading: 'Need help from our team?',
    description: "We're here to help. Reach out and we'll do our best to get things sorted as quickly as possible.",

    email: {
      subject: 'WearJMK Support Request',
      body: [
        'Hello WearJMK Team,',
        '',
        'I need assistance with an issue I encountered.',
        '',
        'What I was trying to do:',
        'What happened instead:',
        'Order Number (if applicable):',
        'Additional Details:',
        '',
        'Thank you for your time and support.',
        '',
        'Kind regards,',
      ].join('\n'),
    },

    whatsapp: [
      'Hello WearJMK Support 👋',
      '',
      'I need help with an issue.',
      '',
      'What I was trying to do:',
      'What happened:',
      'Order Number (if applicable):',
    ].join('\n'),
  },

  warm: {
    heading: "Say Hello — We'd Love to Hear From You",
    description: "Have a question, need styling advice, or just want to say hello? We're always happy to hear from you.",
    email: {
      subject: 'Hello WearJMK',
      body: [
        'Hello WearJMK Team,',
        '',
        "I hope you're doing well!",
        '',
        "I'd love to get in touch.",
        '',
        'My message:',
        '',
        '',
        'Looking forward to hearing from you.',
        '',
        'Best regards,',
      ].join('\n'),
    },

    whatsapp: ['Hi WearJMK! 👋', '', "I'd love to get in touch.", '', 'My message:'].join('\n'),
  },
} as const

export function Support({ email, showLabel = false, whatsapp, mode }: Support) {
  const hasEmail = Boolean(email)
  const hasWhatsapp = Boolean(whatsapp)
  const { heading, description, emailHref, whatsappHref } = composeMessage({
    mode,
    email,
    whatsapp,
  })

  return (
    <Popover>
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <Button aria-label="Contact support" size="icon" type="button" variant="outline" className="cursor-pointer border-primary w-fit gap-2 px-2">
              {showLabel && 'Message Us'}
              <MessageCircle className="size-4" />
            </Button>
          </TooltipTrigger>
        </PopoverTrigger>

        <TooltipContent side="top">
          <span>Contact support</span>
        </TooltipContent>
      </Tooltip>

      <PopoverContent align="end" className="max-w-sm w-full pt-2 pb-8 max-md:rounded-none!" sideOffset={10}>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 rounded-3xl py-2"
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <PopoverHeader className="gap-3">
            <div className="space-y-1">
              <PopoverTitle>
                <h6 className="text-lg">{heading}</h6>
              </PopoverTitle>
              <PopoverDescription>{description}</PopoverDescription>
              {!hasEmail ? <p className="text-sm text-destructive">Support email is currently unavailable. Please try again shortly.</p> : null}
              {!hasWhatsapp ? <p className="text-sm text-destructive">WhatsApp support is currently unavailable. Please try again shortly.</p> : null}
            </div>
          </PopoverHeader>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <a
                aria-disabled={!hasEmail}
                className={!hasEmail ? 'pointer-events-none opacity-50' : undefined}
                href={hasEmail ? emailHref : undefined}
                onClick={(event) => {
                  if (!hasEmail) event.preventDefault()
                }}
              >
                <MailIcon className="size-3.5" />
                Send us an Email
              </a>
            </Button>
            <div className="relative">
              <span className="absolute -bottom-5">
                <Badge variant={'outline'}>Recommended · Fast reply</Badge>
              </span>
              <Button asChild variant="outline">
                <a
                  aria-disabled={!hasWhatsapp}
                  className={!hasWhatsapp ? 'pointer-events-none opacity-50' : undefined}
                  href={hasWhatsapp ? whatsappHref : undefined}
                  onClick={(event) => {
                    if (!hasWhatsapp) event.preventDefault()
                  }}
                  rel="noreferrer"
                  target="_blank"
                >
                  <RiWhatsappFill className="size-3.5 text-green-500" />
                  Whatsapp
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  )
}

function createMailtoHref(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function createWhatsAppHref(number: string, message: string) {
  const normalized = number.replace(/[^\d+]/g, '').replace(/^\+/, '')

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

function composeMessage({ mode, email, whatsapp }: ComposeMessageOptions): ComposeMessageResult {
  const config = messages[mode]

  return {
    heading: config.heading,
    description: config.description,
    emailHref: email ? createMailtoHref(email, config.email.subject, config.email.body) : undefined,
    whatsappHref: whatsapp ? createWhatsAppHref(whatsapp, config.whatsapp) : undefined,
  }
}
