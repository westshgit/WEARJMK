'use server'
import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'
import { getUserServer } from '@/lib/api/user.api'
import { CallToActionBlockClient } from './Component.client'

export const CallToActionBlock: React.FC<
  CTABlockProps & {
    id?: string | number
    className?: string
  }
> = async (props) => {
  const user = await getUserServer()

  return <CallToActionBlockClient {...props} user={user} />
}
