'use client'

import { useTheme } from '@wrksz/themes/client'
import Link from 'next/link'

export default function BrandImage() {
  const { resolvedTheme } = useTheme()
  const imagePath = resolvedTheme === 'dark' ? '/media/images/wearjmk-logo-dark.jpg' : '/media/images/wearjmk-logo.jpg'

  return (
    <div className="relative">
      <Link href={'/'}>
        {/*<Image src={imagePath} alt="Brand Image" fill className="object-cover" loading="eager" />
         */}
        <div className="size-8 bg-black rounded"></div>
      </Link>
    </div>
  )
}
