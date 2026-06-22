'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

import type { Theme, ThemeContextType } from './types'

import { canUseDOM } from '@/utilities/canUseDOM'
import { defaultTheme, getImplicitPreference, themeLocalStorageKey } from './shared'
import { themeIsValid } from './types'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

const applyThemeToDocument = (themeToSet: Theme): void => {
  document.documentElement.setAttribute('data-theme', themeToSet)
  document.documentElement.classList.toggle('dark', themeToSet === 'dark')
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme | undefined>(() => {
    if (!canUseDOM) return undefined

    const currentTheme = document.documentElement.getAttribute('data-theme')
    return themeIsValid(currentTheme) ? currentTheme : undefined
  })

  const setTheme = useCallback((themeToSet: Theme | null) => {
    let resolvedTheme: Theme = defaultTheme

    if (themeToSet === null) {
      window.localStorage.removeItem(themeLocalStorageKey)
      const implicitPreference = getImplicitPreference()
      resolvedTheme = implicitPreference ?? defaultTheme
    } else {
      resolvedTheme = themeToSet
      window.localStorage.setItem(themeLocalStorageKey, themeToSet)
    }

    setThemeState(resolvedTheme)
    applyThemeToDocument(resolvedTheme)
  }, [])

  useEffect(() => {
    let themeToSet: Theme = defaultTheme
    const preference = window.localStorage.getItem(themeLocalStorageKey)

    if (themeIsValid(preference)) {
      themeToSet = preference
    } else {
      const implicitPreference = getImplicitPreference()

      if (implicitPreference) {
        themeToSet = implicitPreference
      }
    }

    applyThemeToDocument(themeToSet)
    setThemeState(themeToSet)
  }, [])

  return <ThemeContext.Provider value={{ setTheme, theme }}>{children}</ThemeContext.Provider>
}

export const useTheme = (): ThemeContextType => useContext(ThemeContext)
