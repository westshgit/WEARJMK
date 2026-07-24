"use client"

import BrandImage from '@/components/BrandImage'
import { RiInstagramLine, RiFacebookFill, RiTiktokLine } from '@remixicon/react'

export const knownSocialIcon = {
  instagram: (
    <span className="text-red-600">
      <RiInstagramLine />
    </span>
  ),
  facebook: (
    <span className="text-blue-600">
      <RiFacebookFill />
    </span>
  ),
  tiktok: (
    <span className="text-black dark:text-white">
      <RiTiktokLine />
    </span>
  ),
  wearjmk: (
    <span>
      <BrandImage />
    </span>
  ),
}
