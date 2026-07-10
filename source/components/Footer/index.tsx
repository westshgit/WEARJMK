import type { Footer, Social } from '@/payload-types'

import { getCachedGlobal } from '@/utilities/getGlobals'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { FooterClient } from './index.client'

export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 2)()
  const social: Social = await getCachedGlobal('social', 1)()
  const discount: Footer['discount'] = footer.discount || null
  const locations: Footer['locations'] = footer.locations || []
  const navItems = footer.navItems || []
  const socialLinks = social.socialLinks || []

  return (
    <FooterClient socialLinks={socialLinks} navItems={navItems} locations={locations}>
      {discount ? (
        <div className="**:data-[slot=carousel-item]:lg:w-1/2!">
          <RenderBlocks blocks={discount?.layout} />
        </div>
      ) : null}
    </FooterClient>
  )
}
