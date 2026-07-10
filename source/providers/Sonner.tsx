'use client'

import { useTheme } from '@wrksz/themes/client'
import { Toaster } from 'sonner'

export const SonnerProvider = ({ children }: { children?: React.ReactNode }) => {
  const { theme } = useTheme()

  return (
    <>
      {children}

      <Toaster richColors position="bottom-left" theme={theme || 'light'} />
    </>
  )
}
