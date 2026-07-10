'use client'

import { useMediaQuery } from 'usehooks-ts'

export function isMobile(breakingPoint: string = '(max-width: 640px)') {
  return useMediaQuery(breakingPoint)
}

export function isDesktop(breakingPoint: string = '(min-width: 1280px)') {
  return useMediaQuery(breakingPoint)
}

export function isLargeScreen(breakingPoint: string = '(min-width: 1580px)') {
  return useMediaQuery(breakingPoint)
}
