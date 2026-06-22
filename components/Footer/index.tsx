import type { Footer } from '@/payload-types'

import { FooterClient } from './index.client'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { RenderBlocks } from '@/blocks/RenderBlocks'

export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 1)()

  const payload = await getPayload({
    config: configPromise,
  })

  const result = await payload.find({
    collection: 'quick-links',
    pagination: false,
    overrideAccess: false,
  })
  return (
    <div className="flex flex-col lg:flex-row *:min-h-[90vh]">
      {/* Left panel — brand, map tabs, copyright */}
      <FooterClient footer={footer} quickLinks={result.docs} />
      {/* We gonna use PromoSlug to Fetch the Product to show  */}
      {/* Right panel — discount slider */}
      <div className="flex-1 max-lg:order-1 lg:order-2 p-10 flex flex-col gap-6 bg-secondary">
        <div>
          <h1 className="text-3xl font-medium">{footer.promoLabel}</h1>
          <p className="text-sm text-muted-foreground mt-1">{footer.promoDescription}</p>
        </div>

        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-100 self-stretch rounded-2xl">
            <RenderBlocks blocks={footer.layout} />
          </div>
        </div>
      </div>
    </div>
  )
}
