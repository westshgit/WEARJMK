import { ThemeProvider as WrkszThemesProvider } from '@wrksz/themes/next'

export * from './selector'
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof WrkszThemesProvider>) {
  return <WrkszThemesProvider {...props}>{children}</WrkszThemesProvider>
}
