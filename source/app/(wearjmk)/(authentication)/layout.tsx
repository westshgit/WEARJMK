import BrandImage from '@/components/BrandImage'
import SocialLink from '@/components/SocialLink'
import { Support } from '@/components/Support'
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from '@/lib/client.env'
import { Social } from '@/payload-types'
import { ThemeModeSelector } from '@/providers'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { unstable_cache } from 'next/cache'
import Image from 'next/image'

function randomItem(items: readonly string[]) {
  const random = Math.floor(Math.random() * items.length)
  return items[random]
}

const authenticationBackgroundImages = ['/media/IMG_6383.JPG', '/media/IMG_6377.JPG', '/media/IMG_6373.JPG'] as const

const getBG = unstable_cache(async () => randomItem(authenticationBackgroundImages), ['authentication-background-image'], {
  revalidate: 60 * 60,
})

export default async function AuthenticationLayout({ children }: { children: React.ReactNode }) {
  const social = (await getCachedGlobal('social', 1)()) as Social
  const imgSrcPath = await getBG()

  return (
    <>
      <main className="min-h-[calc(100vh-60px)] relative">
        <div className="p-4 absolute z-10">
          <BrandImage />
        </div>
        <Image fill className="object-cover" src={imgSrcPath} alt="WearJMK background image" loading="eager" />
        <div className="absolute inset-0 bg-linear-to-b from-white/5 via-white/0 to-white/30 dark:from-black/85 dark:via-black/55 dark:to-black/80">
          {children}
        </div>
      </main>
      <AuthenticationFooter social={social} />
    </>
  )
}

function AuthenticationFooter({ social }: { social?: Social }) {
  const items = social?.socialLinks ?? []
  const currentYear = new Date().getFullYear()
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '')

  return (
    <div className="relative flex flex-col gap-3 space-y-4 border-t py-8 px-4 md:p-4 shadow md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <BrandImage />
        <span className="hidden md:inline">|</span>
        <h6 className="flex items-center gap-1">
          <span>&copy;</span>
          <span>{copyrightDate}</span> <span>All rights reserved.</span>
        </h6>
      </div>

      <div className="block space-y-9 md:space-y-0 md:flex md:items-center md:gap-6">
        <div className="min-w-64 space-y-4 md:space-y-0">
          <h6 className="text-xl md:hidden">Social</h6>

          <ul className="flex md:items-center gap-2 flex-col md:flex-row">
            {items.length > 0 ? (
              items.map((item) => (
                <li key={item.id}>
                  <SocialLink item={item} />
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">Social links coming soon.</li>
            )}
          </ul>
        </div>
        <div className="flex md:items-center flex-col md:flex-row gap-4 md:gap-2">
          <Support email={SUPPORT_EMAIL} whatsapp={SUPPORT_WHATSAPP} mode="warm" showLabel={true} />
          <ThemeModeSelector />
        </div>
      </div>
    </div>
  )
}
