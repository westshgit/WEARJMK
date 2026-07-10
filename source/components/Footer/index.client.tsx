'use client'

import type { Footer, Social } from '@/payload-types'

import { FooterMenu } from '@/components/Footer/menu'
import { SocialLink } from '@/components/SocialLink'
import { SITE_NAME, SUPPORT_EMAIL, SUPPORT_WHATSAPP } from '@/lib/client.env'
import { ThemeModeSelector } from '@/providers'
import { useAuth } from '@payloadcms/ui'
import { Clock, Map } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { ReactNode } from 'react'
import { Support } from '../Support'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../ui/empty'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

interface Props {
  navItems: NonNullable<Footer['navItems']>
  children: ReactNode
  locations: NonNullable<Footer['locations']>
  socialLinks: NonNullable<Social['socialLinks']>
}

export function FooterClient({ navItems, socialLinks, children, locations }: Props) {
  const { user } = useAuth()

  const now = new Date()
  const currentYear = now.getFullYear()
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '')

  return (
    <footer className="relative p-4 pb-10 pt-12 lg:pt-6 bg-background/5 border-t shadow-2xl border-t-secondary">
      <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }}>
        <div className="grid gap-28 xl:gap-36 xl:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(250px,550px)]">
          <motion.div variants={itemVariants} className="flex flex-2 flex-col gap-20 max-xl:order-2">
            <FooterMenu navItems={navItems} />

            <div className="flex-1">
              {locations?.length > 0 ? (
                <div className="space-y-7 xl:bg-secondary xl:p-6 lg:shadow">
                  <h4 className="text-3xl font-bold">Visit Us:</h4>

                  <div className="space-y-9 xl:space-y-0 xl:flex xl:items-center xl:justify-start xl:*:basis-full">
                    {locations.map(({ address, name, hours, id }) => {
                      if (!hours || !hours.some(({ open, close }) => open && close)) return null

                      return (
                        <div key={id} className="space-y-3">
                          <h3 className="text-lg">{name}</h3>
                          <div className="space-y-6">
                            <div className="*:text-sm *:text-foreground/80">
                              <p>
                                {address.address1}
                                {address.address2 && <>, {address.address2}</>}
                              </p>
                              <p>
                                {address.city}, {address.state} {address.postalCode}
                              </p>
                              <p>{address.country}</p>

                              <PhoneNumbers phoneNumbers={address.phoneNumbers} />
                            </div>

                            <div className="flex items-center">
                              <Link
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  `${address.address1} ${address.address2 || ''} ${address.city} ${address.state} ${address.postalCode} ${address.country}`,
                                )}`}
                                passHref
                              >
                                <Button variant={'default'}>
                                  <Map />
                                  View On Map
                                </Button>
                              </Link>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="default">
                                    <Clock className="h-4 w-4" />
                                    Store Hours
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Business hours for {name}</DialogTitle>
                                    <DialogDescription>{getTodayStatusMessage(hours as DayHours[])}</DialogDescription>
                                  </DialogHeader>

                                  <Table className="mt-2">
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Day</TableHead>
                                        <TableHead>Open</TableHead>
                                        <TableHead>Close</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {hours?.map(({ day, open, close, id }) => {
                                        return (
                                          <TableRow key={id}>
                                            <TableCell>{capitalizeFirst(day)}</TableCell>
                                            <TableCell>{open}</TableCell>
                                            <TableCell>{close}</TableCell>
                                          </TableRow>
                                        )
                                      })}
                                    </TableBody>
                                  </Table>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia>
                      <Map />
                    </EmptyMedia>
                    <EmptyTitle>No Location</EmptyTitle>
                    <EmptyDescription>We could not find your location. Please request for location to see the nearest locations.</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button>Request for location</Button>
                  </EmptyContent>
                </Empty>
              )}
            </div>

            <div className="space-y-6 lg:space-y-0">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <p className="text-xs text-foreground/80">
                  &copy; {copyrightDate} <span className="font-bold uppercase font-mono">{SITE_NAME}.</span> <span>All rights reserved.</span>
                </p>

                <div className="flex flex-col lg:items-end gap-2 md:flex-row md:items-center">
                  <ThemeModeSelector />
                  <Support email={SUPPORT_EMAIL} whatsapp={SUPPORT_WHATSAPP} showLabel mode="warm" />
                </div>
              </div>

              {socialLinks.length > 0 ? (
                // TODO: scroll issue when more than 3
                <div className="flex gap-1">
                  {socialLinks.map((item) => (
                    <div key={item.id} className="shrink-0">
                      <SocialLink item={item} />
                    </div>
                  ))}
                </div>
              ) : (
                <li className="text-sm text-muted-foreground">Social links coming soon.</li>
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="max-xl:order-1">
            {children}
          </motion.div>
        </div>
      </motion.div>
    </footer>
  )
}

function PhoneNumbers({
  phoneNumbers,
}: {
  phoneNumbers?:
    | {
        phoneNumber?: string | null
        id?: string | null
      }[]
    | null
}) {
  if (!phoneNumbers || phoneNumbers.length === 0) return null

  return (
    <div className="space-y-1">
      {phoneNumbers.map(({ phoneNumber, id }) => {
        if (!phoneNumber) return null
        return (
          <p key={id}>
            <a href={`tel:${phoneNumber}`} className="underline">
              {phoneNumber}
            </a>
          </p>
        )
      })}
    </div>
  )
}

function capitalizeFirst(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Parses formats like "9AM", "1PM", "6:30PM" into a decimal hour (0-23.99)
function parseTimeString(time: string): number {
  const match = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i)
  if (!match) return NaN

  const [, hourStr, minuteStr, period] = match
  let hour = parseInt(hourStr, 10)
  const minute = minuteStr ? parseInt(minuteStr, 10) : 0

  if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12
  if (period.toUpperCase() === 'AM' && hour === 12) hour = 0

  return hour + minute / 60
}

type DayHours = { day: string; open: string; close: string }

function getTodayStatusMessage(hours: DayHours[] | undefined): string {
  const todayName = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase()

  const today = hours?.find((h) => h.day === todayName)

  if (!today) {
    return 'Closed today.'
  }

  const now = new Date()
  const currentHour = now.getHours() + now.getMinutes() / 60
  const openHour = parseTimeString(today.open)
  const closeHour = parseTimeString(today.close)

  const isOpen = currentHour >= openHour && currentHour < closeHour

  return isOpen
    ? `Open now — closes today at ${today.close}.`
    : currentHour < openHour
      ? `Closed for now — opens today at ${today.open}.`
      : `Closed for the day — opens tomorrow.`
}
