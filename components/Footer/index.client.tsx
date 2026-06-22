'use client'
import type { Footer, QuickLink } from '@/payload-types'
import { useState } from 'react'
import { Link } from '@payloadcms/ui'
import { BrandWordmark } from '../Header/BrandWordmark'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RiFileCopy2Fill, RiNotification2Fill } from '@remixicon/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { FooterMenu } from './menu'

const { COMPANY_NAME, SITE_NAME } = process.env

export function FooterClient({ quickLinks, footer }: { quickLinks: QuickLink[]; footer: Footer }) {
  const currentYear = new Date().getFullYear()
  const copyrightDate = 2017 + (currentYear > 2017 ? `-${currentYear}` : '')
  const copyrightName = COMPANY_NAME || SITE_NAME || 'WearJMK'

  return (
    <div className="flex-1 max-lg:order-2 lg:order-1 p-10 flex flex-col gap-8">
      {/* Brand */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <BrandWordmark />
        </Link>
        <Dialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button size="lg" className="w-fit cursor-pointer">
                  <RiNotification2Fill />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <span>Notify me of new products</span>
            </TooltipContent>
          </Tooltip>

          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Stay in the loop</DialogTitle>
              <p className="text-sm text-muted-foreground">Drop your details and we'll let you know the moment new pieces land.</p>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notify-name">Name</Label>
                <Input id="notify-name" placeholder="Your name" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notify-email">Email</Label>
                <Input id="notify-email" type="email" placeholder="you@example.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notify-phone">Phone number</Label>
                <Input id="notify-phone" type="tel" placeholder="+234 800 000 0000" />
              </div>
              <Button className="w-full mt-2">Notify me</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Store locations */}
      {footer?.address && footer.address.length > 0 ? (
        <Tabs defaultValue={footer.address[0].label} className="w-full max-w-sm mx-auto">
          <TabsList className="w-full">
            {footer.address.map((address) => (
              <TabsTrigger value={address.label} className="flex-1 cursor-alias" key={address.label}>
                {address.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {footer.address.map((address) => (
            <TabsContent key={address.label} value={address.label} className="p-4">
              <div>
                <div className="flex items-center">
                  <p>{address.address}</p>
                  <CopyAddressButton address={address.address} />
                </div>
                <p>{address.time}</p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : null}

      <div className="flex-1 p-8 bg-secondary rounded-2xl flex flex-col">
        <h4 className="text-2xl">Reach out to us</h4>
        <p className="mb-4 text-xs">Sign up for our newsletter and enjoy 10% off your first order.</p>
        <div className="flex-1 flex items-center">
          <div className="flex items-center justify-center w-full">
            <div className="max-w-xl w-full relative text-center space-y-2  md:block">
              <Input className="bg-primary text-primary-foreground h-12 w-full" placeholder="Enter your email" />
              <Button className="w-36 md:absolute md:right-0 md:top-1.5  cursor-pointer">Continue</Button>
            </div>
          </div>
        </div>
      </div>

      <FooterMenu quickLinks={quickLinks} />
      {/* Notify + copyright — pinned to bottom */}
      <div className="mt-auto flex flex-col gap-6">
        <div className="text-sm text-muted-foreground flex flex-col gap-1">
          <p>
            &copy; {copyrightDate} {copyrightName} All rights reserved
          </p>
          <p>
            Designed by <span className="font-bold text-primary-foreground">{footer.developerName}</span> &mdash;{' '}
            <a className="underline text-foreground" href={`mailto:${footer.developerEmail}`}>
              Reach out
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function CopyAddressButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button onClick={handleCopy} variant={'ghost'} size={'lg'}>
          <RiFileCopy2Fill /> {copied ? 'Copied!' : 'Copy'}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span>Copy address to clipboard</span>
      </TooltipContent>
    </Tooltip>
  )
}
